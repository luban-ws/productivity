/**
 * Ink 启动 dev server 界面（Spinner → 成功详情 / 错误）
 */

import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { Alert, Spinner } from "@inkjs/ui";
import { t } from "../messages.js";
import { stripLeadingAlertEmoji } from "./alert-text.js";
import type { StartupReadyPayload } from "./startup-types.js";

export type StartupPhase = "loading" | "ready" | "error";

export interface StartupAppProps {
    demoDisplayName: string;
    packageName: string;
    packageManager: string;
    command: string;
    resolveDirectory: () => string;
    readyDismissMs: number;
    errorDismissMs: number;
    onReady: (payload: StartupReadyPayload) => void;
    onError: (message: string) => void;
}

export function StartupApp({
    demoDisplayName,
    packageName,
    packageManager,
    command,
    resolveDirectory,
    readyDismissMs,
    errorDismissMs,
    onReady,
    onError,
}: StartupAppProps): React.JSX.Element {
    const [phase, setPhase] = useState<StartupPhase>("loading");
    const [packageDirectory, setPackageDirectory] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        try {
            const directory = resolveDirectory();
            setPackageDirectory(directory);
            setPhase("ready");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : String(error));
            setPhase("error");
        }
    }, [resolveDirectory]);

    useEffect(() => {
        if (phase !== "ready") {
            return undefined;
        }

        const timer = setTimeout(() => {
            onReady({
                packageDirectory,
                command,
                packageManager,
                packageName,
            });
        }, readyDismissMs);

        return () => {
            clearTimeout(timer);
        };
    }, [phase, packageDirectory, command, packageManager, packageName, readyDismissMs, onReady]);

    useEffect(() => {
        if (phase !== "error") {
            return undefined;
        }

        const timer = setTimeout(() => {
            onError(errorMessage);
        }, errorDismissMs);

        return () => {
            clearTimeout(timer);
        };
    }, [phase, errorMessage, errorDismissMs, onError]);

    if (phase === "loading") {
        return (
            <Box>
                <Spinner label={t("startingServer", { name: demoDisplayName })} />
            </Box>
        );
    }

    if (phase === "error") {
        return (
            <Box flexDirection="column">
                <Alert
                    variant="error"
                    title={stripLeadingAlertEmoji(
                        t("locatePackageFailed", { name: demoDisplayName }),
                    )}
                >
                    {errorMessage}
                </Alert>
            </Box>
        );
    }

    return (
        <Box flexDirection="column">
            <Alert
                variant="success"
                title={stripLeadingAlertEmoji(
                    t("startingServerSuccess", { name: demoDisplayName }),
                )}
            >
                {[
                    `${t("labelPackage")}: ${packageName}`,
                    `${t("labelDirectory")}: ${packageDirectory}`,
                    `${t("labelPackageManager")}: ${packageManager}`,
                    `${t("labelCommand")}: ${command}`,
                ].join("\n")}
            </Alert>
            <Box marginTop={1}>
                <Text dimColor>{command}</Text>
            </Box>
        </Box>
    );
}
