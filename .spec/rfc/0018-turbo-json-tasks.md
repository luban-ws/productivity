# RFC 0018: Run Turbo using tasks declared in turbo.json (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

`useTurbo` 时按 `turbo.json` 声明的任务运行，而不是固定拼出 `turbo build build`。

## Problem

`stages/build.ts` 不读 `turbo.json`。默认 `turboTasks` 是 `build`，命令却是 `turbo build` 再拼任务名。

## Goals

未配置 `turboTasks` 时使用 `turbo.json` 的任务名。配置了则只用配置，且不重复追加 build。

## Non-goals

不改 Nx 路径。不从 turbo outputs 推断产物路径。

## Design

在 `stages/build.ts` 读取 `turbo.json` 的 tasks 或 pipeline。

## Acceptance

夹具 `turbo.json` 生成的命令任务名来自文件，且不含重复的 build。
