/**
 * JSDoc 处理器
 * 封装 JSDoc 文档生成逻辑
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { tmpdir } from "os";
import type { JSDocOptions, ProcessResult } from "./types.js";

/**
 * 处理 JSDoc 文档生成
 * @param options JSDoc 配置选项
 * @param cwd 工作目录
 * @returns 处理结果
 */
export async function processJSDoc(
    options: JSDocOptions,
    cwd: string = process.cwd(),
): Promise<ProcessResult> {
    if (!options.enabled) {
        return {
            success: true,
            outputDir: "",
            filesProcessed: 0,
        };
    }

    try {
        // 确保输出目录存在
        const outputDir = resolve(cwd, options.opts.destination);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // 构建 JSDoc 命令
        const jsdocConfigPath = createJSDocConfig(options, cwd);
        const command = buildJSDocCommand(jsdocConfigPath, options);

        // 执行 JSDoc
        execSync(command, {
            cwd,
            stdio: "inherit",
            encoding: "utf-8",
        });

        const filesProcessed = await countFiles(options.source.include, cwd);

        return {
            success: true,
            outputDir,
            filesProcessed,
        };
    } catch (error) {
        return {
            success: false,
            outputDir: resolve(cwd, options.opts.destination),
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * 创建临时 JSDoc 配置文件
 * @param options JSDoc 配置
 * @param cwd 工作目录
 * @returns 配置文件路径
 */
function createJSDocConfig(options: JSDocOptions, cwd: string): string {
    const config = {
        opts: {
            recurse: options.opts.recurse ?? true,
            verbose: options.opts.verbose ?? false,
            destination: resolve(cwd, options.opts.destination),
            // 模板路径：如果已经是绝对路径则直接使用，否则相对于 cwd 解析
            // 文心工具在 config.ts 中已经将默认模板路径解析为绝对路径
            template: options.opts.template
                ? options.opts.template.startsWith("/") || options.opts.template.match(/^[A-Z]:/)
                    ? options.opts.template // 已经是绝对路径
                    : resolve(cwd, options.opts.template) // 相对路径，解析为绝对路径
                : undefined,
        },
        source: {
            include: options.source.include.map((path) => resolve(cwd, path)),
            exclude: options.source.exclude?.map((path) => resolve(cwd, path)),
            excludePattern: options.source.excludePattern,
        },
        plugins: options.plugins?.map((plugin) => {
            // 如果是相对路径，解析为绝对路径
            if (plugin.startsWith(".") || !plugin.startsWith("/")) {
                return resolve(cwd, plugin);
            }
            return plugin;
        }),
        markdown: options.markdown,
    };

    // 移除 undefined 值
    const cleanConfig = JSON.parse(JSON.stringify(config));

    // 写入临时配置文件
    const configPath = join(tmpdir(), `jsdoc-config-${Date.now()}.json`);
    writeFileSync(configPath, JSON.stringify(cleanConfig, null, 2), "utf-8");

    return configPath;
}

/**
 * 构建 JSDoc 命令
 * @param configPath 配置文件路径
 * @param _options JSDoc 选项（未使用，保留用于未来扩展）
 * @returns 命令字符串
 */
function buildJSDocCommand(configPath: string, _options: JSDocOptions): string {
    const parts = ["jsdoc", "-c", configPath];

    return parts.join(" ");
}

/**
 * 统计处理的文件数量（简单实现）
 * @param patterns 文件模式
 * @param cwd 工作目录
 * @returns 文件数量（估算）
 */
async function countFiles(patterns: string[], cwd: string): Promise<number> {
    // 这是一个简化的实现，实际应该使用 glob 匹配
    // 为了简化，这里返回一个估算值
    try {
        // 动态导入 glob（ES 模块）
        const { glob } = await import("glob");
        let count = 0;
        for (const pattern of patterns) {
            const files = await glob(pattern, { cwd, absolute: true });
            count += files.length;
        }
        return count;
    } catch {
        // 如果 glob 不可用，返回 0
        return 0;
    }
}
