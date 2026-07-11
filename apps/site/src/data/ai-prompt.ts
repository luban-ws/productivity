/**
 * AI 提示词 — 供站点展示与消费者仓库复制给 Cursor / Claude / ChatGPT
 */

/** 文档路由 */
export const AI_PROMPT_DOC_PATH = "/docs/tools/ai-prompt";

/** 一行版：盘古（dev）+ 青鸟（release） */
export const AI_PROMPT_ONE_LINER =
    'Install @systembug/pangu and @systembug/qingniao (and @changesets/cli for release). Add to root package.json scripts: "dev": "pangu", "release": "qingniao". Create pangu.config.json with my workspace demos. Then tell me to run pnpm dev and pnpm release.';
