/**
 * Demo 选项配置类型
 */
export interface DemoOption {
  /**
   * Demo 显示名称
   */
  name: string;

  /**
   * Demo 值（用于命令行参数）
   */
  value: string;

  /**
   * Demo 描述
   */
  description: string;

  /**
   * 包名（用于 pnpm --filter）
   */
  package: string;
}

/**
 * 配置文件类型
 */
export interface DevConfig {
  /**
   * 项目名称（用于欢迎信息）
   */
  projectName?: string;

  /**
   * Demo 选项列表
   */
  demos: DemoOption[];

  /**
   * 包管理器命令（默认: pnpm）
   */
  packageManager?: string;
}
