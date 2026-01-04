/**
 * 通用 API 文档生成工具
 * 支持 JSDoc 和 TypeScript 文档生成
 */

import { loadConfig, validateConfig } from "./config.js";
import { processJSDoc } from "./jsdoc-processor.js";
import { processTypeScript, extractTypeInfo } from "./typescript-processor.js";
import type { ApiDocConfig, ProcessResult } from "./types.js";

/**
 * 生成 API 文档
 * @param configPath 配置文件路径（可选）
 * @param options 配置选项（可选，会覆盖配置文件）
 * @returns 处理结果
 */
export async function generateDocs(
    configPath?: string,
    options?: Partial<ApiDocConfig>,
): Promise<ProcessResult> {
    try {
        // 加载配置
        const config = await loadConfig(configPath);

        // 合并用户选项
        if (options) {
            Object.assign(config, options);
            if (options.jsdoc) {
                config.jsdoc = { ...config.jsdoc, ...options.jsdoc };
            }
            if (options.typedoc) {
                config.typedoc = { ...config.typedoc, ...options.typedoc };
            }
        }

        // 验证配置
        validateConfig(config);

        const cwd = config.cwd || process.cwd();
        let result: ProcessResult = {
            success: true,
            outputDir: "",
            filesProcessed: 0,
        };

        // 根据模式处理
        if (config.mode === "jsdoc" || config.mode === "hybrid") {
            if (config.jsdoc?.enabled && config.jsdoc) {
                const jsdocOptions = config.jsdoc as import("./types.js").JSDocOptions;
                const jsdocResult = await processJSDoc(jsdocOptions, cwd);
                if (!jsdocResult.success) {
                    return jsdocResult;
                }
                result = jsdocResult;
            }
        }

        if (config.mode === "typedoc" || config.mode === "hybrid") {
            if (config.typedoc?.enabled && config.typedoc) {
                const typedocOptions = config.typedoc as import("./types.js").TypeDocOptions;
                const typedocResult = await processTypeScript(typedocOptions, cwd);
                if (!typedocResult.success) {
                    return typedocResult;
                }
                // 如果启用类型合并，提取类型信息
                if (config.mergeTypes && config.jsdoc?.enabled) {
                    // 注意：这里需要访问 JSDoc 的内部数据结构
                    // 实际实现可能需要更复杂的集成
                    await extractTypeInfo(typedocOptions, cwd);
                }
                result = typedocResult;
            }
        }

        return result;
    } catch (error) {
        return {
            success: false,
            outputDir: "",
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * 导出类型定义
 */
export type {
    ApiDocConfig,
    JSDocOptions,
    TypeDocOptions,
    DocMode,
    ProcessResult,
} from "./types.js";

/**
 * 导出配置函数
 */
export { loadConfig, validateConfig, getDefaultConfig } from "./config.js";
