# RFC 0016: Replace workspace protocols before publish (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

`publish.replaceWorkspaceProtocols` 为 true 时，发布前把 `workspace:` 依赖写成具体版本或范围。

## Problem

`stages/publish.ts` 里该分支是空的，注释写着 TODO。

## Goals

按 `protocolReplacement` 写成 version 或 range。未配置 custom 替换器时，custom 模式失败并说明原因。关闭开关时不改文件。

## Non-goals

不在升版本阶段改依赖。那是 RFC 0015。

## Design

在 `stages/publish.ts` 发布每个包之前改写该包的依赖字段。

## Acceptance

测试 `workspace:*`、`workspace:^`，以及开关关闭时文件不变。
