/**
 * Ink render 会话封装
 */

import { render, type RenderOptions } from "ink";
import type { ReactElement } from "react";

/** Ink 会话句柄 */
export interface InkSession {
    dispose: () => void;
}

/** 打开 Ink 会话 */
export function openInkSession(element: ReactElement, options?: RenderOptions): InkSession {
    const instance = render(element, { exitOnCtrlC: false, ...options });
    return {
        dispose: () => {
            instance.unmount();
        },
    };
}

/** 一次性 Ink 屏（由组件在适当时机调用 done） */
export function runInkScreen(
    renderScreen: (ctx: { done: () => void }) => ReactElement,
): Promise<void> {
    return new Promise((resolve) => {
        let instance: ReturnType<typeof render> | undefined;

        const done = (): void => {
            instance?.unmount();
            resolve();
        };

        instance = render(renderScreen({ done }), { exitOnCtrlC: false });
    });
}

/** 自动关闭的一次性 Ink 屏 */
export function runInkScreenTimed(
    renderScreen: (ctx: { done: () => void }) => ReactElement,
    dismissMs: number,
): Promise<void> {
    return new Promise((resolve) => {
        let instance: ReturnType<typeof render> | undefined;

        const done = (): void => {
            instance?.unmount();
            resolve();
        };

        instance = render(renderScreen({ done }), { exitOnCtrlC: false });
        globalThis.setTimeout(done, dismissMs);
    });
}

/** 定时 Ink 屏（无需 done 回调） */
export function runInkTimedScreen(
    renderScreen: () => ReactElement,
    dismissMs: number,
): Promise<void> {
    return runInkScreenTimed(() => renderScreen(), dismissMs);
}
