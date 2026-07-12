export interface CopyCodeBlockElement extends HTMLElement {
    code?: string;
}

const DOC_COPY_BLOCK_CLASS = "doc-copy-code-block";
const MARKDOWN_FENCE_PATTERN = /```[\w-]*\n([\s\S]*?)```/g;

interface DocPageElement extends Element {
    markdown?: string;
}

/** 从 markdown 提取 fenced code 块（按文档顺序） */
export function extractMarkdownCodeFences(markdown: string): string[] {
    const fences: string[] = [];
    const pattern = new RegExp(MARKDOWN_FENCE_PATTERN.source, "g");
    let match = pattern.exec(markdown);

    while (match !== null) {
        fences.push(match[1]?.trimEnd() ?? "");
        match = pattern.exec(markdown);
    }

    return fences;
}

function getDocPageMarkdown(root: ParentNode): string {
    const fromRoot =
        root instanceof Element
            ? (root.querySelector("wsx-doc-page") ??
              root.closest("wsx-doc-layout")?.querySelector("wsx-doc-page"))
            : null;
    const docPage = (fromRoot ?? document.querySelector("wsx-doc-page")) as DocPageElement | null;

    return docPage?.markdown ?? "";
}

/** 从 wsx-marked-code 读取可复制文本 */
export function getMarkedCodeText(block: Element): string {
    const fromAttr = block.getAttribute("code");
    if (fromAttr) {
        return fromAttr;
    }

    return block.querySelector("code")?.textContent?.trim() ?? "";
}

function getCopyBlockText(block: Element): string {
    const host = block as CopyCodeBlockElement;
    if (host.code) {
        return host.code;
    }

    const fromShadow = host.shadowRoot?.querySelector("pre code")?.textContent?.trim();
    if (fromShadow) {
        return fromShadow;
    }

    return host.querySelector("pre code")?.textContent?.trim() ?? "";
}

function isDocCopyBlock(element: Element | null): element is CopyCodeBlockElement {
    return element?.matches(`copy-code-block.${DOC_COPY_BLOCK_CLASS}`) ?? false;
}

/** 移除重复的 doc copy-code-block（保留首个） */
export function dedupeDocCopyBlocks(root: ParentNode): void {
    const seen = new Set<string>();

    root.querySelectorAll(`copy-code-block.${DOC_COPY_BLOCK_CLASS}`).forEach((block) => {
        const text = getCopyBlockText(block);
        if (!text || seen.has(text)) {
            block.remove();
            return;
        }

        seen.add(text);
    });
}

/** 删除框架重渲染留下的空 marked 壳层（旁边已有 copy 块） */
export function removeOrphanMarkedShells(root: ParentNode): void {
    root.querySelectorAll("wsx-marked-code").forEach((block) => {
        const text = getMarkedCodeText(block);
        if (text) {
            return;
        }

        const prev = block.previousElementSibling;
        const next = block.nextElementSibling;
        if (isDocCopyBlock(prev) || isDocCopyBlock(next)) {
            block.remove();
        }
    });
}

/** 用 copy-code-block 原位替换 wsx-marked-code */
export function enhanceDocMarkedCodeBlocks(root: ParentNode): number {
    removeOrphanMarkedShells(root);
    dedupeDocCopyBlocks(root);

    const fences = extractMarkdownCodeFences(getDocPageMarkdown(root));
    let enhanced = 0;

    root.querySelectorAll("wsx-marked-code").forEach((block, index) => {
        let text = getMarkedCodeText(block);
        if (!text && index < fences.length) {
            text = fences[index] ?? "";
        }

        if (!text) {
            block.remove();
            return;
        }

        if (isDocCopyBlock(block.nextElementSibling)) {
            block.remove();
            return;
        }

        const copyBlock = document.createElement("copy-code-block") as CopyCodeBlockElement;
        copyBlock.className = DOC_COPY_BLOCK_CLASS;
        block.replaceWith(copyBlock);
        copyBlock.code = text;
        enhanced += 1;
    });

    return enhanced;
}

const MAX_ENHANCE_ATTEMPTS = 30;

/** 等待 marked 异步填充 code 后再增强；持续清理重渲染空壳 */
export function scheduleEnhanceDocMarkedCodeBlocks(root: ParentNode, attempt = 0): void {
    enhanceDocMarkedCodeBlocks(root);

    const hasOrphanShells = Array.from(root.querySelectorAll("wsx-marked-code")).some((block) => {
        const text = getMarkedCodeText(block);
        if (text) {
            return true;
        }

        const prev = block.previousElementSibling;
        const next = block.nextElementSibling;
        return !isDocCopyBlock(prev) && !isDocCopyBlock(next);
    });

    if (attempt >= MAX_ENHANCE_ATTEMPTS || !hasOrphanShells) {
        removeOrphanMarkedShells(root);
        return;
    }

    requestAnimationFrame(() => {
        scheduleEnhanceDocMarkedCodeBlocks(root, attempt + 1);
    });
}
