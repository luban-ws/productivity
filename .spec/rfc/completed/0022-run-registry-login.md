# RFC 0022: Run registry login when publish is unauthenticated (child of 0007)

**Status:** Implemented

**Parent:** [0007](../0007-qingniao-publish-gaps.md)

## Summary

发布时如果 registry 未登录，青鸟直接运行对应包管理器的 `login`，登录完成后再继续。

## Problem

`executePublish` 在 `whoami` 失败时只抛出「请先运行 pnpm login」，用户还要自己再敲一遍命令。

## Goals

交互终端上，未登录时执行 `pnpm login`、`yarn login` 或 `npm login`，然后再次 `whoami`。登录成功则继续发布。登录后仍无用户则失败。

## Non-goals

不保存密码，不绕过 registry 认证。非 TTY 和 `--json` 不启动交互登录。doctor 仍只报告未登录，不在检查时登录。不实现 OTP 配置项。那是 RFC 0014。

## Design

在 `stages/auth.ts` 增加 `ensureNpmAuth`。`core/executor.ts` 用它替换只抛错的分支。登录命令继承 stdio，超时为 0。

## Acceptance

测试覆盖已登录不调用 login、交互时调用 `pnpm login` 后再取用户、非交互时不调用 login、登录后仍失败。
