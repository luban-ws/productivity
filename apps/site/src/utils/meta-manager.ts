/**
 * MetaManager - 动态管理页面的 meta 标签和 SEO 信息
 */

import { getCanonicalUrl, siteAsset } from "../sitePaths";

export interface RouteMeta {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

export class MetaManager {
    private static readonly DEFAULT_IMAGE = "og-image.png";
    private static readonly DEFAULT_TYPE = "website";

    static update(meta: RouteMeta): void {
        document.title = meta.title;

        this.setMeta("description", meta.description);
        if (meta.keywords) {
            this.setMeta("keywords", meta.keywords);
        }
        if (meta.author) {
            this.setMeta("author", meta.author);
        }

        this.setOGMeta("og:title", meta.title);
        this.setOGMeta("og:description", meta.description);
        this.setOGMeta("og:type", meta.type || this.DEFAULT_TYPE);
        this.setOGMeta("og:url", meta.url || getCanonicalUrl());
        this.setOGMeta("og:image", this.resolveImageUrl(meta.image || this.DEFAULT_IMAGE));

        this.setMeta("twitter:card", "summary_large_image");
        this.setMeta("twitter:title", meta.title);
        this.setMeta("twitter:description", meta.description);
        if (meta.image) {
            this.setMeta("twitter:image", this.resolveImageUrl(meta.image));
        }

        if (meta.publishedTime) {
            this.setOGMeta("article:published_time", meta.publishedTime);
        }
        if (meta.modifiedTime) {
            this.setOGMeta("article:modified_time", meta.modifiedTime);
        }
    }

    private static setMeta(name: string, content: string): void {
        let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

        if (!element) {
            element = document.createElement("meta");
            element.setAttribute("name", name);
            document.head.appendChild(element);
        }

        element.setAttribute("content", content);
    }

    private static setOGMeta(property: string, content: string): void {
        let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;

        if (!element) {
            element = document.createElement("meta");
            element.setAttribute("property", property);
            document.head.appendChild(element);
        }

        element.setAttribute("content", content);
    }

    static setStructuredData(data: Record<string, unknown>): void {
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    /** 静态资源或绝对 URL → 完整 og:image URL */
    static resolveImageUrl(imagePath: string): string {
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }

        const assetPath = siteAsset(imagePath.startsWith("/") ? imagePath.slice(1) : imagePath);
        return `${window.location.origin}${assetPath}`;
    }
}
