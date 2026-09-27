/**
 * qingniao doctor 命令
 */

import { loadConfig } from "../config/loader";
import { collectDoctorFindings, hasDoctorErrors } from "../doctor/checks";
import { applyDoctorFixes } from "../doctor/fixes";
import type { DoctorReport } from "../doctor/types";
import { presentDoctorReport } from "../ui/run-doctor";
import { JsonReporter } from "../reporters/json-reporter";

export interface DoctorOptions {
    configPath?: string;
    fix?: boolean;
    strict?: boolean;
    json?: boolean;
}

/** 将 doctor 结果写为 Agent 可解析 JSONL。 */
export function reportDoctorJson(
    report: DoctorReport,
    exitCode: number,
    reporter: JsonReporter,
): void {
    for (const finding of report.findings) {
        reporter.check(finding.id, finding.severity, finding.message);
    }
    reporter.result(exitCode === 0 ? "succeeded" : "failed", exitCode, "Doctor completed");
}

/** 运行 doctor 检查，返回退出码 */
export async function runDoctor(rootDir: string, options: DoctorOptions = {}): Promise<number> {
    const config = await loadConfig(options.configPath);
    let findings = await collectDoctorFindings(rootDir, config);
    const fixedIds: string[] = [];

    if (options.fix) {
        fixedIds.push(...applyDoctorFixes(rootDir, findings));
        if (fixedIds.length > 0) {
            findings = await collectDoctorFindings(rootDir, config);
        }
    }

    const report: DoctorReport = { findings, fixedIds };
    const exitCode = hasDoctorErrors(findings, options.strict) ? 1 : 0;
    if (options.json) {
        reportDoctorJson(report, exitCode, new JsonReporter());
    } else {
        await presentDoctorReport(report);
    }
    return exitCode;
}
