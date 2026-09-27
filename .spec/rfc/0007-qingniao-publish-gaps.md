# RFC 0007: Qingniao publish gaps (Umbrella)

**Status:** Draft

**Type:** Umbrella

## Summary

本伞只索引青鸟发布流程里尚未接线的事项。每件事一篇子 RFC。实现细节写在子 RFC，不写在这里。

## Problem

这些事项彼此独立。放进 RFC 0001 会让一篇 RFC 同时承诺钩子、插件、校验、发现、发布参数、版本、构建和界面。

## Goals

列出的子 RFC 全部 Implemented 之后，本伞才可以关闭。

## Non-goals

不改已经落地的发布主路径。不包含 RFC 0006 的 Agent JSON 协议。关闭后新缺口另开伞，不往本伞追加子 RFC。

## Children

| RFC | Concern |
|-----|---------|
| [0022](completed/0022-run-registry-login.md) | Run registry login when publish is unauthenticated |
| [0021](0021-qingniao-config-web-ui.md) | Web UI for qingniao publish config |
| [0020](0020-qingniao-ci-templates.md) | Ship CI templates that run qingniao |
| [0019](0019-package-manager-path-fallback.md) | Detect the package manager from PATH |
| [0018](0018-turbo-json-tasks.md) | Run Turbo using tasks declared in turbo.json |
| [0017](0017-dependency-publish-order.md) | Publish packages in dependency order |
| [0016](0016-replace-workspace-protocols.md) | Replace workspace protocols before publish |
| [0015](0015-sync-workspace-dependency-versions.md) | Sync workspace dependency versions on bump |
| [0014](0014-publish-otp-prompt.md) | Prompt for OTP when otpRequired is set |
| [0013](0013-publish-access-flag.md) | Honor publish.access for scoped packages |
| [0012](0012-publish-registry-flag.md) | Pass publish.registry to the publish command |
| [0011](0011-yarn-npm-package-discovery.md) | Discover yarn and npm workspace packages |
| [0010](0010-qingniao-config-validation.md) | Validate qingniao config against a schema |
| [0009](0009-qingniao-plugin-loader.md) | Load third-party qingniao plugins |
| [0008](0008-wire-publish-hooks.md) | Wire publish hooks into the executor |

## Acceptance

子 RFC 都已 Implemented 并归档后，将本伞 advance 为 Implemented 再 archive。之后的新事项使用新的伞。
