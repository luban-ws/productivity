/**
 * 展示 doctor 报告（Ink / 控制台）
 */

import type { DoctorReport } from "../doctor/types";
import { isInteractiveTerminal } from "./tty";
import { runInkScreen } from "./ink-session";
import { DoctorApp } from "./DoctorApp";
import { printDoctorReport } from "./console-doctor";

/** 渲染 doctor 结果 */
export async function presentDoctorReport(report: DoctorReport): Promise<void> {
    const fixedCount = report.fixedIds.length;
    if (isInteractiveTerminal()) {
        await runInkScreen(({ done }) => (
            <DoctorApp findings={report.findings} fixedCount={fixedCount} onReady={done} />
        ));
        return;
    }
    printDoctorReport(report.findings, fixedCount);
}
