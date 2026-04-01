import { releaseChangelog, releaseVersion } from 'nx/release';
import { execSync } from 'node:child_process';

const ENV = process.env.RELEASE_ENV; // dev | qa | staging | prod
if (!ENV) {
  console.error('RELEASE_ENV is required');
  process.exit(1);
}

const isProduction = ENV === 'prod';
const PROJECTS = ['users2-backend', 'manage2-backend', 'admin2-backend'];

const PREV_ENV: Record<string, string> = {
  qa: 'dev',
  staging: 'qa',
  prod: 'staging',
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

if (ENV === 'dev') {
  // Development: calculate version from conventional commits
  const { projectsVersionData } = await releaseVersion({
    dryRun: false,
    gitCommit: false,
    gitTag: false,
    stageChanges: false,
  });

  for (const [project, data] of Object.entries(projectsVersionData)) {
    const version = data.newVersion ?? data.currentVersion;
    if (!version) continue;

    const tag = `dev-${project}@${version}`;
    console.log(`Tagging: ${tag}`);
    execSync(`git tag ${tag}`);
  }

  execSync('git push --tags');
} else {
  // QA / Staging / Prod: promote version from previous environment
  const prevEnv = PREV_ENV[ENV];
  const tags: string[] = [];

  for (const project of PROJECTS) {
    const version = getLatestEnvTag(prevEnv, project);
    if (!version) {
      console.log(`No ${prevEnv}-${project}@* tag found, skipping.`);
      continue;
    }

    const tag = `${ENV}-${project}@${version}`;
    console.log(`Promoting: ${prevEnv}-${project}@${version} → ${tag}`);
    execSync(`git tag ${tag}`);
    tags.push(tag);
  }

  // Prod only: changelog + GitHub release
  if (isProduction && tags.length > 0) {
    const versionData: Record<string, { currentVersion: string; newVersion: string }> = {};

    for (const project of PROJECTS) {
      const newVersion = getLatestEnvTag('staging', project);
      const prevProdVersion = getLatestEnvTag('prod', project);

      if (newVersion && newVersion !== prevProdVersion) {
        versionData[project] = {
          currentVersion: prevProdVersion ?? '0.0.0',
          newVersion,
        };
      }
    }

    if (Object.keys(versionData).length > 0) {
      await releaseChangelog({
        versionData,
        gitCommit: false,
        gitTag: false,
      });
    }
  }

  execSync('git push --tags');
}
