import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ALL_GAMES } from "@/lib/data/games-data";
import { WORKPLACE_TOPICS } from "@/lib/data/topics-data";
import GameLibraryPage from "@/app/games/page";
import TopicsPage from "@/app/topics/page";

describe("Game Library & Topics (T-014)", () => {
  describe("Games Dataset & Metadata", () => {
    it("contains all 5 MVP games with complete metadata", () => {
      expect(ALL_GAMES.length).toBe(5);

      const expectedSlugs = [
        "memory-flip",
        "sentence-builder",
        "error-detective",
        "listen-choose",
        "roleplay",
      ];

      expectedSlugs.forEach((slug) => {
        const game = ALL_GAMES.find((g) => g.slug === slug);
        expect(game).toBeDefined();
        expect(game?.title.length).toBeGreaterThan(0);
        expect(game?.description.length).toBeGreaterThan(10);
        expect(game?.duration).toContain("phút");
      });
    });
  });

  describe("Game Filtering Logic", () => {
    it("filters games accurately by skill category", () => {
      const vocabGames = ALL_GAMES.filter((g) => g.skill === "Từ vựng");
      expect(vocabGames.length).toBe(1); // Memory Flip

      const grammarGames = ALL_GAMES.filter((g) => g.skill === "Ngữ pháp");
      expect(grammarGames.length).toBe(2); // Sentence Builder & Error Detective

      const listeningGames = ALL_GAMES.filter((g) => g.skill === "Luyện nghe");
      expect(listeningGames.length).toBe(1); // Listen & Choose

      const speakingGames = ALL_GAMES.filter((g) => g.skill === "Giao tiếp");
      expect(speakingGames.length).toBe(1); // Roleplay Simulator
    });

    it("filters games accurately by difficulty level", () => {
      const a1Games = ALL_GAMES.filter((g) => g.difficulty === "A1");
      expect(a1Games.length).toBe(2); // Memory Flip & Sentence Builder

      const a2Games = ALL_GAMES.filter((g) => g.difficulty === "A2");
      expect(a2Games.length).toBe(2); // Error Detective & Listen & Choose

      const b1Games = ALL_GAMES.filter((g) => g.difficulty === "B1");
      expect(b1Games.length).toBe(1); // Roleplay Simulator
    });

    it("searches games case-insensitively by title and description", () => {
      const query = "memory";
      const matches = ALL_GAMES.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query)
      );
      expect(matches.length).toBe(1);
      expect(matches[0].slug).toBe("memory-flip");

      const emptyQuery = "non-existent-game-title";
      const emptyMatches = ALL_GAMES.filter(
        (g) =>
          g.title.toLowerCase().includes(emptyQuery) ||
          g.description.toLowerCase().includes(emptyQuery)
      );
      expect(emptyMatches.length).toBe(0);
    });
  });

  describe("Workplace Topics Dataset", () => {
    it("contains 4 curated workplace topics covering levels A0 to B1", () => {
      expect(WORKPLACE_TOPICS.length).toBe(4);

      WORKPLACE_TOPICS.forEach((t) => {
        expect(t.nameVi.length).toBeGreaterThan(5);
        expect(t.nameEn.length).toBeGreaterThan(5);
        expect(t.description.length).toBeGreaterThan(15);
        expect(t.questionCount).toBeGreaterThan(0);
        expect(t.availableGames.length).toBeGreaterThanOrEqual(3);

        // Verify available games slugs exist in ALL_GAMES
        t.availableGames.forEach((g) => {
          const gameExists = ALL_GAMES.some((allG) => allG.slug === g.slug);
          expect(gameExists).toBe(true);
        });
      });
    });
  });

  describe("Game Library Page UI", () => {
    it("renders page title, search bar, and all 5 game cards initially", () => {
      const html = renderToStaticMarkup(<GameLibraryPage />);

      expect(html).toContain("Thư viện trò chơi tiếng Anh");
      expect(html).toContain("Tìm trò chơi theo tên hoặc kỹ năng");
      expect(html).toContain("Hiển thị 5 trò chơi");
      expect(html).toContain("Memory Flip");
      expect(html).toContain("Sentence Builder");
      expect(html).toContain("Error Detective");
      expect(html).toContain("Listen &amp; Choose");
      expect(html).toContain("Roleplay Simulator");
    });
  });

  describe("Topics Page UI", () => {
    it("renders topic listing with level filters and topic cards", () => {
      const html = renderToStaticMarkup(<TopicsPage />);

      expect(html).toContain("Chủ đề tiếng Anh công sở");
      expect(html).toContain("Thiết bị &amp; Văn phòng cơ bản");
      expect(html).toContain("Họp hành &amp; Quản lý lịch trình");
      expect(html).toContain("Viết Email &amp; Báo cáo tiến độ");
      expect(html).toContain("Giao tiếp đối tác &amp; Xử lý tình huống");
      expect(html).toContain("Luyện theo chủ đề");
    });
  });
});

