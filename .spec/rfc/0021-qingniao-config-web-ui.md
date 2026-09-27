# RFC 0021: Web UI for qingniao publish config (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

提供一个只编辑青鸟发布配置的 Web 界面。

## Problem

配置目前只能手写文件。

## Goals

界面能读写配置，并拒绝 schema 不接受的值。

## Non-goals

界面不触发 npm publish。不替代 CLI。schema 本身属于 RFC 0010。

## Design

界面单独目录，读取 RFC 0010 的校验结果。不进入 `core/executor.ts`。

## Acceptance

测试保存合法配置与拒绝非法配置。测试不调用发布命令。
