# RFC 0014: Prompt for OTP when otpRequired is set (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

`publish.otpRequired` 为 true 时，发布前向用户要一次性密码并传给发布命令。

## Problem

该字段未被读取。现有逻辑只在子进程输出含 OTP 字样时把错误原样抛出。

## Goals

开启时提示并传递 OTP。关闭时不提示。

## Non-goals

不增加 Web 表单。那是 RFC 0021。

## Design

在 `stages/publish.ts` 配合 `utils/prompts.ts` 读取密码并追加到发布命令。

## Acceptance

测试 otpRequired 为 true 与 false 两种路径。
