import {
    JSON_SCHEMA_VERSION,
    type JsonEvent,
    type JsonCheckEvent,
    type JsonResultStatus,
    type JsonStageStatus,
    type JsonPlanEvent,
} from "./types";

type Output = (line: string) => void;

export class JsonReporter {
    public constructor(private readonly output: Output = (line) => process.stdout.write(line)) {}

    public stage(stage: string, status: JsonStageStatus): void {
        this.write({
            schemaVersion: JSON_SCHEMA_VERSION,
            event: "stage",
            stage,
            status,
            timestamp: new Date().toISOString(),
        });
    }

    public result(status: JsonResultStatus, exitCode: number, summary: string): void {
        this.write({
            schemaVersion: JSON_SCHEMA_VERSION,
            event: "result",
            status,
            exitCode,
            summary,
            timestamp: new Date().toISOString(),
        });
    }

    public error(code: string, message: string): void {
        this.write({
            schemaVersion: JSON_SCHEMA_VERSION,
            event: "error",
            code,
            message,
            timestamp: new Date().toISOString(),
        });
    }

    public check(check: string, status: JsonCheckEvent["status"], message: string): void {
        this.write({
            schemaVersion: JSON_SCHEMA_VERSION,
            event: "check",
            check,
            status,
            message,
            timestamp: new Date().toISOString(),
        });
    }

    public plan(
        packages: JsonPlanEvent["packages"],
        actions: string[],
        requiresConfirmation: boolean,
    ): void {
        this.write({
            schemaVersion: JSON_SCHEMA_VERSION,
            event: "plan",
            packages,
            actions,
            requiresConfirmation,
            timestamp: new Date().toISOString(),
        });
    }

    private write(event: JsonEvent): void {
        this.output(`${JSON.stringify(event)}\n`);
    }
}
