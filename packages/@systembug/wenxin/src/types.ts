/**
 * 配置接口定义
 * 支持 JSDoc 和 TypeScript 文档生成的通用配置
 */

/**
 * 文档生成模式
 */
export type DocMode = 'jsdoc' | 'typedoc' | 'hybrid';

/**
 * JSDoc 配置选项
 */
export interface JSDocOptions {
  /** 是否启用 JSDoc 处理 */
  enabled: boolean;
  /** 源文件路径（支持 glob 模式） */
  source: {
    include: string[];
    exclude?: string[];
    excludePattern?: string;
  };
  /** 输出配置 */
  opts: {
    /** 输出目录 */
    destination: string;
    /** 模板路径 */
    template?: string;
    /** 是否递归处理子目录 */
    recurse?: boolean;
    /** 是否显示详细信息 */
    verbose?: boolean;
  };
  /** 插件列表 */
  plugins?: string[];
  /** Markdown 配置 */
  markdown?: {
    parser?: string;
    dialect?: string;
  };
}

/**
 * TypeDoc 配置选项
 */
export interface TypeDocOptions {
  /** 是否启用 TypeDoc 处理 */
  enabled: boolean;
  /** 入口文件 */
  entryPoints: string[];
  /** 输出目录 */
  out: string;
  /** 是否包含私有成员 */
  excludePrivate?: boolean;
  /** 是否包含受保护成员 */
  excludeProtected?: boolean;
  /** 是否包含内部成员 */
  excludeInternal?: boolean;
  /** 其他 TypeDoc 选项 */
  [key: string]: any;
}

/**
 * 通用文档生成配置
 */
export interface ApiDocConfig {
  /** 文档生成模式 */
  mode?: DocMode;
  /** JSDoc 配置 */
  jsdoc?: Partial<JSDocOptions>;
  /** TypeDoc 配置 */
  typedoc?: Partial<TypeDocOptions>;
  /** 工作目录（相对于配置文件） */
  cwd?: string;
  /** 是否合并类型信息到 JSDoc 输出 */
  mergeTypes?: boolean;
}

/**
 * 处理结果
 */
export interface ProcessResult {
  /** 是否成功 */
  success: boolean;
  /** 输出目录 */
  outputDir: string;
  /** 错误信息（如果有） */
  error?: string;
  /** 处理的文件数量 */
  filesProcessed?: number;
}

