# RFC 0013: Honor publish.access for scoped packages (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

scoped 包的 `--access` 使用 `publish.access`，不再写死 public。

## Problem

`stages/publish.ts` 对 scoped 包固定追加 `--access public`。

## Goals

`public` 与 `restricted` 按配置传递。未设置时 scoped 包仍默认 public。

## Non-goals

不改 registry。那是 RFC 0012。

## Design

在 `stages/publish.ts` 读取 `config.publish.access`。

## Acceptance

测试 public、restricted、未设置三种命令。
