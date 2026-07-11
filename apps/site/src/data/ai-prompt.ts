/**
 * AI 提示词 — 供站点展示与消费者仓库复制给 Cursor / Claude / ChatGPT
 */
import { DOCS_ROUTE_PREFIX } from "../sitePaths";

/** 应用内文档路由（不含 GitHub Pages base；链接处需 `sitePath()`） */
export const AI_PROMPT_DOC_PATH = `${DOCS_ROUTE_PREFIX}/tools/ai-prompt`;

/** 各语言一行版（盘古 dev + 青鸟 release） */
export const AI_PROMPT_ONE_LINERS = {
    en: 'Install @systembug/pangu and @systembug/qingniao (and @changesets/cli for release). Add to root package.json scripts: "dev": "pangu", "release": "qingniao". Create pangu.config.json with my workspace demos. Then tell me to run pnpm dev and pnpm release.',
    zh: '在本 monorepo 安装 @systembug/pangu 与 @systembug/qingniao（发布还需 @changesets/cli）。在根 package.json 添加脚本："dev": "pangu"、"release": "qingniao"。创建 pangu.config.json 配置 workspace demo。完成后告诉我运行 pnpm dev 与 pnpm release。',
    ja: 'この monorepo に @systembug/pangu と @systembug/qingniao（リリースには @changesets/cli も）を導入。ルート package.json に "dev": "pangu"、"release": "qingniao" を追加。pangu.config.json で workspace デモを設定。pnpm dev と pnpm release を実行するよう指示してください。',
    ko: '이 monorepo에 @systembug/pangu와 @systembug/qingniao(릴리스는 @changesets/cli 포함)를 설치하고, 루트 package.json scripts에 "dev": "pangu", "release": "qingniao"를 추가하세요. pangu.config.json에 workspace 데모를 설정한 뒤 pnpm dev와 pnpm release를 실행하라고 안내해 주세요.',
} as const;

/** 各语言完整版（Rules / AGENTS.md） */
export const AI_PROMPT_FULL = {
    en: `Set up @systembug/pangu and @systembug/qingniao in this monorepo:

1. pnpm add -D @systembug/pangu @systembug/qingniao @changesets/cli
2. Root package.json scripts: "dev": "pangu", "release": "qingniao"
3. pangu.config.json — demos with workspace package names that have "dev" scripts
4. Optional: qingniao.config.json { "publish": { "skipExisting": true } }
5. Release once: npx qingniao changeset-init

Run: pnpm dev (or pnpm dev <demo>) | pnpm release -y (needs .changeset/*.md + npm login; OTP in terminal)

Never pnpm dev dev. Do not start dev server unless I ask.`,
    zh: `在本 monorepo 配置 @systembug/pangu 与 @systembug/qingniao：

1. pnpm add -D @systembug/pangu @systembug/qingniao @changesets/cli
2. 根 package.json scripts："dev": "pangu"、"release": "qingniao"
3. pangu.config.json — 用带 "dev" 脚本的 workspace 包名配置 demo
4. 可选：qingniao.config.json { "publish": { "skipExisting": true } }
5. 首次发布：npx qingniao changeset-init

运行：pnpm dev（或 pnpm dev <demo>）| pnpm release -y（需 .changeset/*.md + npm login；OTP 在终端输入）

禁止 pnpm dev dev。除非我要求，不要启动 dev server。`,
    ja: `この monorepo に @systembug/pangu と @systembug/qingniao をセットアップしてください：

1. pnpm add -D @systembug/pangu @systembug/qingniao @changesets/cli
2. ルート package.json scripts: "dev": "pangu", "release": "qingniao"
3. pangu.config.json — "dev" スクリプトを持つ workspace パッケージ名でデモを設定
4. 任意: qingniao.config.json { "publish": { "skipExisting": true } }
5. 初回リリース: npx qingniao changeset-init

実行: pnpm dev（または pnpm dev <demo>）| pnpm release -y（.changeset/*.md + npm login が必要、OTP はターミナル）

pnpm dev dev は禁止。依頼がない限り dev サーバーを起動しないこと。`,
    ko: `이 monorepo에 @systembug/pangu와 @systembug/qingniao를 설정하세요:

1. pnpm add -D @systembug/pangu @systembug/qingniao @changesets/cli
2. 루트 package.json scripts: "dev": "pangu", "release": "qingniao"
3. pangu.config.json — "dev" 스크립트가 있는 workspace 패키지 이름으로 데모 구성
4. 선택: qingniao.config.json { "publish": { "skipExisting": true } }
5. 최초 릴리스: npx qingniao changeset-init

실행: pnpm dev(또는 pnpm dev <demo>) | pnpm release -y(.changeset/*.md + npm login 필요, OTP는 터미널)

pnpm dev dev 금지. 요청하지 않으면 dev 서버를 시작하지 마세요.`,
} as const;

export type AiPromptLocale = keyof typeof AI_PROMPT_ONE_LINERS;

/** 默认英文一行版（测试与回退） */
export const AI_PROMPT_ONE_LINER = AI_PROMPT_ONE_LINERS.en;

/** 按当前语言解析一行提示词 */
export function getAiPromptOneLiner(language: string): string {
    const base = language.split("-")[0] as AiPromptLocale;
    return AI_PROMPT_ONE_LINERS[base] ?? AI_PROMPT_ONE_LINERS.en;
}

/** 按当前语言解析完整提示词 */
export function getAiPromptFull(language: string): string {
    const base = language.split("-")[0] as AiPromptLocale;
    return AI_PROMPT_FULL[base] ?? AI_PROMPT_FULL.en;
}
