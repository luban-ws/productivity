# RFC 0009: Load third-party qingniao plugins (child of 0007)

**Status:** Draft

**Parent:** [0007](0007-qingniao-publish-gaps.md)

## Summary

发布开始前按配置加载第三方插件。

## Problem

青鸟没有插件加载模块，扩展点只能改核心代码。

## Goals

配置中的插件入口被加载。模块缺失或插件抛错时中止发布。

## Non-goals

不负责钩子是否被执行器调用。那是 RFC 0008。不做配置界面。那是 RFC 0021。

## Design

新增插件加载模块，在 `executePublish` 开头读取插件列表并加载。

## Acceptance

测试覆盖加载成功、入口缺失、插件初始化抛错。
