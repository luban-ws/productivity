/**
 * 配置管理模块
 * 负责加载、合并和验证配置
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import type { ApiDocConfig, JSDocOptions, TypeDocOptions } from "./types.js";

// 尝试加载 JSON Schema 验证器（可选依赖）
let Ajv: any = null;
let ajvLoaded = false;

/**
 * 异步加载 Ajv（如果可用）
 */
async function loadAjv(): Promise<void> {
    if (ajvLoaded) return;
    try {
        const ajvModule = await import("ajv");
        Ajv = ajvModule.default || ajvModule;
        ajvLoaded = true;
    } catch {
        // Ajv 不存在，跳过 schema 验证
        ajvLoaded = true;
    }
}

// 获取当前文件目录（ES 模块）
const currentFileUrl = import.meta.url;
const __filename = fileURLToPath(currentFileUrl);
const __dirname = dirname(__filename);

/**
 * 默认 JSDoc 配置
 */
const DEFAULT_JSDOC_CONFIG: JSDocOptions = {
    enabled: true,
    source: {
        include: ["src/**/*.ts", "src/**/*.js"],
        exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.test.js"],
    },
    opts: {
        destination: "doc",
        template: resolve(__dirname, "../jsdoc-template"),
        recurse: true,
        verbose: true,
    },
    plugins: ["plugins/markdown", resolve(__dirname, "../dist/jsdoc-aliases.js")],
    markdown: {
        parser: "evilstreak",
        dialect: "Markuru",
    },
};

/**
 * 默认 TypeDoc 配置
 */
const DEFAULT_TYPEDOC_CONFIG: TypeDocOptions = {
    enabled: false,
    entryPoints: ["src/index.ts"],
    out: "doc",
    excludePrivate: true,
    excludeProtected: false,
    excludeInternal: true,
};

/**
 * 加载配置文件
 * @param configPath 配置文件路径
 * @returns 配置对象
 */
export async function loadConfig(configPath?: string): Promise<ApiDocConfig> {
    // 如果没有指定配置文件，尝试查找默认位置
    if (!configPath) {
        const possiblePaths = [
            "wenxin.config.json",
            "wenxin.config.js",
            "wenxin.config.ts",
            "api-doc.config.json",
            "api-doc.config.js",
            ".api-doc.json",
        ];

        for (const path of possiblePaths) {
            if (existsSync(path)) {
                configPath = path;
                break;
            }
        }
    }

    // 如果找到配置文件，加载它
    if (configPath && existsSync(configPath)) {
        try {
            // 处理不同格式的配置文件
            if (configPath.endsWith(".json")) {
                const content = readFileSync(configPath, "utf-8");
                const config = JSON.parse(content) as Partial<ApiDocConfig> & { $schema?: string };

                // 如果启用了 schema 验证，进行验证
                await loadAjv();
                if (Ajv && config.$schema) {
                    await validateSchema(config, configPath);
                }

                // 移除 $schema，它不是配置的一部分
                const { $schema, ...configWithoutSchema } = config;
                return mergeConfig(configWithoutSchema, dirname(resolve(configPath)));
            } else if (configPath.endsWith(".js") || configPath.endsWith(".ts")) {
                // 对于 JS/TS 文件，需要动态导入（这里简化处理，实际应该使用 require 或 import）
                throw new Error("JS/TS 配置文件需要运行时支持，请使用 JSON 格式或通过编程方式加载");
            }
        } catch (error) {
            throw new Error(`无法加载配置文件 ${configPath}: ${error}`);
        }
    }

    // 返回默认配置
    return getDefaultConfig();
}

/**
 * 验证 JSON Schema（如果可用）
 */
async function validateSchema(config: any, configPath: string): Promise<void> {
    if (!Ajv) {
        return; // 如果没有 Ajv，跳过验证
    }

    try {
        // 尝试加载 schema
        const schemaPath = resolve(dirname(configPath), config.$schema.replace(/^\.\//, ""));

        if (existsSync(schemaPath)) {
            const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
            const ajv = new Ajv();
            const validate = ajv.compile(schema);

            if (!validate(config)) {
                console.warn("配置文件验证警告:", validate.errors);
                // 不抛出错误，只警告
            }
        }
    } catch (error) {
        // Schema 验证失败不影响配置加载
        console.warn("Schema 验证失败，跳过验证:", error);
    }
}

/**
 * 合并配置
 * @param userConfig 用户配置
 * @param baseDir 基础目录
 * @returns 合并后的配置
 */
function mergeConfig(
    userConfig: Partial<ApiDocConfig>,
    baseDir: string = process.cwd(),
): ApiDocConfig {
    const config: ApiDocConfig = {
        mode: userConfig.mode || "hybrid",
        cwd: baseDir,
        mergeTypes: userConfig.mergeTypes ?? true,
    };

    // 合并 JSDoc 配置
    if (userConfig.jsdoc !== undefined) {
        config.jsdoc = deepMerge(DEFAULT_JSDOC_CONFIG, userConfig.jsdoc);
        // 解析相对路径
        if (config.jsdoc?.opts?.template) {
            config.jsdoc.opts.template = resolve(baseDir, config.jsdoc.opts.template);
        }
        if (config.jsdoc?.opts?.destination) {
            config.jsdoc.opts.destination = resolve(baseDir, config.jsdoc.opts.destination);
        }
    } else {
        config.jsdoc = { ...DEFAULT_JSDOC_CONFIG };
        if (config.jsdoc?.opts) {
            config.jsdoc.opts.template = resolve(__dirname, "../jsdoc-template");
            config.jsdoc.opts.destination = resolve(baseDir, "doc");
            // 设置插件路径（使用编译后的文件）
            if (!config.jsdoc.plugins) {
                config.jsdoc.plugins = [
                    "plugins/markdown",
                    resolve(__dirname, "../dist/jsdoc-aliases.js"),
                ];
            }
        }
    }

    // 合并 TypeDoc 配置
    if (userConfig.typedoc !== undefined) {
        config.typedoc = deepMerge(DEFAULT_TYPEDOC_CONFIG, userConfig.typedoc);
        if (config.typedoc.out) {
            config.typedoc.out = resolve(baseDir, config.typedoc.out);
        }
    } else {
        config.typedoc = { ...DEFAULT_TYPEDOC_CONFIG };
        config.typedoc.out = resolve(baseDir, "doc");
    }

    // 根据模式调整配置
    if (config.mode === "jsdoc") {
        config.typedoc!.enabled = false;
    } else if (config.mode === "typedoc") {
        config.jsdoc!.enabled = false;
    }

    return config;
}

/**
 * 深度合并对象
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target } as T;

    for (const key in source) {
        const sourceValue = source[key];
        if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
            const targetValue = result[key];
            if (targetValue && typeof targetValue === "object" && !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue as T, sourceValue as Partial<T>) as T[Extract<
                    keyof T,
                    string
                >];
            } else {
                result[key] = sourceValue as T[Extract<keyof T, string>];
            }
        } else if (sourceValue !== undefined) {
            result[key] = sourceValue as T[Extract<keyof T, string>];
        }
    }

    return result;
}

/**
 * 获取默认配置
 */
export function getDefaultConfig(): ApiDocConfig {
    return mergeConfig({}, process.cwd());
}

/**
 * 验证配置
 * @param config 配置对象
 * @throws 如果配置无效
 */
export function validateConfig(config: ApiDocConfig): void {
    if (config.jsdoc?.enabled) {
        if (!config.jsdoc.source?.include || config.jsdoc.source.include.length === 0) {
            throw new Error("JSDoc 配置必须指定源文件路径");
        }
    }

    if (config.typedoc?.enabled) {
        if (!config.typedoc.entryPoints || config.typedoc.entryPoints.length === 0) {
            throw new Error("TypeDoc 配置必须指定入口文件");
        }
    }

    if (config.mode === "hybrid" && !config.jsdoc?.enabled && !config.typedoc?.enabled) {
        throw new Error("混合模式需要至少启用 JSDoc 或 TypeDoc 之一");
    }
}
