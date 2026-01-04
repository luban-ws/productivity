/**
 * 类型与注释合并器
 * 将 TypeScript 类型信息合并到 JSDoc 注释中
 */

/**
 * 合并 TypeScript 类型信息到 JSDoc 数据
 * @param jsdocData JSDoc 解析后的数据
 * @param typeInfo TypeScript 类型信息
 * @returns 合并后的数据
 */
export function mergeTypeInfo(
    jsdocData: Record<string, unknown>[],
    typeInfo: Record<string, unknown>,
): Record<string, unknown>[] {
    // 如果类型信息为空，直接返回 JSDoc 数据
    if (!typeInfo || Object.keys(typeInfo).length === 0) {
        return jsdocData;
    }

    // 创建类型信息索引（以 longname 为键）
    const typeIndex = createTypeIndex(typeInfo);

    // 合并每个 doclet
    return jsdocData.map((doclet) => {
        const merged = { ...doclet };
        const longname = typeof doclet.longname === "string" ? doclet.longname : undefined;
        const typeData = longname ? typeIndex[longname] : undefined;

        if (typeData) {
            // 如果 JSDoc 中没有类型信息，使用 TypeScript 类型
            if (!merged.type && typeData.type) {
                merged.type = typeData.type;
            }

            // 如果 JSDoc 中没有参数类型，使用 TypeScript 参数类型
            const typeDataParams = Array.isArray(typeData.params) ? typeData.params : undefined;
            if (!merged.params && typeDataParams) {
                merged.params = typeDataParams;
            } else if (Array.isArray(merged.params) && typeDataParams) {
                // 合并参数类型信息
                merged.params = mergeParams(merged.params, typeDataParams);
            }

            // 如果 JSDoc 中没有返回类型，使用 TypeScript 返回类型
            if (!merged.returns && typeData.returns) {
                merged.returns = typeData.returns;
            }

            // 合并其他类型信息
            const typeDataProperties = Array.isArray(typeData.properties) ? typeData.properties : undefined;
            if (typeDataProperties) {
                const mergedProperties = Array.isArray(merged.properties) ? merged.properties : [];
                merged.properties = mergeProperties(mergedProperties, typeDataProperties);
            }
        }

        return merged;
    });
}

/**
 * 创建类型信息索引
 * @param typeInfo 类型信息对象
 * @returns 以 longname 为键的索引
 */
function createTypeIndex(typeInfo: Record<string, unknown>): Record<string, unknown> {
    const index: Record<string, unknown> = {};

    // 递归遍历类型信息，建立索引
    function indexType(obj: unknown, prefix: string = "") {
        if (!obj || typeof obj !== "object") {
            return;
        }

        if (typeof obj === "object" && obj !== null && "name" in obj && "kind" in obj) {
            const objWithName = obj as { name: string };
            const longname = prefix ? `${prefix}#${objWithName.name}` : objWithName.name;
            index[longname] = obj;
        }

        // 处理子成员
        if (typeof obj === "object" && obj !== null && "children" in obj) {
            const objWithChildren = obj as { name?: string; children?: unknown[] };
            const newPrefix = prefix
                ? `${prefix}#${objWithChildren.name || ""}`
                : objWithChildren.name || "";
            if (Array.isArray(objWithChildren.children)) {
                objWithChildren.children.forEach((child) => indexType(child, newPrefix));
            }
        }

        // 处理其他可能的嵌套结构
        if (typeof obj === "object" && obj !== null) {
            Object.keys(obj).forEach((key) => {
                if (key !== "children" && Array.isArray((obj as Record<string, unknown>)[key])) {
                    ((obj as Record<string, unknown>)[key] as unknown[]).forEach((item) =>
                        indexType(item, prefix),
                    );
                }
            });
        }
    }

    // 如果 typeInfo 是数组，遍历每个项
    if (Array.isArray(typeInfo)) {
        typeInfo.forEach((item) => indexType(item));
    } else {
        indexType(typeInfo);
    }

    return index;
}

/**
 * 合并参数信息
 * @param jsdocParams JSDoc 参数
 * @param tsParams TypeScript 参数
 * @returns 合并后的参数
 */
function mergeParams(jsdocParams: unknown[], tsParams: unknown[]): unknown[] {
    const merged = [...jsdocParams];

    tsParams.forEach((tsParam, index) => {
        const mergedItem = merged[index];
        if (mergedItem && typeof mergedItem === "object" && mergedItem !== null) {
            const mergedObj = mergedItem as Record<string, unknown>;
            const tsParamObj = tsParam && typeof tsParam === "object" && tsParam !== null ? (tsParam as Record<string, unknown>) : null;
            // 如果 JSDoc 参数没有类型，使用 TypeScript 类型
            if (!mergedObj.type && tsParamObj?.type) {
                mergedObj.type = tsParamObj.type;
            }
        } else {
            // 如果 JSDoc 中没有该参数，添加它
            merged.push(tsParam);
        }
    });

    return merged;
}

/**
 * 合并属性信息
 * @param jsdocProps JSDoc 属性
 * @param tsProps TypeScript 属性
 * @returns 合并后的属性
 */
function mergeProperties(jsdocProps: unknown[], tsProps: unknown[]): unknown[] {
    const propMap = new Map<string, unknown>();

    // 先添加 JSDoc 属性
    jsdocProps.forEach((prop) => {
        if (prop && typeof prop === "object" && prop !== null && "name" in prop) {
            const propObj = prop as { name: string };
            propMap.set(propObj.name, prop);
        }
    });

    // 然后合并 TypeScript 属性
    tsProps.forEach((prop) => {
        if (prop && typeof prop === "object" && prop !== null && "name" in prop) {
            const propObj = prop as { name: string; type?: unknown };
            const existing = propMap.get(propObj.name);
            if (existing && typeof existing === "object" && existing !== null) {
                const existingObj = existing as { type?: unknown };
                // 合并现有属性
                if (!existingObj.type && propObj.type) {
                    existingObj.type = propObj.type;
                }
            } else {
                // 添加新属性
                propMap.set(propObj.name, prop);
            }
        }
    });

    return Array.from(propMap.values());
}
