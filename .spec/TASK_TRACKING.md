# Task Tracking

## Active

- [ ] Implement RFC 0001: 青鸟通用发布工具设计规范 (RFC 0001)
- [ ] Implement RFC 0007: Qingniao publish gaps (Umbrella) (RFC 0007)
    - [ ] Implement RFC 0008: Wire publish hooks into the executor (child of 0007) (RFC 0008)
    - [ ] Implement RFC 0009: Load third-party qingniao plugins (child of 0007) (RFC 0009)
    - [ ] Implement RFC 0010: Validate qingniao config against a schema (child of 0007) (RFC 0010)
    - [ ] Implement RFC 0011: Discover yarn and npm workspace packages (child of 0007) (RFC 0011)
    - [ ] Implement RFC 0012: Pass publish.registry to the publish command (child of 0007) (RFC 0012)
    - [ ] Implement RFC 0013: Honor publish.access for scoped packages (child of 0007) (RFC 0013)
    - [ ] Implement RFC 0014: Prompt for OTP when otpRequired is set (child of 0007) (RFC 0014)
    - [ ] Implement RFC 0015: Sync workspace dependency versions on bump (child of 0007) (RFC 0015)
    - [ ] Implement RFC 0016: Replace workspace protocols before publish (child of 0007) (RFC 0016)
    - [ ] Implement RFC 0017: Publish packages in dependency order (child of 0007) (RFC 0017)
    - [ ] Implement RFC 0018: Run Turbo using tasks declared in turbo.json (child of 0007) (RFC 0018)
    - [ ] Implement RFC 0019: Detect the package manager from PATH (child of 0007) (RFC 0019)
    - [ ] Implement RFC 0020: Ship CI templates that run qingniao (child of 0007) (RFC 0020)
    - [ ] Implement RFC 0021: Web UI for qingniao publish config (child of 0007) (RFC 0021)
    - [x] Implement RFC 0022: Run registry login when publish is unauthenticated (child of 0007) (RFC 0022)

## Done

- [x] RFC 0003 `@systembug/tongyu` — Vite 8 build, locale-only API, pangu local translator
- [x] pangu Ctrl+C graceful shutdown (no `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`)
- [x] Bump vite → `^8.1.4` (tongyu, diting, qingniao, wenxin, apps/site)
- [x] Implement RFC 0006: Qingniao Agent CLI Protocol (RFC 0006)
- [x] Implement RFC 0002: 文心通用 API 文档生成工具设计规范 (RFC 0002)
- [x] Implement RFC 0003: 通语 CLI Locale 包设计规范 (RFC 0003)

## In Progress

_(none)_

## To Do

- [ ] qingniao / wenxin adopt tongyu `resolveLocale` for CLI messages
- [ ] pangu Vite lib build (optional; currently tsc)
