/**
 * qingniao doctor 命令
 */

import { loadConfig } from "../config/loader";
import { collectDoctorFindings, hasDoctorErrors } from "../doctor/checks";
import { applyDoctorFixes } from "../doctor/fixes";
import type { DoctorReport } from "../doctor/types";
import { presentDoctorReport } from "../ui/run-doctor";

export interface DoctorOptions {
    configPath?: string;
    fix?: boolean;
    strict?: boolean;
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
    await presentDoctorReport(report);

    if (hasDoctorErrors(findings, options.strict)) {
        return 1;
    }
    return 0;
}
