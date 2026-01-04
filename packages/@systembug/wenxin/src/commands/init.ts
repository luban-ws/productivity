/**
 * 初始化配置文件生成器
 * 生成文心配置文件模板
 */

import { existsSync } from "fs";
import { join } from "path";

/**
 * 获取包路径（支持 pnpm/npm/yarn，都使用 node_modules）
 */
function getPackagePath(_rootDir: string): string {
    // 所有包管理器都使用 node_modules 目录
    // pnpm 使用符号链接，但路径仍然是 node_modules/@systembug/wenxin
    return "./node_modules/@systembug/wenxin";
}

/**
 * 检测项目类型（TypeScript/JavaScript）
 */
function detectProjectType(rootDir: string): "typescript" | "javascript" {
    const tsConfigPath = join(rootDir, "tsconfig.json");
    if (existsSync(tsConfigPath)) {
        return "typescript";
    }
    return "javascript";
}

/**
 * 检测源文件目录
 */
function detectSourceDir(rootDir: string): string {
    const possibleDirs = ["src", "lib", "source"];
    for (const dir of possibleDirs) {
        if (existsSync(join(rootDir, dir))) {
            return dir;
        }
    }
    return "src"; // 默认
}

/**
 * 检测入口文件
 */
function detectEntryPoints(rootDir: string, sourceDir: string): string[] {
    const possibleEntries = [
        join(sourceDir, "index.ts"),
        join(sourceDir, "index.js"),
        join(sourceDir, "main.ts"),
        join(sourceDir, "main.js"),
        "index.ts",
        "index.js",
    ];

    for (const entry of possibleEntries) {
        if (existsSync(join(rootDir, entry))) {
            return [entry];
        }
    }

    // 如果没有找到，返回默认值
    return [join(sourceDir, "index.ts")];
}

/**
 * 生成配置文件模板
 * @param format 配置文件格式
 * @returns 配置文件内容
 */
export function generateConfigTemplate(format: "ts" | "js" | "json" = "json"): string {
    const rootDir = process.cwd();
    const projectType = detectProjectType(rootDir);
    const sourceDir = detectSourceDir(rootDir);
    const entryPoints = detectEntryPoints(rootDir, sourceDir);

    const includePatterns =
        projectType === "typescript"
            ? [`${sourceDir}/**/*.ts`, `${sourceDir}/**/*.tsx`]
            : [`${sourceDir}/**/*.js`, `${sourceDir}/**/*.jsx`];

    const excludePatterns = [
        "node_modules",
        "dist",
        "build",
        "**/*.test.ts",
        "**/*.test.js",
        "**/*.spec.ts",
        "**/*.spec.js",
    ];

    const packagePath = getPackagePath(rootDir);

    if (format === "json") {
        return generateJsonConfig(
            includePatterns,
            excludePatterns,
            entryPoints,
            sourceDir,
            packagePath,
        );
    } else if (format === "js") {
        return generateJsConfig(
            includePatterns,
            excludePatterns,
            entryPoints,
            sourceDir,
            packagePath,
        );
    } else {
        return generateTsConfig(
            includePatterns,
            excludePatterns,
            entryPoints,
            sourceDir,
            packagePath,
        );
    }
}

/**
 * 生成 JSON 配置
 */
function generateJsonConfig(
    includePatterns: string[],
    excludePatterns: string[],
    entryPoints: string[],
    sourceDir: string,
    packagePath: string,
): string {
    return `{
  "$schema": "${packagePath}/schemas/config.schema.json",
  "mode": "hybrid",
  "mergeTypes": true,
  "jsdoc": {
    "enabled": true,
    "source": {
      "include": ${JSON.stringify(includePatterns, null, 6).replace(/^/gm, "      ")},
      "exclude": ${JSON.stringify(excludePatterns, null, 6).replace(/^/gm, "      ")}
    },
    "opts": {
      "destination": "doc",
      "template": "${packagePath}/jsdoc-template",
      "recurse": true,
      "verbose": false
    },
    "plugins": [
      "plugins/markdown",
      "${packagePath}/dist/jsdoc-aliases.js"
    ],
    "markdown": {
      "parser": "evilstreak",
      "dialect": "Markuru"
    }
  },
  "typedoc": {
    "enabled": true,
    "entryPoints": ${JSON.stringify(entryPoints, null, 6).replace(/^/gm, "      ")},
    "out": "doc",
    "excludePrivate": true,
    "excludeProtected": false,
    "excludeInternal": true
  }
}
`;
}

/**
 * 生成 JavaScript 配置
 */
function generateJsConfig(
    includePatterns: string[],
    excludePatterns: string[],
    entryPoints: string[],
    sourceDir: string,
    packagePath: string,
): string {
    return `/**
 * 文心 API 文档生成工具配置
 *
 * 注意：此配置文件完全可选！
 * 文心支持零配置，会自动从项目结构推断所有信息。
 * 只需取消注释需要覆盖自动检测的部分。
 */

export default {
  // 文档生成模式：jsdoc | typedoc | hybrid（推荐）
  mode: 'hybrid',

  // 是否合并 TypeScript 类型信息到 JSDoc 文档中
  mergeTypes: true,

  // JSDoc 配置
  jsdoc: {
    enabled: true,
    source: {
      include: ${JSON.stringify(includePatterns, null, 6).replace(/^/gm, "      ")},
      exclude: ${JSON.stringify(excludePatterns, null, 6).replace(/^/gm, "      ")}
    },
    opts: {
      destination: 'doc',
      template: '${packagePath}/jsdoc-template',
      recurse: true,
      verbose: false
    },
    plugins: [
      'plugins/markdown',
      '${packagePath}/dist/jsdoc-aliases.js'
    ],
    markdown: {
      parser: 'evilstreak',
      dialect: 'Markuru'
    }
  },

  // TypeDoc 配置
  typedoc: {
    enabled: true,
    entryPoints: ${JSON.stringify(entryPoints, null, 6).replace(/^/gm, "      ")},
    out: 'doc',
    excludePrivate: true,
    excludeProtected: false,
    excludeInternal: true
  }
};
`;
}

/**
 * 生成 TypeScript 配置
 */
function generateTsConfig(
    includePatterns: string[],
    excludePatterns: string[],
    entryPoints: string[],
    sourceDir: string,
    packagePath: string,
): string {
    return `/**
 * 文心 API 文档生成工具配置
 *
 * 注意：此配置文件完全可选！
 * 文心支持零配置，会自动从项目结构推断所有信息。
 * 只需取消注释需要覆盖自动检测的部分。
 */

import type { ApiDocConfig } from '@systembug/wenxin';

const config: ApiDocConfig = {
  // 文档生成模式：jsdoc | typedoc | hybrid（推荐）
  mode: 'hybrid',

  // 是否合并 TypeScript 类型信息到 JSDoc 文档中
  mergeTypes: true,

  // JSDoc 配置
  jsdoc: {
    enabled: true,
    source: {
      include: ${JSON.stringify(includePatterns, null, 6).replace(/^/gm, "      ")},
      exclude: ${JSON.stringify(excludePatterns, null, 6).replace(/^/gm, "      ")}
    },
    opts: {
      destination: 'doc',
      template: '${packagePath}/jsdoc-template',
      recurse: true,
      verbose: false
    },
    plugins: [
      'plugins/markdown',
      '${packagePath}/dist/jsdoc-aliases.js'
    ],
    markdown: {
      parser: 'evilstreak',
      dialect: 'Markuru'
    }
  },

  // TypeDoc 配置
  typedoc: {
    enabled: true,
    entryPoints: ${JSON.stringify(entryPoints, null, 6).replace(/^/gm, "      ")},
    out: 'doc',
    excludePrivate: true,
    excludeProtected: false,
    excludeInternal: true
  }
};

export default config;
`;
}
