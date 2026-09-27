import { describe, expect, it, vi } from "vitest";
import { JsonReporter } from "../json-reporter";

describe("JsonReporter", () => {
    it("writes one parseable JSONL event per call", () => {
        const write = vi.fn();
        const reporter = new JsonReporter(write);

        reporter.stage("verify", "started");
        reporter.result("succeeded", 0, "Release completed");

        expect(write).toHaveBeenCalledTimes(2);
        expect(JSON.parse(write.mock.calls[0][0] as string)).toMatchObject({
            schemaVersion: 1,
            event: "stage",
            stage: "verify",
            status: "started",
        });
        expect(JSON.parse(write.mock.calls[1][0] as string)).toMatchObject({
            schemaVersion: 1,
            event: "result",
            status: "succeeded",
            exitCode: 0,
            summary: "Release completed",
        });
    });

    it("writes machine-readable errors", () => {
        const write = vi.fn();
        const reporter = new JsonReporter(write);

        reporter.error("confirmation_required", "Pass --yes to release");

        expect(JSON.parse(write.mock.calls[0][0] as string)).toMatchObject({
            schemaVersion: 1,
            event: "error",
            code: "confirmation_required",
            message: "Pass --yes to release",
        });
    });

    it("writes doctor findings as check events", () => {
        const write = vi.fn();
        const reporter = new JsonReporter(write);

        reporter.check("npm-auth", "ok", "Logged in");

        expect(JSON.parse(write.mock.calls[0][0] as string)).toMatchObject({
            schemaVersion: 1,
            event: "check",
            check: "npm-auth",
            status: "ok",
            message: "Logged in",
        });
    });

    it("writes read-only release plans", () => {
        const write = vi.fn();
        const reporter = new JsonReporter(write);

        reporter.plan([{ name: "@scope/pkg", version: "1.0.0" }], ["verify", "publish"], true);

        expect(JSON.parse(write.mock.calls[0][0] as string)).toMatchObject({
            schemaVersion: 1,
            event: "plan",
            packages: [{ name: "@scope/pkg", version: "1.0.0" }],
            actions: ["verify", "publish"],
            requiresConfirmation: true,
        });
    });
});
