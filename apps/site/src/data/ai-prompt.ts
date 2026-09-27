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

/** 给其他仓库的 Agent：只用青鸟升版本，不发布 */
export const AI_PROMPT_QINGNIAO = {
    en: `Use @systembug/qingniao in this repository to bump versions. Do not publish to npm. Do not edit the version field by hand.

Protocol:
- stdout is JSON Lines. Parse only JSON. Diagnostics go to stderr.
- The last line of each command is a result event. Read status and exitCode. If exitCode is not 0, stop and report code and message.
- --json is not authorization. Any command that writes versions must also pass --yes. Without --yes the exit code is 3. Do not retry and do not edit files.

Order:
1. qingniao doctor --json
2. qingniao plan --json
3. Bump only when the user explicitly asks to bump the version.

Bump without publishing:
qingniao --json --yes --skip-publish --skip-build

How the version is chosen:
- If .changeset/*.md files exist (other than README.md), qingniao bumps with changesets.
- If the .changeset directory exists but there are no changeset files, --yes skips the bump. Write a changeset markdown file first, then run the bump command. Do not run interactive pnpm changeset.
- If there is no .changeset directory, qingniao uses semver from Conventional Commits (feat = minor, fix = patch, BREAKING = major).

The bump updates each package.json version and the top-level version in skill-release.json and plugin.json. Do not edit those files yourself.

Do not run qingniao without --skip-publish. Do not use --dry-run as a bump; dry-run does not write versions. On a non-TTY or with --json, if the registry is not logged in, stop and report the doctor auth error. Do not type passwords.`,
    zh: `在这个仓库里只用 @systembug/qingniao 升版本。不要 npm publish。不要自己改 version 字段。

协议：
- stdout 每行一个 JSON。只解析 JSON。诊断在 stderr。
- 每条命令的最后一行是 result。看 status 和 exitCode。exitCode 不是 0 就停，把 code 和 message 报出来。
- --json 不是授权。改版本的命令必须同时带 --yes。没有 --yes 时退出码是 3。不要重试，不要改文件。

顺序：
1. qingniao doctor --json
2. qingniao plan --json
3. 只有用户明确说升版本时才升版本。

升版本（不发布）：
qingniao --json --yes --skip-publish --skip-build

版本怎么决定：
- 仓库里有 .changeset/*.md（不是 README.md）时，青鸟用 changeset 升版本。
- 有 .changeset 目录但没有任何 changeset 文件时，--yes 会跳过升版本。先写一份 changeset markdown，再跑上面的命令。不要用交互式 pnpm changeset。
- 没有 .changeset 目录时，青鸟按 Conventional Commits 做 semver（feat 为 minor，fix 为 patch，BREAKING 为 major）。

升版本时会改各包 package.json，并同步 skill-release.json 和 plugin.json 的顶层 version。不要手改这些文件。

不要运行不带 --skip-publish 的 qingniao。不要用 --dry-run 冒充升版本，dry-run 不会写版本。非 TTY 或 --json 下如果未登录，停下来报告 doctor 的认证错误。不要输入密码。`,
    ja: `このリポジトリでは @systembug/qingniao だけを使ってバージョンを上げる。npm publish はしない。version フィールドは手で編集しない。

手順：
- stdout は JSON Lines。JSON だけ解析する。診断は stderr。
- 各コマンドの最終行は result。status と exitCode を読む。exitCode が 0 でなければ止まり、code と message を報告する。
- --json は認可ではない。バージョンを書くコマンドには必ず --yes を付ける。--yes がないと終了コードは 3。再試行せず、ファイルも編集しない。

順序：
1. qingniao doctor --json
2. qingniao plan --json
3. ユーザーが明示したときだけバージョンを上げる。

公開せずにバージョンを上げる：
qingniao --json --yes --skip-publish --skip-build

決め方：
- .changeset/*.md（README.md 以外）があれば changeset で上げる。
- .changeset ディレクトリだけあってファイルが無いと --yes はバージョン更新をスキップする。先に changeset の markdown を書き、対話式の pnpm changeset は使わない。
- .changeset ディレクトリが無いときは Conventional Commits の semver（feat は minor、fix は patch、BREAKING は major）。

package.json と、skill-release.json / plugin.json のトップレベル version が更新される。これらを手で編集しない。

--skip-publish 無しの qingniao は実行しない。--dry-run はバージョンを書かない。非 TTY または --json で未ログインなら、doctor の認証エラーを報告して止まる。パスワードは入力しない。`,
    ko: `이 저장소에서는 @systembug/qingniao만 사용해 버전을 올린다. npm publish 하지 않는다. version 필드를 직접 고치지 않는다.

규약：
- stdout은 JSON Lines다. JSON만 파싱한다. 진단은 stderr이다.
- 각 명령의 마지막 줄은 result다. status와 exitCode를 본다. exitCode가 0이 아니면 멈추고 code와 message를 보고한다.
- --json은 승인이 아니다. 버전을 쓰는 명령에는 반드시 --yes를 붙인다. --yes가 없으면 종료 코드는 3이다. 재시도하지 말고 파일도 고치지 않는다.

순서：
1. qingniao doctor --json
2. qingniao plan --json
3. 사용자가 버전 상승을 명시할 때만 올린다.

게시하지 않고 버전만 올리기：
qingniao --json --yes --skip-publish --skip-build

버전 결정：
- .changeset/*.md(README.md 제외)가 있으면 changeset으로 올린다.
- .changeset 디렉터리만 있고 파일이 없으면 --yes는 버전 상승을 건너뛴다. 먼저 changeset markdown을 작성한다. 대화형 pnpm changeset은 쓰지 않는다.
- .changeset 디렉터리가 없으면 Conventional Commits semver다(feat는 minor, fix는 patch, BREAKING은 major).

각 package.json과 skill-release.json, plugin.json의 최상위 version이 갱신된다. 이 파일을 직접 고치지 않는다.

--skip-publish 없는 qingniao는 실행하지 않는다. --dry-run은 버전을 쓰지 않는다. TTY가 아니거나 --json인데 로그인되어 있지 않으면 doctor 인증 오류를 보고하고 멈춘다. 비밀번호를 입력하지 않는다.`,
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

/** 按当前语言解析青鸟 Agent 提示词 */
export function getAiPromptQingniao(language: string): string {
    const base = language.split("-")[0] as AiPromptLocale;
    return AI_PROMPT_QINGNIAO[base] ?? AI_PROMPT_QINGNIAO.en;
}
