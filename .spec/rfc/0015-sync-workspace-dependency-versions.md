# RFC 0015: Sync workspace dependency versions on bump (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

`version.syncWorkspaceDeps` 为 true 时，升版本同时改写 workspace 依赖的版本范围。

## Problem

`config/loader.ts` 把该字段默认设为 true，但 `stages/version.ts` 不读它。

## Goals

开启时依赖范围更新到新版本。关闭时不改依赖字段。

## Non-goals

不把 `workspace:` 协议改写成具体版本。那是 RFC 0016。

## Design

在 `stages/version.ts` 于版本写回时处理 workspace 依赖。

## Acceptance

开启与关闭各用 package.json 夹具测试。
