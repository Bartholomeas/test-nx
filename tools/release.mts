import { releaseChangelog, releaseVersion } from 'nx/release';

import { execFileSync, execSync } from 'node:child_process';

const ENV = process.env['RELEASE_ENV']; // dev | qa | stg | prod
if (!ENV) {
  console.error('RELEASE_ENV is required');
  process.exit(1);
}

const PROJECTS = ['users2-backend', 'manage2-backend', 'admin2-backend'];

const PREV_ENV: Record<string, string> = {
  qa: 'dev',
  stg: 'qa',
  prod: 'stg',
};

function getLatestEnvTag(envPrefix: string, project: string): string | null {
  try {
    const tag = execSync(`git tag -l "${envPrefix}-${project}@*" --sort=-v:refname`, {
      encoding: 'utf-8',
    })
      .trim()
      .split('\n')[0];

    if (!tag) return null;

    const match = tag.match(/@(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function tagExists(tag: string): boolean {
  try {
    return execSync(`git tag -l "${tag}"`, { encoding: 'utf-8' }).trim() === tag;
  } catch {
    return false;
  }
}

function createTag(tag: string): boolean {
  if (tagExists(tag)) {
    console.log(`Tag already exists, skipping: ${tag}`);
    return false;
  }
  console.log(`Creating tag: ${tag}`);
  execSync(`git tag ${tag}`);
  return true;
}

/** Lightweight env tags are not reliably pushed by `git push --follow-tags` (Nx uses annotated tags). */
function pushTagRefsToOrigin(tagNames: string[]): void {
  if (tagNames.length === 0) return;
  const refs = tagNames.map((t) => `refs/tags/${t}`);
  execFileSync('git', ['push', 'origin', ...refs], { stdio: 'inherit' });
}

function getHead(): string {
  return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
}

async function releaseDev(): Promise<void> {
  const headBefore = getHead();

  const { projectsVersionData } = await releaseVersion({
    dryRun: false,
    // Push only after we add dev-* tags (same remote update as Nx commit + canonical tags)
    gitPush: false,
  });

  const newDevTags: string[] = [];
  for (const [project, data] of Object.entries(projectsVersionData)) {
    const version = data.newVersion ?? data.currentVersion;
    if (!version) continue;
    const name = `dev-${project}@${version}`;
    if (createTag(name)) newDevTags.push(name);
  }

  const headAfter = getHead();
  const nxCommitted = headBefore !== headAfter;

  if (nxCommitted || newDevTags.length > 0) {
    execSync('git push --follow-tags', { stdio: 'inherit' });
    pushTagRefsToOrigin(newDevTags);
  } else {
    console.log('No version changes and no new dev tags; nothing to push.');
  }
}

async function promoteEnv(): Promise<void> {
  const prevEnv = PREV_ENV[ENV as keyof typeof PREV_ENV];
  const newPromoTags: string[] = [];

  // Prod only: changelog + GitHub release.
  // Must run before creating prod-* tags; otherwise prevProdVersion == newVersion.
  if (ENV === 'prod') {
    await generateProdChangelog();
  }

  for (const project of PROJECTS) {
    const version = getLatestEnvTag(prevEnv, project);
    if (!version) {
      console.log(`No ${prevEnv}-${project}@* tag found, skipping.`);
      continue;
    }

    const tag = `${ENV}-${project}@${version}`;
    console.log(`Promoting: ${prevEnv}-${project}@${version} → ${tag}`);
    if (createTag(tag)) newPromoTags.push(tag);
  }

  if (newPromoTags.length > 0) {
    pushTagRefsToOrigin(newPromoTags);
  } else {
    console.log(`No new ${ENV} tags to push.`);
  }
}

async function generateProdChangelog(): Promise<void> {
  const versionData: Record<
    string,
    { currentVersion: string; newVersion: string; dependentProjects: [] }
  > = {};
  let hasChanges = false;

  for (const project of PROJECTS) {
    const newVersion = getLatestEnvTag('stg', project);
    const prevProdVersion = getLatestEnvTag('prod', project);

    // Nx changelog expects versionData to align with the configured release projects.
    // Include all projects with stg tags, and gate execution via hasChanges.
    if (!newVersion) continue;
    versionData[project] = {
      currentVersion: prevProdVersion ?? '0.0.0',
      newVersion,
      dependentProjects: [],
    };
    if (newVersion !== prevProdVersion) hasChanges = true;
  }

  if (Object.keys(versionData).length > 0 && hasChanges) {
    console.log('Generating changelog for production release...');
    await releaseChangelog({
      versionData,
      gitCommit: false,
      gitTag: false,
    });
  } else {
    console.log('No version changes for production changelog.');
  }
}

// --- Main ---
if (ENV === 'dev') {
  await releaseDev();
} else {
  await promoteEnv();
}
