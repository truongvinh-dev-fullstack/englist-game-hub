import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cn } from "@/lib/utils";
import { XPBadge } from "@/components/ui/XPBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Header, NAV_LINKS } from "@/components/layout/Header";
import { BottomNav, BOTTOM_NAV_ITEMS } from "@/components/layout/BottomNav";
import { AppShell } from "@/components/layout/AppShell";

describe("UI Shell — Utility & Components", () => {
  describe("cn utility", () => {
    it("merges classes cleanly without duplicates", () => {
      const result = cn("px-2 py-1", "px-4", "text-sm");
      expect(result).toBe("py-1 px-4 text-sm");
    });

    it("handles conditional class values", () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn("base-class", isActive && "active-class", isDisabled && "disabled-class");
      expect(result).toBe("base-class active-class");
    });
  });

  describe("XPBadge component", () => {
    it("renders formatted XP with accessible aria-label", () => {
      const html = renderToStaticMarkup(<XPBadge xp={1250} />);
      expect(html).toContain("1.250 XP");
      expect(html).toContain('aria-label="1250 kinh nghiệm (XP)"');
    });

    it("supports different sizes", () => {
      const htmlSm = renderToStaticMarkup(<XPBadge xp={50} size="sm" />);
      const htmlLg = renderToStaticMarkup(<XPBadge xp={50} size="lg" />);
      expect(htmlSm).toContain("text-xs");
      expect(htmlLg).toContain("text-base");
    });
  });

  describe("ProgressBar component", () => {
    it("renders progressbar role with correct aria values", () => {
      const html = renderToStaticMarkup(<ProgressBar value={3} max={10} label="Bài tập" showText={true} />);
      expect(html).toContain('role="progressbar"');
      expect(html).toContain('aria-valuenow="3"');
      expect(html).toContain('aria-valuemax="10"');
      expect(html).toContain("30%");
      expect(html).toContain("Bài tập");
    });

    it("clamps values gracefully between 0 and 100%", () => {
      const htmlOverflow = renderToStaticMarkup(<ProgressBar value={150} max={100} showText={true} />);
      expect(htmlOverflow).toContain("100%");
    });
  });

  describe("Navigation structure (Sitemap conformity)", () => {
    it("contains all required desktop navigation links", () => {
      const links = NAV_LINKS.map((l) => l.href);
      expect(links).toContain("/");
      expect(links).toContain("/games");
      expect(links).toContain("/review");
      expect(links).toContain("/progress");
      expect(links).not.toContain("/topics");
    });

    it("contains all 5 mobile bottom navigation items", () => {
      const items = BOTTOM_NAV_ITEMS.map((i) => i.href);
      expect(items).toEqual(["/", "/games", "/review", "/progress", "/profile"]);
      expect(items).not.toContain("/topics");
    });
  });

  describe("Header and BottomNav rendering", () => {
    it("renders Header with branding and navigation", () => {
      const html = renderToStaticMarkup(<Header userXP={500} userName="Vinh" isGuest={false} />);
      expect(html).toContain("English Game Hub");
      expect(html).toContain("500 XP");
      expect(html).toContain("Vinh");
    });

    it("renders BottomNav with all 5 items", () => {
      const html = renderToStaticMarkup(<BottomNav isGuest={true} />);
      expect(html).toContain('aria-label="Thanh điều hướng dưới màn hình"');
      expect(html).toContain("Trang chủ");
      expect(html).toContain("Kho game");
    });
  });

  describe("AppShell component", () => {
    it("renders Header, main content, and BottomNav by default", () => {
      const html = renderToStaticMarkup(
        <AppShell isGuest={true} userXP={100}>
          <div data-testid="test-content">Nội dung trang</div>
        </AppShell>
      );

      expect(html).toContain("<header");
      expect(html).toContain("<main");
      expect(html).toContain("<nav");
      expect(html).toContain("Nội dung trang");
    });

    it("can hide navigation when in play mode", () => {
      const html = renderToStaticMarkup(
        <AppShell hideHeader={true} hideBottomNav={true}>
          <div>Chế độ chơi tập trung</div>
        </AppShell>
      );

      expect(html).not.toContain("<header");
      expect(html).not.toContain('aria-label="Thanh điều hướng chính"');
      expect(html).not.toContain('aria-label="Thanh điều hướng dưới màn hình"');
      expect(html).toContain("Chế độ chơi tập trung");
    });
  });
});
