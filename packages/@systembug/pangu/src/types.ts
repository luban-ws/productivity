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

    /**
     * 包管理器命令（可选）
     * 如果未指定，使用全局的 packageManager
     * 可选值: "pnpm" | "npm" | "yarn" | "bun" 等
     */
    packageManager?: string;

    /**
     * 额外的启动参数（可选）
     * 这些参数会被传递给 dev 命令
     * 例如: ["--port", "3000", "--host"]
     */
    args?: string[];
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
