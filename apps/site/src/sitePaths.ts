/** Vite 注入的站点 base（如 `/` 或 `/productivity/`） */
export const SITE_BASE = import.meta.env.BASE_URL;

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
