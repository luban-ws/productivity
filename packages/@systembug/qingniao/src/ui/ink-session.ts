/**
 * Ink render 会话封装
 */

import { render, type RenderOptions } from "ink";
import type { ReactElement } from "react";

export interface InkSession {
    dispose: () => void;
}

export function openInkSession(element: ReactElement, options?: RenderOptions): InkSession {
    const instance = render(element, { exitOnCtrlC: false, ...options });
    return {
        dispose: () => {
            instance.unmount();
        },
    };
}

export function runInkScreen(
    renderScreen: (ctx: { done: () => void }) => ReactElement,
): Promise<void> {
    return new Promise((resolve) => {
        const session: { instance?: ReturnType<typeof render> } = {};

        const done = (): void => {
            session.instance?.unmount();
            resolve();
        };

        session.instance = render(renderScreen({ done }), { exitOnCtrlC: false });
    });
}
