# RFC 0011: Discover yarn and npm workspace packages (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

`packageManager` 为 yarn 或 npm 时，用对应的 workspace 命令发现包。

## Problem

`core/executor.ts` 在 workspace 模式下始终调用 `discoverPackagesWithPnpm`。

## Goals

yarn 使用 `yarn workspaces list`。npm 使用 `npm ls --workspaces`。pnpm 路径不变。

## Non-goals

不在没有 lockfile 时猜测包管理器。那是 RFC 0019。

## Design

在 `utils/package.ts` 增加 yarn 与 npm 的发现函数，执行器按 `packageManager` 选择。

## Acceptance

pnpm、yarn、npm 各有发现测试。
