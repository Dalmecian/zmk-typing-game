# ZMK Typing Game

完全ローカルで動く AroundForty / ZMK keymap 練習用タイピングゲームです。

## Setup

このプロジェクトは pnpm を使います。

```sh
corepack enable
pnpm install
pnpm dev
```

依存解決のサプライチェーン対策として、公開から7日以上経った npm package のみを解決する設定を入れています。

- npm: `.npmrc` の `min-release-age=7`
- pnpm: `pnpm-workspace.yaml` の `minimumReleaseAge: 10080`

npm の `min-release-age` は npm v11.10.0 以降、pnpm の `minimumReleaseAge` は pnpm v10.16.0 以降が必要です。

## Usage

1. `/Users/dalmecian/Develop/zmk-config-AroundFortyRB/config/AroundForty-RB.json` を物理配置 JSON として読み込む。
2. `/Users/dalmecian/Develop/zmk-config-AroundFortyRB/config/AroundForty-RB.keymap` を ZMK keymap として読み込む。
3. `英字+記号` または `日本語ローマ字` の練習を開始する。

## GitHub Pages

このアプリは静的ファイルだけで動くため、GitHub Pages にそのままデプロイできます。

1. GitHub で `zmk-typing-game` リポジトリを作成する。
2. ローカルリポジトリに remote を追加して `main` に push する。
3. GitHub の `Settings > Pages > Build and deployment` で Source を `GitHub Actions` にする。
4. `Deploy to GitHub Pages` workflow が成功したら、`https://<owner>.github.io/zmk-typing-game/` を開く。

Vite の `base` は repository Pages 用に `/zmk-typing-game/` にしています。カスタムドメインや `<owner>.github.io` 直下で公開する場合は `vite.config.ts` の `base` を `/` に変更してください。

iPhone から使う場合は、Safari で Pages URL を開き、Files / iCloud Drive に置いた `AroundForty-RB.json` と `AroundForty-RB.keymap` をファイル選択で読み込んでください。選択した内容はブラウザ内で処理され、サーバへ送信しません。
