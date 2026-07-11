/** GitHub Pages 项目站 repo 名，与 `/<repo>/` base 一致 */
export const REPO_SLUG = "productivity";

/**
 * 解析 Vite `base`：本地 `/`；GH Pages 项目站 `/<repo>/`；自定义域名 `/`。
 */
export function resolveSiteBase(repoSlug: string): string {
    if (process.env.VITE_BASE) {
        return process.env.VITE_BASE;
    }
    const isGhPages = process.env.GITHUB_PAGES === "true";
    const hasCustomDomain = process.env.CUSTOM_DOMAIN === "true";
    if (isGhPages && !hasCustomDomain) {
        return `/${repoSlug}/`;
    }
    return "/";
}
