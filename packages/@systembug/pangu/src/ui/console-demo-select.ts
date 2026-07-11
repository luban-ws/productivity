/**
 * 非 TTY 环境下用 readline 选择 demo
 */

import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import type { DemoOption } from "../types.js";
import { t } from "../messages.js";
import { formatDemoLabel } from "./build-select-options.js";
import { DemoSelectCancelledError } from "./demo-select-errors.js";

/** readline 选择 demo */
export async function selectDemoFromConsole(demos: DemoOption[]): Promise<string> {
    console.log(t("welcome").trim());
    console.log(t("selectDemo"));

    demos.forEach((demo, index) => {
        console.log(`  ${index + 1}. ${formatDemoLabel(demo)} (${demo.value})`);
    });

    const rl = createInterface({ input, output });

    try {
        const answer = (await rl.question("> ")).trim();
        if (!answer) {
            throw new DemoSelectCancelledError();
        }

        const byIndex = Number.parseInt(answer, 10);
        if (!Number.isNaN(byIndex) && byIndex >= 1 && byIndex <= demos.length) {
            return demos[byIndex - 1].value;
        }

        const byValue = demos.find((demo) => demo.value.toLowerCase() === answer.toLowerCase());
        if (byValue) {
            return byValue.value;
        }

        throw new Error(t("demoNotFound", { demo: answer }));
    } finally {
        rl.close();
    }
}
