# Release tags and versioning

## Dual-tag strategy

Nx resolves versions from **canonical** tags: `{projectName}@{version}` (for example `users2-backend@2.0.0`). CI promotion uses **environment-prefixed** tags: `dev-{project}@{version}`, `qa-{project}@{version}`, and so on.

The dev workflow runs `nx release` programmatically (`releaseVersion`), commits and tags canonical versions, then adds `dev-*` tags and pushes once.

## One-time migration (existing repositories)

Before the first successful run after this change:

1. **Canonical tags must exist** for each app’s current version, matching `releaseTag.pattern` in `nx.json` (`{projectName}@{version}`), **or** you must use a fallback.

2. If you only have historical `dev-*` tags and no `project@version` tags, `nx release version` will fail with “No git tags matching pattern …”. Fix by either:
   - Creating tags at the current `HEAD` for each package version in `apps/<app>/package.json`, for example:
     - `git tag users2-backend@0.1.0 <commit>`
     - `git tag manage2-backend@0.1.0 <commit>`
     - `git tag admin2-backend@0.1.0 <commit>`
     - `git push --follow-tags`
   - Or running once with `--first-release` (see `nx release version --help`) when appropriate.

3. After migration, prefer **canonical** tags as the source of truth for current version; `dev-*` tags remain for **promotion** only.

## Conventional commits and scoped bumps

Restoring git-tag resolution fixes version alignment with tags; it does **not** by itself guarantee that only one app gets a semver bump when merge commits are used. After deploying this flow, validate in a test branch that bumps match expectations. If not, consider squash merges, Nx [version plans](https://nx.dev/features/manage-releases), or stricter commit scopes.

## CI: release commits

`development.yml` treats commits whose message starts with `chore(release):` as release commits (skip build matrix). The configured message is `chore(release): {projectName}@{version} [no ci]`, which still matches that prefix.
