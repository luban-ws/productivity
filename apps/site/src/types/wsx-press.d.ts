/**
 * @wsxjs/wsx-press 0.2.0 暂未发布 .d.ts，站点侧补齐最小类型。
 */
declare module "@wsxjs/wsx-press/client" {
    export function configurePressBase(base: string): void;
    export function getPressBase(): string;
    export function resetPressBase(): void;
    export function pressAsset(path: string): string;
    export function pressSitePath(path: string): string;
    export function stripPressBase(path: string): string;
    export function getDocsRelativePath(path: string): string | null;
}
