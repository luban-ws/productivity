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
    jsdocData: Record<string, any>[],
    typeInfo: Record<string, any>,
): Record<string, any>[] {
    // 如果类型信息为空，直接返回 JSDoc 数据
    if (!typeInfo || Object.keys(typeInfo).length === 0) {
        return jsdocData;
    }

    // 创建类型信息索引（以 longname 为键）
    const typeIndex = createTypeIndex(typeInfo);

    // 合并每个 doclet
    return jsdocData.map((doclet) => {
        const merged = { ...doclet };
        const typeData = typeIndex[doclet.longname];

        if (typeData) {
            // 如果 JSDoc 中没有类型信息，使用 TypeScript 类型
            if (!merged.type && typeData.type) {
                merged.type = typeData.type;
            }

            // 如果 JSDoc 中没有参数类型，使用 TypeScript 参数类型
            if (!merged.params && typeData.params) {
                merged.params = typeData.params;
            } else if (merged.params && typeData.params) {
                // 合并参数类型信息
                merged.params = mergeParams(merged.params, typeData.params);
            }

            // 如果 JSDoc 中没有返回类型，使用 TypeScript 返回类型
            if (!merged.returns && typeData.returns) {
                merged.returns = typeData.returns;
            }

            // 合并其他类型信息
            if (typeData.properties) {
                merged.properties = mergeProperties(merged.properties || [], typeData.properties);
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
function createTypeIndex(typeInfo: Record<string, any>): Record<string, any> {
    const index: Record<string, any> = {};

    // 递归遍历类型信息，建立索引
    function indexType(obj: any, prefix: string = "") {
        if (!obj || typeof obj !== "object") {
            return;
        }

        if (obj.name && obj.kind) {
            const longname = prefix ? `${prefix}#${obj.name}` : obj.name;
            index[longname] = obj;
        }

        // 处理子成员
        if (obj.children) {
            const newPrefix = prefix ? `${prefix}#${obj.name || ""}` : obj.name || "";
            obj.children.forEach((child: any) => indexType(child, newPrefix));
        }

        // 处理其他可能的嵌套结构
        Object.keys(obj).forEach((key) => {
            if (key !== "children" && Array.isArray(obj[key])) {
                obj[key].forEach((item: any) => indexType(item, prefix));
            }
        });
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
function mergeParams(jsdocParams: any[], tsParams: any[]): any[] {
    const merged = [...jsdocParams];

    tsParams.forEach((tsParam, index) => {
        if (merged[index]) {
            // 如果 JSDoc 参数没有类型，使用 TypeScript 类型
            if (!merged[index].type && tsParam.type) {
                merged[index].type = tsParam.type;
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
function mergeProperties(jsdocProps: any[], tsProps: any[]): any[] {
    const propMap = new Map<string, any>();

    // 先添加 JSDoc 属性
    jsdocProps.forEach((prop) => {
        if (prop.name) {
            propMap.set(prop.name, prop);
        }
    });

    // 然后合并 TypeScript 属性
    tsProps.forEach((prop) => {
        if (prop.name) {
            const existing = propMap.get(prop.name);
            if (existing) {
                // 合并现有属性
                if (!existing.type && prop.type) {
                    existing.type = prop.type;
                }
            } else {
                // 添加新属性
                propMap.set(prop.name, prop);
            }
        }
    });

    return Array.from(propMap.values());
}
