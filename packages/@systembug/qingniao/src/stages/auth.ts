/**
 * NPM 认证检查与交互登录
 */

import { exec, execSilent } from "../utils/exec";
import { t } from "../messages.js";

/** 未指定包管理器时按 npm 登录 */
export const DEFAULT_REGISTRY_PACKAGE_MANAGER = "npm";

/** pnpm 的登录命令前缀 */
export const PNPM_PACKAGE_MANAGER = "pnpm";

/** yarn 的登录命令前缀 */
export const YARN_PACKAGE_MANAGER = "yarn";

/** registry 登录子命令 */
export const REGISTRY_LOGIN_SUBCOMMAND = "login";

/** 登录命令不设超时，等待用户在终端完成 */
export const REGISTRY_LOGIN_TIMEOUT_MS = 0;

/** 支持 whoami / login 的包管理器 */
export type RegistryPackageManager = "npm" | "pnpm" | "yarn";

/** whoami 成功后的身份 */
export interface RegistryAuth {
    username: string;
    registry: string;
}

/** ensureNpmAuth 的可替换依赖，便于测试 */
export interface EnsureNpmAuthOptions {
    packageManager?: RegistryPackageManager;
    interactive?: boolean;
    runLogin?: (command: string) => void;
}

/**
 * 把配置里的包管理器收成 npm、pnpm 或 yarn
 */
export function resolveRegistryPackageManager(packageManager?: string): RegistryPackageManager {
    if (packageManager === PNPM_PACKAGE_MANAGER || packageManager === YARN_PACKAGE_MANAGER) {
        return packageManager;
    }
    return DEFAULT_REGISTRY_PACKAGE_MANAGER;
}

/**
 * 交互登录命令，例如 `pnpm login`
 */
export function buildRegistryLoginCommand(packageManager?: string): string {
    const manager = resolveRegistryPackageManager(packageManager);
    return `${manager} ${REGISTRY_LOGIN_SUBCOMMAND}`;
}

/**
 * 检查 NPM 认证状态
 * 根据包管理器选择相应的认证检查命令
 */
export async function checkNpmAuth(
    packageManager?: RegistryPackageManager,
): Promise<RegistryAuth | null> {
    const manager = resolveRegistryPackageManager(packageManager);
    const username = execSilent(`${manager} whoami`);
    if (!username) {
        return null;
    }

    const registry = execSilent(`${manager} config get registry`) || "https://registry.npmjs.org/";

    return {
        username,
        registry,
    };
}

/**
 * 已登录则直接返回。交互终端上先运行 login，再重新 whoami。
 */
export async function ensureNpmAuth(options: EnsureNpmAuthOptions = {}): Promise<RegistryAuth> {
    const existing = await checkNpmAuth(options.packageManager);
    if (existing) {
        return existing;
    }

    const manager = resolveRegistryPackageManager(options.packageManager);
    if (!options.interactive) {
        throw new Error(`${t("npmNotLoggedIn")}\n${t("npmLoginHint", { pm: manager })}`);
    }

    const runLogin = options.runLogin ?? runRegistryLogin;
    runLogin(buildRegistryLoginCommand(manager));

    const afterLogin = await checkNpmAuth(options.packageManager);
    if (!afterLogin) {
        throw new Error(t("npmLoginFailed", { pm: manager }));
    }
    return afterLogin;
}

/**
 * 把 login 交给用户的终端，不抢 stdin
 */
function runRegistryLogin(command: string): void {
    exec(command, {
        timeout: REGISTRY_LOGIN_TIMEOUT_MS,
        description: command,
    });
}
