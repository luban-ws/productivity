import { describe, expect, it } from "vitest";
import { createReleasePlan } from "../plan";

describe("createReleasePlan", () => {
    it("derives ordered actions without authorizing a release", () => {
        const plan = createReleasePlan(
            {
                checks: { auth: true, git: true },
                build: { enabled: true },
                publish: { enabled: true },
            },
            [
                { name: "@scope/public", version: "1.0.0", path: "packages/public" },
                {
                    name: "@scope/private",
                    version: "1.0.0",
                    path: "packages/private",
                    private: true,
                },
            ],
        );

        expect(plan.requiresConfirmation).toBe(true);
        expect(plan.packages).toEqual([{ name: "@scope/public", version: "1.0.0" }]);
        expect(plan.actions).toEqual(["auth", "git", "verify", "version", "publish"]);
    });
});
