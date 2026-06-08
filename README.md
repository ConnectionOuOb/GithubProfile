# GitHub Profile

Unified GitHub profile card — stats and contribution streak in one modern SVG.

## Preview

```md
![Profile Card](./profile/card.svg)
```

Cross-repo embed:

```md
![Profile Card](https://raw.githubusercontent.com/YOUR_USER/GithubProfile/main/profile/card.svg)
```

---

## 設定（只需 PAT）

**本地：** 複製 `.env.example` → `.env`，只填一行：

```env
GITHUB_TOKEN=ghp_你的PAT
```

帳號會**自動從 PAT 辨識**，不必手填 `GITHUB_USERNAME`。

```bash
npm install
npm run generate
```

**GitHub Actions：** Repo → Settings → Secrets → `PROFILE_PAT` = 同一支 PAT。帳號同樣自動辨識。

PAT 權限：Classic 勾選 `read:user` + `repo`（含私有統計）。

---

## Commands

```bash
npm run preview    # mock 預覽
npm run generate   # 真實資料（需 .env）
```

## Options

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | — | PAT |
| `GITHUB_USERNAME` | 自動 | 僅在要查別人時才填 |
| `OUTPUT_PATH` | `profile/card.svg` | 輸出路徑 |
| `SHOW_REVIEWS` | `false` | 顯示 PR review 數 |
