/**
 * 在加载 wsx-press 组件前配置站点 base（与 Vite `base` 一致）。
 */
import { configurePressBase } from "@wsxjs/wsx-press/client";

configurePressBase(import.meta.env.BASE_URL);
