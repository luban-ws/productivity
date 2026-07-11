import type { Plugin } from "vite";

/** wsx-press client 中需改写的根路径前缀（无尾部 `/`） */
function toPathPrefix(base: string): string {
    if (base === "/" || base === "./") {
        return "";
    }
    return base.endsWith("/") ? base.slice(0, -1) : base;
}

/**
 * 编译期改写 @wsxjs/wsx-press/client 内硬编码的 `/.wsx-press/`、`/docs/` 路径。
 * `base === '/'` 时不改写。
 */
export function transformWsxPressClient(code: string, base: string): string | null {
    const prefix = toPathPrefix(base);
    if (!prefix) {
        return null;
    }

    let out = code;

    out = out.replaceAll('"/.wsx-press/', `"${prefix}/.wsx-press/`);
    out = out.replaceAll('fetch("/.wsx-press/', `fetch("${prefix}/.wsx-press/`);

    out = out.replace(
        /`\/docs\/\$\{([^}]+)\}\.md`/g,
        (_match, varName: string) => `\`${prefix}/docs/\${${varName}}.md\``,
    );

    out = out.replaceAll(
        'if (e.path.startsWith("/docs/"))\n        r = e.path.slice(6);',
        'if (e.path.includes("/docs/"))\n        r = e.path.split("/docs/")[1];',
    );

    return out === code ? null : out;
}

export function wsxPressBasePlugin(base: string): Plugin {
    return {
        name: "wsx-press-base",
        enforce: "pre",
        transform(code, id) {
            if (!id.includes("wsx-press") || !/\/client\.(js|mjs|cjs)$/.test(id)) {
                return null;
            }
            return transformWsxPressClient(code, base) ?? undefined;
        },
    };
}
