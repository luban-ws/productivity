/**
 * JSDoc 插件：支持 @aliases 和 @category 标签
 *
 * 此插件为文心工具的一部分，提供以下功能：
 * - @aliases: 为函数/类创建别名文档
 * - @category: 为方法添加分类标签
 *
 * 使用示例：
 * @aliases main, entry
 * @category Core
 */

interface Doclet {
    [key: string]: unknown;
    longname?: string;
    memberof?: string;
    name?: string;
    returns?: unknown;
    examples?: unknown[];
    meta?: unknown;
    aliases?: string[];
    category?: string;
    description?: string;
    isAlias?: boolean;
}

interface Tag {
    text: string;
}

interface Dict {
    defineTag: (name: string, options: { onTagged: (doclet: Doclet, tag: Tag) => void }) => void;
}

interface ParseCompleteEvent {
    doclets: Doclet[];
}

/**
 * 创建别名 doclet
 */
function createAlias(doclet: Doclet, alias: string): Doclet {
    const clone: Doclet = {};

    // 复制所有属性
    Object.keys(doclet).forEach((key) => {
        clone[key] = doclet[key];
    });

    // 处理别名
    if (alias.indexOf("#") !== -1) {
        clone.longname = alias;
        const parts = alias.split("#");
        clone.memberof = parts[0];
        clone.name = parts[1];
    } else {
        clone.longname = `${clone.memberof}#${alias}`;
        clone.name = alias;
    }

    // 删除不需要的属性
    delete clone.returns;
    delete clone.examples;
    delete clone.meta;
    delete clone.aliases;

    clone.isAlias = true;
    clone.description = `Alias for <a href="#${doclet.name}">${doclet.longname}</a>`;

    return clone;
}

/**
 * JSDoc 插件处理器
 * 在解析完成后为有 @aliases 标签的 doclet 创建别名文档
 */
const handlers = {
    parseComplete: function (e: ParseCompleteEvent): void {
        const doclets = e.doclets.slice();

        doclets.forEach((doclet) => {
            // 为有别名的 doclet 创建副本
            if (doclet.aliases) {
                doclet.aliases.forEach((alias) => {
                    e.doclets.push(createAlias(doclet, alias));
                });
            }
        });
    },
};

/**
 * 定义自定义标签
 * @param dict JSDoc 标签字典
 */
function defineTags(dict: Dict): void {
    dict.defineTag("aliases", {
        onTagged: function (doclet: Doclet, tag: Tag): void {
            doclet.aliases = tag.text.split(",").map((s) => s.trim());
        },
    });

    dict.defineTag("category", {
        onTagged: function (doclet: Doclet, tag: Tag): void {
            doclet.category = tag.text.trim();
        },
    });
}

// CommonJS 导出（JSDoc 需要）
// Vite 会自动将 export 转换为 CommonJS 的 module.exports
export { handlers, defineTags };
