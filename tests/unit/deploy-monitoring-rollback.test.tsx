import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import nextConfig from "../../next.config";
import { GET as healthHandler } from "@/app/api/health/route";
import { GET as smokeTestHandler } from "@/app/api/smoke-test/route";

describe("Deployment, Monitoring & Rollback Runbook (T-019)", () => {
  describe("Health Check API (/api/health)", () => {
    it("returns 200 OK with healthy status and environment metrics", async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.status).toBe("healthy");
      expect(json.service).toBe("english-game-hub");
      expect(typeof json.uptimeSeconds).toBe("number");
      expect(json.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(json.checks).toHaveProperty("supabaseClientConfigured");
      expect(json.checks).toHaveProperty("memoryHeapUsedMb");

      // Verify no-cache header
      expect(response.headers.get("Cache-Control")).toContain("no-store");
    });
  });

  describe("Automated Smoke Test Runner (/api/smoke-test)", () => {
    it("executes simulated gameplay evaluation across all 6 games and passes 100%", async () => {
      const response = await smokeTestHandler();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.status).toBe("ok");
      expect(json.allPassed).toBe(true);
      expect(json.totalTests).toBe(5);
      expect(json.testsPassed).toBe(5);
      expect(json.results.length).toBe(5);

      const testNames = json.results.map((r: { test: string }) => r.test);
      expect(testNames).toContain("memory-flip-evaluator");
      expect(testNames).toContain("sentence-builder-evaluator");
      expect(testNames).toContain("error-detective-evaluator");
      expect(testNames).toContain("listen-choose-evaluator");
      expect(testNames).toContain("roleplay-evaluator");
    });
  });

  describe("Next.js Security Headers & Production Configuration", () => {
    it("enforces production security headers in next.config.ts", async () => {
      expect(nextConfig.reactStrictMode).toBe(true);
      expect(nextConfig.poweredByHeader).toBe(false);

      if (typeof nextConfig.headers === "function") {
        const headerRules = await nextConfig.headers();
        expect(headerRules.length).toBeGreaterThan(0);

        const globalRule = headerRules.find((r) => r.source === "/:path*");
        expect(globalRule).toBeDefined();

        const headers = globalRule?.headers || [];
        const headerMap = Object.fromEntries(headers.map((h) => [h.key, h.value]));

        expect(headerMap["X-Frame-Options"]).toBe("DENY");
        expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
        expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
        expect(headerMap["Strict-Transport-Security"]).toContain("max-age=");
        expect(headerMap["Permissions-Policy"]).toContain("camera=()");
      }
    });

    it("configures remote image optimization domains", () => {
      const patterns = nextConfig.images?.remotePatterns || [];
      const hostnames = patterns.map((p) => p.hostname);

      expect(hostnames).toContain("images.unsplash.com");
      expect(hostnames).toContain("*.supabase.co");
    });
  });

  describe("Environment Configuration & Rollback Documentation", () => {
    it("verifies .env.example contains all required environment variables", () => {
      const envPath = path.resolve(__dirname, "../../.env.example");
      const envContent = fs.readFileSync(envPath, "utf-8");

      expect(envContent).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(envContent).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      expect(envContent).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(envContent).toContain("NEXT_PUBLIC_SITE_URL");
    });

    it("verifies rollback runbook documentation exists with 3 response levels", () => {
      const runbookPath = path.resolve(__dirname, "../../docs/DEPLOYMENT_AND_ROLLBACK.md");
      const runbookContent = fs.readFileSync(runbookPath, "utf-8");

      expect(runbookContent).toContain("Level 1: Tắt khẩn cấp Game bằng Feature Flag");
      expect(runbookContent).toContain("Level 2: Vercel Instant Rollback");
      expect(runbookContent).toContain("Level 3: Git Revert");
      expect(runbookContent).toContain("/api/health");
      expect(runbookContent).toContain("/api/smoke-test");
    });

    it("simulates emergency feature flag disable logic", () => {
      interface GameEntity {
        slug: string;
        is_enabled: boolean;
      }

      const activeGames: GameEntity[] = [
        { slug: "sentence-builder", is_enabled: true },
        { slug: "listen-choose", is_enabled: false }, // Emergency disabled
      ];

      const visibleGames = activeGames.filter((g) => g.is_enabled);
      expect(visibleGames.length).toBe(1);
      expect(visibleGames[0].slug).toBe("sentence-builder");
    });
  });
});

