/**
 * TypeScript 类型处理器
 * 使用 TypeDoc 提取 TypeScript 类型信息
 */

import { Application } from 'typedoc';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { TypeDocOptions, ProcessResult } from './types.js';

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
      outputDir: '',
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
    const app = new Application();

    // 配置 TypeDoc 选项
    const typedocOptions: any = {
      entryPoints: options.entryPoints.map((entry) => resolve(cwd, entry)),
      out: outputDir,
      excludePrivate: options.excludePrivate ?? true,
      excludeProtected: options.excludeProtected ?? false,
      excludeInternal: options.excludeInternal ?? true,
      // 可以添加更多 TypeDoc 选项
      ...Object.fromEntries(
        Object.entries(options).filter(
          ([key]) =>
            !['enabled', 'entryPoints', 'out', 'excludePrivate', 'excludeProtected', 'excludeInternal'].includes(key),
        ),
      ),
    };

    // 应用选项
    app.options.setValues(typedocOptions);

    // 转换并验证项目
    const project = app.convert(typedocOptions.entryPoints);

    if (!project) {
      throw new Error('TypeDoc 无法解析项目，请检查入口文件路径');
    }

    // 生成文档
    await app.generateDocs(project, typedocOptions.out);

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
): Promise<Record<string, any>> {
  if (!options.enabled) {
    return {};
  }

  try {
    const app = new Application();
    const entryPoints = options.entryPoints.map((entry) => resolve(cwd, entry));
    
    // 配置选项
    app.options.setValues({
      excludePrivate: options.excludePrivate ?? true,
      excludeProtected: options.excludeProtected ?? false,
      excludeInternal: options.excludeInternal ?? true,
    });
    
    const project = app.convert(entryPoints);

    if (!project) {
      return {};
    }

    // 提取类型信息（这里需要根据实际需求实现）
    // 这是一个简化的实现，实际应该遍历 project 的反射树
    const typeInfo: Record<string, any> = {};

    // TODO: 实现类型信息提取逻辑
    // 可以遍历 project.children 来提取类型、接口、函数等信息
    // 示例：遍历项目反射树
    const extractReflection = (reflection: any, prefix: string = '') => {
      if (!reflection) return;
      
      const name = reflection.name;
      const kind = reflection.kind;
      const longname = prefix ? `${prefix}#${name}` : name;
      
      if (name && kind) {
        typeInfo[longname] = {
          name,
          kind,
          type: reflection.type,
          signatures: reflection.signatures,
          children: reflection.children,
        };
      }
      
      // 递归处理子项
      if (reflection.children) {
        reflection.children.forEach((child: any) => {
          extractReflection(child, longname);
        });
      }
    };
    
    if (project.children) {
      project.children.forEach((child: any) => {
        extractReflection(child);
      });
    }

    return typeInfo;
  } catch (error) {
    console.warn('提取 TypeScript 类型信息失败:', error);
    return {};
  }
}

