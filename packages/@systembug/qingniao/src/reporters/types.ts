export const JSON_SCHEMA_VERSION = 1;

export type JsonStageStatus = "started" | "succeeded" | "failed" | "skipped";
export type JsonResultStatus = "succeeded" | "failed";

export interface JsonStageEvent {
    schemaVersion: typeof JSON_SCHEMA_VERSION;
    event: "stage";
    stage: string;
    status: JsonStageStatus;
    timestamp: string;
}

export interface JsonResultEvent {
    schemaVersion: typeof JSON_SCHEMA_VERSION;
    event: "result";
    status: JsonResultStatus;
    exitCode: number;
    summary: string;
    timestamp: string;
}

export interface JsonErrorEvent {
    schemaVersion: typeof JSON_SCHEMA_VERSION;
    event: "error";
    code: string;
    message: string;
    timestamp: string;
}

export interface JsonCheckEvent {
    schemaVersion: typeof JSON_SCHEMA_VERSION;
    event: "check";
    check: string;
    status: "ok" | "warn" | "error";
    message: string;
    timestamp: string;
}

export interface JsonPlanEvent {
    schemaVersion: typeof JSON_SCHEMA_VERSION;
    event: "plan";
    packages: Array<{ name: string; version: string }>;
    actions: string[];
    requiresConfirmation: boolean;
    timestamp: string;
}

export type JsonEvent =
    | JsonStageEvent
    | JsonResultEvent
    | JsonErrorEvent
    | JsonCheckEvent
    | JsonPlanEvent;
