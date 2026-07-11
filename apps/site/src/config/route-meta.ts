/**
 * 路由 Meta 配置
 * 定义每个路由的 SEO meta 信息
 */

import type { RouteMeta } from "../utils/meta-manager";

export const routeMeta: Record<string, RouteMeta> = {
    "/": {
        title: "鲁班工坊 - 生产力工具集",
        description:
            "鲁班工坊生产力工具集，包括青鸟、文心、盘古、谛听等工具。专为 monorepo 项目设计的零配置优先工具集。",
        keywords: "鲁班工坊, 生产力工具, monorepo, 青鸟, 文心, 盘古, 谛听, 零配置",
        image: "/og-image.png",
        type: "website",
    },
    "/docs": {
        title: "文档 - 鲁班工坊",
        description: "鲁班工坊生产力工具的完整文档，包括使用指南、API 参考和示例。",
        keywords: "鲁班工坊文档, 生产力工具文档, 工具使用指南",
        image: "/og-image.png",
    },
    "/docs/tools/ai-prompt": {
        title: "AI 提示词 - 盘古与青鸟 | 鲁班工坊",
        description:
            "复制一行提示词到 Cursor / Claude / ChatGPT，在任意 monorepo 中配置盘古（dev）与青鸟（release）。",
        keywords: "AI 提示词, 盘古, 青鸟, pangu, qingniao, monorepo, Cursor, AGENTS.md",
        image: "/og-image.png",
    },
    // 404 页面（通配符路由）
    "*": {
        title: "404 - 页面未找到 | 鲁班工坊",
        description: "您访问的页面不存在或已被移动。",
        keywords: "404, 页面未找到, 鲁班工坊",
        image: "/og-image.png",
    },
};

/**
 * 获取路由的 meta 信息
 * 优先检查精确匹配，然后检查参数化路由（如 /docs/:category/:page），最后是通配符 "*"，最后回退到首页
 */
export function getRouteMeta(path: string): RouteMeta {
    // 1. 优先返回精确匹配的路由 meta
    if (routeMeta[path]) {
        return routeMeta[path];
    }
    // 2. 检查文档路由：/docs/* (支持多级路径)
    if (path.startsWith("/docs/")) {
        // 支持多级路径，例如：/docs/guide/essentials/getting-started
        const docPath = path.slice(6); // 移除 "/docs/" 前缀
        if (docPath) {
            // 使用文档路由的 meta，但可以根据需要动态生成标题
            const baseMeta = routeMeta["/docs"] || routeMeta["/"];
            // 从路径中提取最后一个部分作为标题（如果没有元数据）
            const lastPart = docPath.split("/").pop() || docPath;
            return {
                ...baseMeta,
                title: `${lastPart} - 文档 | 鲁班工坊`,
                description: baseMeta.description || "鲁班工坊文档",
            };
        }
    }
    // 3. 如果没有精确匹配，检查通配符 "*"（用于 404 页面）
    if (routeMeta["*"]) {
        return routeMeta["*"];
    }
    // 4. 最后回退到首页 meta
    return routeMeta["/"];
}
