import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid(
    defineConfig({
        title: "Productivity",
        description: "Productivity monorepo documentation",
        head: [
            // 可以在这里添加 favicon 等 head 标签
            // ['link', { rel: 'icon', href: '/favicon.ico' }],
        ],
        // 本地开发时使用 /，GitHub Pages 部署时使用 /productivity/
        // 可以通过环境变量 VITEPRESS_BASE 来覆盖
        // 默认本地开发使用 /，生产构建使用 /productivity/
        base: process.env.VITEPRESS_BASE || "/",
        lang: "zh-CN",

        // 忽略死链接（指向仓库外的文件）
        ignoreDeadLinks: true,

        // 主题配置
        themeConfig: {
            // https://vitepress.dev/reference/default-theme-config
            nav: [
                { text: "首页", link: "/" },
                { text: "工具", link: "/tools/diting" },
                { text: "RFCs", link: "/rfc/" },
            ],

            sidebar: [
                {
                    text: "开始",
                    items: [{ text: "首页", link: "/" }],
                },
                {
                    text: "工具",
                    items: [
                        { text: "谛听 (Diting)", link: "/tools/diting" },
                        { text: "青鸟 (Qingniao)", link: "/tools/qingniao" },
                    ],
                },
                {
                    text: "RFCs",
                    items: [
                        { text: "RFC 列表", link: "/rfc/" },
                        {
                            text: "RFC 0001 - 通用发布工具",
                            link: "/rfc/0001-universal-publish-tool",
                        },
                    ],
                },
            ],

            socialLinks: [{ icon: "github", link: "https://github.com/systembug/productivity" }],

            search: {
                provider: "local",
            },

            footer: {
                message: "Released under the MIT License.",
                copyright: "Copyright © 2024 Productivity",
            },
        },

        // Mermaid 配置选项
        mermaid: {
            // 可以在这里配置 Mermaid 选项
            // 参考：https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
        },

        // Vite 配置，修复 dayjs 等模块的导入问题
        vite: {
            optimizeDeps: {
                include: ["dayjs", "mermaid"],
                exclude: [],
            },
            ssr: {
                noExternal: ["mermaid"],
            },
        },
    }),
);
