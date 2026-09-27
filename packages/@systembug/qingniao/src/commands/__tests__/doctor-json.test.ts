import { describe, expect, it, vi } from "vitest";
import { JsonReporter } from "../../reporters/json-reporter";
import { reportDoctorJson } from "../doctor";

describe("reportDoctorJson", () => {
    it("emits findings followed by one terminal result", () => {
        const write = vi.fn();
        const reporter = new JsonReporter(write);

        reportDoctorJson(
            {
                findings: [
                    {
                        id: "npm-auth",
                        severity: "ok",
                        category: "NPM",
                        message: "Logged in",
                        fixable: false,
                    },
                ],
                fixedIds: [],
            },
            0,
            reporter,
        );

        const events = write.mock.calls.map(([line]) => JSON.parse(line as string));
        expect(events).toHaveLength(2);
        expect(events[0]).toMatchObject({ event: "check", check: "npm-auth", status: "ok" });
        expect(events[1]).toMatchObject({ event: "result", status: "succeeded", exitCode: 0 });
    });
});
