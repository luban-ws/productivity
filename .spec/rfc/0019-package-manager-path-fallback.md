# RFC 0019: Detect the package manager from PATH (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

没有 `packageManager` 字段、也没有 lockfile 时，从 PATH 上第一个 pnpm、yarn 或 npm 推断包管理器。

## Problem

`detectPackageManager` 在这种情况下返回 null。

## Goals

优先级为 pnpm、yarn、npm。三个都不在 PATH 上时仍返回 null。已有 lockfile 或 `packageManager` 字段时规则不变。

## Non-goals

不因此改变包发现命令。包发现属于 RFC 0011。

## Design

改 `utils/auto-detect.ts` 的 `detectPackageManager`。

## Acceptance

测试 PATH 上分别只有 pnpm、yarn、npm，以及三个都没有。
