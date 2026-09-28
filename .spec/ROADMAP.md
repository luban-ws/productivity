# Roadmap

## Phase: CLI foundations

| Item                                  | Status      | Notes                                          |
| ------------------------------------- | ----------- | ---------------------------------------------- |
| RFC 0001 Universal Publish (qingniao) | Draft       |                                                |
| RFC 0002 Wenxin API docs              | Implemented |                                                |
| RFC 0003 Tongyu CLI locale            | Implemented | Vite 8, locale-only; catalogs stay per-package |

## Next

- Wire qingniao/wenxin CLI messages through tongyu `resolveLocale`
- Optional: migrate pangu build to Vite

## Index

| 0001 | [青鸟通用发布工具设计规范](rfc/0001-universal-publish-tool.md) | Draft |
| 0002 | [文心通用 API 文档生成工具设计规范](rfc/completed/0002-wenxin-api-doc-generator.md) | Implemented |
| 0003 | [通语 CLI Locale 包设计规范](rfc/completed/0003-tongyu-cli-locale-package.md) | Implemented |
| 0006 | [Qingniao Agent CLI Protocol](rfc/completed/0006-qingniao-agent-cli-protocol.md) | Implemented |
| 0007 | [Qingniao publish gaps (Umbrella)](rfc/0007-qingniao-publish-gaps.md) | Draft |
| 0008 | [Wire publish hooks into the executor (child of 0007)](rfc/0008-wire-publish-hooks.md) | Draft |
| 0009 | [Load third-party qingniao plugins (child of 0007)](rfc/0009-qingniao-plugin-loader.md) | Draft |
| 0010 | [Validate qingniao config against a schema (child of 0007)](rfc/0010-qingniao-config-validation.md) | Draft |
| 0011 | [Discover yarn and npm workspace packages (child of 0007)](rfc/0011-yarn-npm-package-discovery.md) | Draft |
| 0012 | [Pass publish.registry to the publish command (child of 0007)](rfc/0012-publish-registry-flag.md) | Draft |
| 0013 | [Honor publish.access for scoped packages (child of 0007)](rfc/0013-publish-access-flag.md) | Draft |
| 0014 | [Prompt for OTP when otpRequired is set (child of 0007)](rfc/0014-publish-otp-prompt.md) | Draft |
| 0015 | [Sync workspace dependency versions on bump (child of 0007)](rfc/0015-sync-workspace-dependency-versions.md) | Draft |
| 0016 | [Replace workspace protocols before publish (child of 0007)](rfc/0016-replace-workspace-protocols.md) | Draft |
| 0017 | [Publish packages in dependency order (child of 0007)](rfc/0017-dependency-publish-order.md) | Draft |
| 0018 | [Run Turbo using tasks declared in turbo.json (child of 0007)](rfc/0018-turbo-json-tasks.md) | Draft |
| 0019 | [Detect the package manager from PATH (child of 0007)](rfc/0019-package-manager-path-fallback.md) | Draft |
| 0020 | [Ship CI templates that run qingniao (child of 0007)](rfc/0020-qingniao-ci-templates.md) | Draft |
| 0021 | [Web UI for qingniao publish config (child of 0007)](rfc/0021-qingniao-config-web-ui.md) | Draft |
| 0022 | [Run registry login when publish is unauthenticated (child of 0007)](rfc/completed/0022-run-registry-login.md) | Implemented |
| 0023 | [Qingniao and Pangu agent skills (Umbrella)](rfc/0023-qingniao-pangu-agent-skills.md) | Implemented |
| 0024 | [Skill that drives qingniao releases safely (child of 0023)](rfc/0024-qingniao-release-skill.md) | Implemented |
| 0025 | [Skill that drives pangu dev servers without blocking (child of 0023)](rfc/0025-pangu-dev-server-skill.md) | Implemented |
