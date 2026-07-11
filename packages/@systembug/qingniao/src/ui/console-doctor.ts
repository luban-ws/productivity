/**
 * 非 TTY doctor 文本输出
 */

import type { DoctorFinding } from "../doctor/types";
import { t } from "../messages.js";

function icon(severity: DoctorFinding["severity"]): string {
    switch (severity) {
        case "ok":
            return "✓";
        case "warn":
            return "!";
        case "error":
            return "✗";
    }
}

/** 打印 doctor 报告 */
export function printDoctorReport(findings: DoctorFinding[], fixedCount: number): void {
    console.log(`\n${t("doctorConsoleTitle")}\n`);
    if (fixedCount > 0) {
        console.log(`${t("doctorConsoleFixed", { count: fixedCount })}\n`);
    }
    for (const finding of findings) {
        const line = `${icon(finding.severity)} [${finding.category}] ${finding.message}`;
        console.log(line);
        if (finding.hint) {
            console.log(`  → ${finding.hint}`);
        }
    }
    console.log("");
}
