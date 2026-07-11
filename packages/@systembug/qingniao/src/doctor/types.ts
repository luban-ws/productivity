/**
 * doctor 诊断结果类型
 */

export type DoctorSeverity = "ok" | "warn" | "error";

export interface DoctorFinding {
    id: string;
    severity: DoctorSeverity;
    category: string;
    message: string;
    hint?: string;
    fixable: boolean;
}

export interface DoctorReport {
    findings: DoctorFinding[];
    fixedIds: string[];
}
