import { releaseChangelog, releaseVersion } from 'nx/release';

import { execSync } from 'node:child_process';

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

async function releaseDev(): Promise<void> {
  const { projectsVersionData } = await releaseVersion({
    dryRun: false,
    gitCommit: false,
    gitTag: false,
    stageChanges: false,
  });

  let created = 0;
  for (const [project, data] of Object.entries(projectsVersionData)) {
    const version = data.newVersion ?? data.currentVersion;
    if (!version) continue;
    if (createTag(`dev-${project}@${version}`)) created++;
  }

  if (created > 0) {
    execSync('git push --tags');
  } else {
    console.log('No new dev tags to push.');
  }
}

async function promoteEnv(): Promise<void> {
  const prevEnv = PREV_ENV[ENV!];
  let created = 0;

  for (const project of PROJECTS) {
    const version = getLatestEnvTag(prevEnv, project);
    if (!version) {
      console.log(`No ${prevEnv}-${project}@* tag found, skipping.`);
      continue;
    }

    const tag = `${ENV}-${project}@${version}`;
    console.log(`Promoting: ${prevEnv}-${project}@${version} → ${tag}`);
    if (createTag(tag)) created++;
  }

  // Prod only: changelog + GitHub release
  if (ENV === 'prod') {
    await generateProdChangelog();
  }

  if (created > 0) {
    execSync('git push --tags');
  } else {
    console.log(`No new ${ENV} tags to push.`);
  }
}

async function generateProdChangelog(): Promise<void> {
  const versionData: Record<string, { currentVersion: string; newVersion: string }> = {};

  for (const project of PROJECTS) {
    const newVersion = getLatestEnvTag('stg', project);
    const prevProdVersion = getLatestEnvTag('prod', project);

    if (newVersion && newVersion !== prevProdVersion) {
      versionData[project] = {
        currentVersion: prevProdVersion ?? '0.0.0',
        newVersion,
      };
    }
  }

  if (Object.keys(versionData).length > 0) {
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
