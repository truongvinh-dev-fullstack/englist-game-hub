import { describe, it, expect } from "vitest";

describe("Smoke Test — Environment & Test Suite", () => {
  it("executes basic assertions successfully", () => {
    expect(1 + 1).toBe(2);
  });

  it("verifies environment variables configuration", () => {
    const defaultSiteUrl = "http://localhost:3000";
    expect(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).toBe(defaultSiteUrl);
  });
});

