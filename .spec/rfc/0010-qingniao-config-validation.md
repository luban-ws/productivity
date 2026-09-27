# RFC 0010: Validate qingniao config against a schema (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

发布前用 schema 校验青鸟配置，非法配置直接失败。

## Problem

`config/schema.ts` 是空对象。`validateConfig` 忽略入参并固定返回 valid。

## Goals

类型错误或未知结构返回非空错误列表，且 valid 为 false。合法最小配置通过。

## Non-goals

不实现各个配置字段的运行时效果。那些字段各自有子 RFC。

## Design

填充 `config/schema.ts`，让 `config/validator.ts` 按 schema 校验 `PublishConfig`。

## Acceptance

测试覆盖缺字段、错类型、合法最小配置。
