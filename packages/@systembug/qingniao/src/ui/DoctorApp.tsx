/**
 * Ink doctor 报告界面
 */

import React, { useEffect } from "react";
import { Box, Text } from "ink";
import type { DoctorFinding, DoctorSeverity } from "../doctor/types";
import { t } from "../messages.js";

export interface DoctorAppProps {
    findings: DoctorFinding[];
    fixedCount: number;
    onReady: () => void;
}

function severityLabel(severity: DoctorSeverity): string {
    switch (severity) {
        case "ok":
            return "OK";
        case "warn":
            return "WARN";
        case "error":
            return "FAIL";
    }
}

function severityColor(severity: DoctorSeverity): string {
    switch (severity) {
        case "ok":
            return "green";
        case "warn":
            return "yellow";
        case "error":
            return "red";
    }
}

export function DoctorApp({ findings, fixedCount, onReady }: DoctorAppProps): React.JSX.Element {
    useEffect(() => {
        const timer = globalThis.setTimeout(onReady, 1200);
        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [onReady]);

    const errors = findings.filter((f) => f.severity === "error").length;
    const warns = findings.filter((f) => f.severity === "warn").length;

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold>{t("doctorTitle")}</Text>
            {fixedCount > 0 ? (
                <Text color="cyan">{t("doctorFixedCount", { count: fixedCount })}</Text>
            ) : null}
            <Text>
                {t("doctorSummary", {
                    errors,
                    warns,
                    total: findings.length,
                })}
            </Text>
            <Box flexDirection="column" marginTop={1}>
                {findings.map((finding) => (
                    <Box key={finding.id} flexDirection="column" marginBottom={1}>
                        <Text>
                            <Text color={severityColor(finding.severity)}>
                                [{severityLabel(finding.severity)}]
                            </Text>{" "}
                            {finding.category}: {finding.message}
                        </Text>
                        {finding.hint ? <Text dimColor>  → {finding.hint}</Text> : null}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
