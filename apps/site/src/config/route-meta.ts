/**
 * 路由 Meta 配置
 * 键为应用内路由（不含 GitHub Pages base）
 */

import type { RouteMeta } from "../utils/meta-manager";
import { DOCS_ROUTE_PREFIX, getDocsRelativePath, isDocsAppPath, stripSiteBase } from "../sitePaths";

const DEFAULT_OG_IMAGE = "og-image.png";

export const routeMeta: Record<string, RouteMeta> = {
    "/": {
        title: "鲁班工坊 - 生产力工具集",
        description:
            "鲁班工坊生产力工具集，包括青鸟、文心、盘古、谛听等工具。专为 monorepo 项目设计的零配置优先工具集。",
        keywords: "鲁班工坊, 生产力工具, monorepo, 青鸟, 文心, 盘古, 谛听, 零配置",
        image: DEFAULT_OG_IMAGE,
        type: "website",
    },
    [DOCS_ROUTE_PREFIX]: {
        title: "文档 - 鲁班工坊",
        description: "鲁班工坊生产力工具的完整文档，包括使用指南、API 参考和示例。",
        keywords: "鲁班工坊文档, 生产力工具文档, 工具使用指南",
        image: DEFAULT_OG_IMAGE,
    },
    [`${DOCS_ROUTE_PREFIX}/tools/ai-prompt`]: {
        title: "AI 提示词 - 盘古与青鸟 | 鲁班工坊",
        description:
            "复制一行提示词到 Cursor / Claude / ChatGPT，在任意 monorepo 中配置盘古（dev）与青鸟（release）。",
        keywords: "AI 提示词, 盘古, 青鸟, pangu, qingniao, monorepo, Cursor, AGENTS.md",
        image: DEFAULT_OG_IMAGE,
    },
    "*": {
        title: "404 - 页面未找到 | 鲁班工坊",
        description: "您访问的页面不存在或已被移动。",
        keywords: "404, 页面未找到, 鲁班工坊",
        image: DEFAULT_OG_IMAGE,
    },
};

/**
 * 获取路由 meta；`pathname` 可为浏览器完整路径或应用内路径。
 */
export function getRouteMeta(pathname: string): RouteMeta {
    const appPath = stripSiteBase(pathname);

    if (routeMeta[appPath]) {
        return routeMeta[appPath];
    }

    const docPath = getDocsRelativePath(appPath);
    if (docPath !== null && docPath !== "") {
        const baseMeta = routeMeta[DOCS_ROUTE_PREFIX] || routeMeta["/"];
        const lastPart = docPath.split("/").pop() || docPath;
        return {
            ...baseMeta,
            title: `${lastPart} - 文档 | 鲁班工坊`,
            description: baseMeta.description || "鲁班工坊文档",
        };
    }

    if (isDocsAppPath(appPath)) {
        return routeMeta[DOCS_ROUTE_PREFIX] || routeMeta["/"];
    }

    if (routeMeta["*"]) {
        return routeMeta["*"];
    }

    return routeMeta["/"];
}
