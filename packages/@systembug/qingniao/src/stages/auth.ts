/**
 * NPM 认证检查
 */

import { execSilent } from "../utils/exec";

/**
 * 检查 NPM 认证状态
 * 根据包管理器选择相应的认证检查命令
 */
export async function checkNpmAuth(
    packageManager?: "npm" | "pnpm" | "yarn",
): Promise<{ username: string; registry: string } | null> {
    // 根据包管理器选择认证检查命令
    const whoamiCommand =
        packageManager === "pnpm"
            ? "pnpm whoami"
            : packageManager === "yarn"
              ? "yarn whoami"
              : "npm whoami";

    const username = execSilent(whoamiCommand);
    if (!username) {
        return null;
    }

    // 根据包管理器选择 registry 检查命令
    const registryCommand =
        packageManager === "pnpm"
            ? "pnpm config get registry"
            : packageManager === "yarn"
              ? "yarn config get registry"
              : "npm config get registry";

    const registry = execSilent(registryCommand) || "https://registry.npmjs.org/";

    return {
        username,
        registry,
    };
}
