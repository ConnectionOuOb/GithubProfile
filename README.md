# GitHub Profile

Unified GitHub profile card — stats and contribution streak in one modern SVG.

## Preview

```md
![Profile Card](https://raw.githubusercontent.com/ConnectionOuOb/GithubProfile/gh-pages/card.svg)
```

Cross-repo embed (replace `YOUR_USER`):

```md
![Profile Card](https://raw.githubusercontent.com/YOUR_USER/GithubProfile/gh-pages/card.svg)
```

> `profile/card.svg` is gitignored on `main`. Actions publishes to the **`gh-pages`** branch — no more merge conflicts.

---

## 設定（只需 PAT）

**本地：** 複製 `.env.example` → `.env`，只填一行：

```env
GITHUB_TOKEN=ghp_你的PAT
```

```bash
npm install
npm run generate   # 本地預覽用，不要 commit
npm run preview    # mock 預覽
```

**GitHub Actions：** Repo → Settings → Secrets → `PROFILE_PAT` = 同一支 PAT。

PAT 權限：Classic 勾選 `read:user` + `repo`（含私有統計）。

---

## Options

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | — | PAT |
| `GITHUB_USERNAME` | 自動 | 僅在要查別人時才填 |
| `OUTPUT_PATH` | `profile/card.svg` | 輸出路徑 |
| `SHOW_REVIEWS` | `false` | 顯示 PR review 數 |
| `LANGS_COUNT` | `20` | Top Languages 顯示數量（1–20） |
| `HIDE_LANGUAGES` | `JavaScript` | 額外隱藏的語言（逗號分隔；HTML/CSS 等 markup 預設已排除） |
| `EXCLUDE_REPOS` | — | 逗號分隔，不計入語言統計的 repo 名稱 |
