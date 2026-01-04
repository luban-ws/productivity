/**
 * TypeScript 类型处理器
 * 使用 TypeDoc 提取 TypeScript 类型信息
 */

import { Application } from "typedoc";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import type { TypeDocOptions, ProcessResult } from "./types.js";

// 注意：writeFileSync 已在 jsdoc-processor 中导入，这里不需要

/**
 * 处理 TypeScript 文档生成
 * @param options TypeDoc 配置选项
 * @param cwd 工作目录
 * @returns 处理结果
 */
export async function processTypeScript(
    options: TypeDocOptions,
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
        const outputDir = resolve(cwd, options.out);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // 创建 TypeDoc 应用实例
        const app = await Application.bootstrapWithPlugins();

        // 配置 TypeDoc 选项
        const entryPoints = options.entryPoints.map((entry) => resolve(cwd, entry));

        // 设置选项
        app.options.setValue("entryPoints", entryPoints);
        app.options.setValue("out", outputDir);
        app.options.setValue("excludePrivate", options.excludePrivate ?? true);
        app.options.setValue("excludeProtected", options.excludeProtected ?? false);
        app.options.setValue("excludeInternal", options.excludeInternal ?? true);

        // 转换并验证项目
        const project = await app.convert();

        if (!project) {
            throw new Error("TypeDoc 无法解析项目，请检查入口文件路径");
        }

        // 生成文档
        await app.generateDocs(project, outputDir);

        return {
            success: true,
            outputDir,
            filesProcessed: options.entryPoints.length,
        };
    } catch (error) {
        return {
            success: false,
            outputDir: resolve(cwd, options.out),
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * 提取 TypeScript 类型信息（用于合并到 JSDoc）
 * @param options TypeDoc 配置选项
 * @param cwd 工作目录
 * @returns 类型信息对象
 */
export async function extractTypeInfo(
    options: TypeDocOptions,
    cwd: string = process.cwd(),
): Promise<Record<string, unknown>> {
    if (!options.enabled) {
        return {};
    }

    try {
        const app = await Application.bootstrapWithPlugins();
        const entryPoints = options.entryPoints.map((entry) => resolve(cwd, entry));

        // 配置选项
        app.options.setValue("entryPoints", entryPoints);
        app.options.setValue("excludePrivate", options.excludePrivate ?? true);
        app.options.setValue("excludeProtected", options.excludeProtected ?? false);
        app.options.setValue("excludeInternal", options.excludeInternal ?? true);

        const project = await app.convert();

        if (!project) {
            return {};
        }

        // 提取类型信息（这里需要根据实际需求实现）
        // 这是一个简化的实现，实际应该遍历 project 的反射树
        const typeInfo: Record<string, unknown> = {};

        // TODO: 实现类型信息提取逻辑
        // 可以遍历 project.children 来提取类型、接口、函数等信息
        // 示例：遍历项目反射树
        const extractReflection = (reflection: unknown, prefix: string = "") => {
            if (!reflection || typeof reflection !== "object" || reflection === null) return;

            const reflectionObj = reflection as {
                name?: string;
                kind?: unknown;
                type?: unknown;
                signatures?: unknown;
                children?: unknown[];
            };
            const name = reflectionObj.name;
            const kind = reflectionObj.kind;
            const longname = prefix ? `${prefix}#${name}` : name;

            if (name && kind) {
                typeInfo[longname] = {
                    name,
                    kind,
                    type: reflectionObj.type,
                    signatures: reflectionObj.signatures,
                    children: reflectionObj.children,
                };
            }

            // 递归处理子项
            if (typeof reflection === "object" && reflection !== null && "children" in reflection) {
                const reflectionWithChildren = reflection as { children?: unknown[] };
                if (Array.isArray(reflectionWithChildren.children)) {
                    reflectionWithChildren.children.forEach((child) => {
                        extractReflection(child, longname);
                    });
                }
            }
        };

        if (project.children) {
            project.children.forEach((child) => {
                extractReflection(child);
            });
        }

        return typeInfo;
    } catch (error) {
        console.warn("提取 TypeScript 类型信息失败:", error);
        return {};
    }
}
