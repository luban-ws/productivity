# RFC 0020: Ship CI templates that run qingniao (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

提供可复制的 GitHub Actions 与 GitLab CI 片段，用来运行 qingniao。

## Problem

仓库里没有这些模板。

## Goals

模板只调用已有 CLI，不内嵌另一套发布逻辑。

## Non-goals

不实现远程 Agent 服务。不改发布阶段代码。Agent 协议属于 RFC 0006。

## Design

模板放在 `packages/@systembug/qingniao` 的 templates 目录，并在 README 指向它们。

## Acceptance

两个模板文件存在，其中的命令与 README 的 qingniao 调用一致。
