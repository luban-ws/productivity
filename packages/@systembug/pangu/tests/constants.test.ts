/**
 * 品牌常量测试
 */

import { describe, it, expect } from "vitest";
import { DEFAULT_SUPPORTED_BY, PANGU_PRODUCT_NAME } from "../src/constants.js";

describe("constants", () => {
    it("盘古品牌名应固定", () => {
        expect(PANGU_PRODUCT_NAME.zh).toBe("盘古");
        expect(PANGU_PRODUCT_NAME.en).toBe("Pangu");
    });

    it("默认 supported by 应为鲁班工坊", () => {
        expect(DEFAULT_SUPPORTED_BY).toBe("鲁班工坊");
    });
});
