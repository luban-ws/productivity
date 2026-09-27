# RFC 0017: Publish packages in dependency order (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

按 `dependencies.respectDependencyOrder` 决定包的发布顺序。

## Problem

类型里有该字段，执行器仍按发现顺序发布。

## Goals

topological 时被依赖的包先发布。parallel 保持发现顺序。custom 调用 `customOrder`。有环时报错。

## Non-goals

不改构建步骤的顺序。

## Design

发布前对 `context.packages` 排序，排序函数放在独立模块，供 `stages/publish.ts` 使用。

## Acceptance

测试 A 依赖 B 时 B 先于 A，以及依赖环报错。
