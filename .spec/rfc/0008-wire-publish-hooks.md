# RFC 0008: Wire publish hooks into the executor (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

发布执行器在版本、构建、发布前后调用 `PublishConfig.hooks`。

## Problem

`core/hooks.ts` 的 `executeHook` 没有调用方，配置里的钩子不会运行。

## Goals

已配置的 before/after 钩子按阶段被调用。未配置时行为与现在相同。

## Non-goals

不加载第三方插件。插件入口属于 RFC 0009。

## Design

在 `core/executor.ts` 的版本、构建、发布阶段前后调用 `executeHook`。

## Acceptance

测试断言钩子顺序为 before 然后阶段然后 after。未配置钩子的发布路径保持原样。
