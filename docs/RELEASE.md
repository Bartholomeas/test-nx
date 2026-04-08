# Release tags and versioning

## Dual-tag strategy

Nx resolves versions from **canonical** tags: `{projectName}@{version}` (for example `users2-backend@2.0.0`). CI adds **environment-prefixed** tags for promotion: `dev-{project}@{version}`, `qa-{project}@{version}`, and later `stg-*` / `prod-*` when those workflows exist.

- **Branch `development`:** [`release.yml`](../.github/workflows/release.yml) runs [`tools/release.mts`](../tools/release.mts) with `RELEASE_ENV=dev`. Nx `releaseVersion` commits and creates canonical tags, then the script adds `dev-*` tags and pushes once.
- **Branch `qa`:** Same reusable workflow with `RELEASE_ENV=qa`. The script **promotes** semver from the latest `dev-{project}@*` tags and creates `qa-{project}@{version}` (no new semver from commits on QA).

Staging and production promotion (`stg-*`, `prod-*`, prod changelog) are planned; the script already supports `stg` and `prod`, but dedicated GitHub workflows are not wired yet.

## One-time migration (existing repositories)

Before the first successful run after this change:

1. **Canonical tags must exist** for each app’s current version, matching `releaseTag.pattern` in `nx.json` (`{projectName}@{version}`), **or** you must use `--first-release` / disk fallback where appropriate.

2. If you only have historical `dev-*` tags and no `project@version` tags, `nx release version` will fail with “No git tags matching pattern …”. Fix by either:
   - Creating tags at the appropriate commit for each package version in `apps/<app>/package.json`, then `git push --follow-tags`
   - Or running once with `--first-release` (see `nx release version --help`) when appropriate.

3. After migration, **canonical** tags are the source of truth for Nx versioning; `dev-*` / `qa-*` track **which version is deployed to which environment**.

## Conventional commits and scoped bumps

Git-tag resolution aligns versions with tags; it does **not** alone guarantee per-app bumps when merge commits are noisy. After deploying this flow, validate in a test branch. If needed, consider squash merges, Nx [version plans](https://nx.dev/features/manage-releases), or stricter commit scopes.

## CI: release commits

[`development.yml`](../.github/workflows/development.yml) and [`qa.yml`](../.github/workflows/qa.yml) treat commits whose message starts with `chore(release):` as release commits and **skip** the build matrix (same idea as skipping redundant builds when the only change is version manifests). The Nx-generated message is `chore(release): bump package versions [no ci]` (see `nx.json` `release.version.git.commitMessage`).

## More apps (Portal, Manage, Admin, etc.)

This repo currently versions three Nx apps listed in `release.projects` and `PROJECTS` in `tools/release.mts`. Adding more projects requires updating both places and `nx.json`.
