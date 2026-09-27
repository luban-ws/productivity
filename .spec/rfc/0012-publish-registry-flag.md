# RFC 0012: Pass publish.registry to the publish command (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

`publish.registry` 有值时，发布命令带上 `--registry`。

## Problem

该字段只出现在 `types.ts`。`stages/publish.ts` 不读它。

## Goals

npm、pnpm、yarn 的 publish 命令都带配置的 registry。未配置时不追加该参数。

## Non-goals

不改 `--access`。那是 RFC 0013。不提示 OTP。那是 RFC 0014。不一次发布到多个 registry。

## Design

在 `stages/publish.ts` 拼接 `--registry`。

## Acceptance

测试有 registry 与无 registry 两种命令字符串。
