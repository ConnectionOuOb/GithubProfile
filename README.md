# GitHub Profile

Unified GitHub profile card — stats and contribution streak in one modern SVG.

## Preview

```md
![Profile Card](./profile/card.svg)
```

## How it works

```
GitHub GraphQL API
       │
       ├── stats/     stars, commits, PRs, issues
       ├── streak/    contribution calendar → streak algorithm
       └── render/    modern SVG card
```

| Module | Role |
|--------|------|
| `src/github/` | Fetch user data via GraphQL |
| `src/stats/` | Extract repository & activity stats |
| `src/streak/` | Compute contribution streaks |
| `src/render/` | Generate the SVG card |

## Local development

```bash
npm install
npm run preview        # mock data → profile/card.svg
cp .env.example .env   # add your token & username
npm run generate       # real data from GitHub API
```

## GitHub Actions

The workflow in `.github/workflows/generate-profile.yml` regenerates `profile/card.svg` daily using `GITHUB_TOKEN`. For private contribution data, add a PAT as a repository secret and update the workflow.

## Options

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_USERNAME` | — | GitHub username |
| `GITHUB_TOKEN` | — | Personal access token |
| `OUTPUT_PATH` | `profile/card.svg` | Output file path |
| `SHOW_REVIEWS` | `false` | Show PR review count |
