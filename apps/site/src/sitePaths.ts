/** Vite 注入的站点 base（如 `/` 或 `/productivity/`） */
export const SITE_BASE = import.meta.env.BASE_URL;

/** 应用内文档路由前缀（不含 GitHub Pages base） */
export const DOCS_ROUTE_PREFIX = "/docs";

/**
 * 将应用内路由转为带 base 的 History API 路径。
 */
export function sitePathWithBase(baseUrl: string, route: string): string {
    const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    if (route === "/" || route === "") {
        if (baseUrl === "/") {
            return "/";
        }
        return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    }

    const segment = route.startsWith("/") ? route : `/${route}`;
    return base ? `${base}${segment}` : segment;
}

/** 当前部署 base 下的路由路径 */
export function sitePath(route: string): string {
    return sitePathWithBase(SITE_BASE, route);
}

/** public 静态资源路径（favicon、manifest 等） */
export function siteAsset(assetPath: string): string {
    const trimmed = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
    return `${SITE_BASE}${trimmed}`;
}

/**
 * 从浏览器 pathname 剥离 GitHub Pages base，得到应用内路由。
 * 例：`/productivity/docs/foo` → `/docs/foo`
 */
export function stripSiteBaseWithBase(baseUrl: string, pathname: string): string {
    if (baseUrl === "/") {
        return pathname || "/";
    }

    const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    if (pathname === base || pathname === `${base}/`) {
        return "/";
    }

    if (pathname.startsWith(`${base}/`)) {
        const appPath = pathname.slice(base.length);
        return appPath || "/";
    }

    return pathname;
}

export function stripSiteBase(pathname: string): string {
    return stripSiteBaseWithBase(SITE_BASE, pathname);
}

/** 应用内路由是否为文档页 */
export function isDocsAppPath(appPath: string): boolean {
    return appPath === DOCS_ROUTE_PREFIX || appPath.startsWith(`${DOCS_ROUTE_PREFIX}/`);
}

/** 从应用内路由提取 wsx-press 文档相对路径，非文档路由返回 null */
export function getDocsRelativePath(appPath: string): string | null {
    const prefix = `${DOCS_ROUTE_PREFIX}/`;
    if (!appPath.startsWith(prefix)) {
        return null;
    }

    const docPath = appPath.slice(prefix.length);
    return docPath;
}

/** 当前页面 canonical URL（含 base，不含 hash） */
export function getCanonicalUrl(): string {
    return `${window.location.origin}${window.location.pathname}${window.location.search}`;
}

/**
 * GitHub Pages 项目站：`/repo` → `/repo/`，避免相对资源解析到错误 origin。
 */
export function normalizeSitePathname(): void {
    if (SITE_BASE === "/") {
        return;
    }

    const base = SITE_BASE.endsWith("/") ? SITE_BASE.slice(0, -1) : SITE_BASE;
    const { pathname, search, hash } = window.location;

    if (pathname === base) {
        window.history.replaceState(null, "", `${base}/${search}${hash}`);
    }
}
