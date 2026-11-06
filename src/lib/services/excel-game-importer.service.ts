import * as XLSX from "xlsx";
import {
  validateQuestion,
  type AnyQuestion,
  type ValidationResult,
} from "@/lib/validations/content";

export type SupportedGameType =
  | "sentence-builder"
  | "memory-flip"
  | "error-detective"
  | "listen-choose"
  | "roleplay";

export interface ExcelImportRowError {
  row: number;
  error: string;
  rawData?: Record<string, unknown>;
}

export interface ExcelImportResult {
  gameType: SupportedGameType;
  totalRows: number;
  validCount: number;
  errorCount: number;
  validQuestions: AnyQuestion[];
  errors: ExcelImportRowError[];
}

const DEFAULT_TOPIC_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Removes Vietnamese accents / diacritics to convert to plain ASCII
 */
function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

function cleanKeyString(str: string): string {
  return removeVietnameseAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Normalizes an object's keys to lowercase unaccented alphanumeric for flexible column matching
 */
function normalizeRowKeys(row: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, val] of Object.entries(row)) {
    const cleanKey = cleanKeyString(key);
    normalized[cleanKey] = String(val ?? "").trim();
  }
  return normalized;
}

function findValue(row: Record<string, string>, ...targets: string[]): string {
  const rowEntries = Object.entries(row);
  for (const target of targets) {
    const cleanTarget = cleanKeyString(target);
    // 1. Exact match
    for (const [k, v] of rowEntries) {
      if (k === cleanTarget && v !== "") {
        return v;
      }
    }
    // 2. Contains match
    for (const [k, v] of rowEntries) {
      if (k.includes(cleanTarget) && v !== "") {
        return v;
      }
    }
  }
  return "";
}

function parseDifficulty(val: string): "A0" | "A1" | "A2" | "B1" {
  const upper = val.toUpperCase().trim();
  if (upper === "A0" || upper === "A1" || upper === "A2" || upper === "B1") {
    return upper;
  }
  return "A1";
}

function parseConceptTags(val: string, fallback: string): string[] {
  if (!val) return [fallback];
  const tags = val
    .split(/[;,]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  return tags.length > 0 ? tags : [fallback];
}

/**
 * Transforms an Excel row into a Sentence Builder Question
 */
function transformSentenceBuilder(
  norm: Record<string, string>
): Record<string, unknown> {
  const topicId = findValue(norm, "topic_id", "machude") || DEFAULT_TOPIC_ID;
  const difficulty = parseDifficulty(findValue(norm, "difficulty", "dokho"));
  const promptVi = findValue(
    norm,
    "prompt_vi",
    "cautiengvietgoiy",
    "cautiengviet",
    "nghiatiengvietvi",
    "nghiatiengviet",
    "tiengviet",
    "vietnamese",
    "vi"
  );
  const englishSentence = findValue(
    norm,
    "english_sentence",
    "cautienganhchuan",
    "cautienganh",
    "tutienganhen",
    "tutienganh",
    "english",
    "tienganh",
    "sentence",
    "en"
  );
  const explanationVi = findValue(norm, "explanation_vi", "giaithich", "giaithichtiengviet") ||
    `Cấu trúc ngữ pháp chuẩn công sở: ${englishSentence}`;
  const conceptTags = parseConceptTags(findValue(norm, "concept_tags", "tukhoa", "chude"), "grammar");
  const prompt = findValue(norm, "prompt", "yeucau") ||
    "Sắp xếp các từ thành câu hoàn chỉnh đúng ngữ pháp.";

  // Split english sentence into word tokens
  const words = englishSentence.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    throw new Error(
      `Dòng này chỉ có 1 từ ("${englishSentence}"). Trò Xếp câu (Sentence Builder) cần câu hoàn chỉnh tối thiểu 2 từ để xáo trộn. Nếu đây là từ vựng đơn lẻ, vui lòng chọn Tab Memory Flip để nạp.`
    );
  }

  const tokens = words.map((w, idx) => ({
    id: `t${idx + 1}`,
    text: w,
  }));
  const canonicalSequence = tokens.map((t) => t.id);

  // Shuffle tokens for public payload so available word pool is scrambled
  const shuffledTokens = [...tokens];
  if (shuffledTokens.length > 1) {
    for (let k = shuffledTokens.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [shuffledTokens[k], shuffledTokens[r]] = [shuffledTokens[r], shuffledTokens[k]];
    }
    // If by chance the order matches canonical sequence, swap first two
    if (shuffledTokens.every((t, i) => t.id === tokens[i].id)) {
      [shuffledTokens[0], shuffledTokens[1]] = [shuffledTokens[1], shuffledTokens[0]];
    }
  }

  return {
    game_type: "sentence-builder",
    topic_id: topicId,
    difficulty,
    skill: "grammar",
    prompt,
    explanation_vi: explanationVi,
    concept_tags: conceptTags,
    status: "published",
    version: 1,
    public_payload: {
      promptVi: promptVi || "Sắp xếp lại câu sau cho đúng ngữ pháp:",
      tokens: shuffledTokens,
    },
    private_solution: {
      canonicalSequence,
      canonicalSentence: englishSentence,
    },
  };
}

/**
 * Transforms an Excel row into a Memory Flip Question
 */
function transformMemoryFlip(
  norm: Record<string, string>
): Record<string, unknown> {
  const topicId = findValue(norm, "topic_id", "machude") || DEFAULT_TOPIC_ID;
  const difficulty = parseDifficulty(findValue(norm, "difficulty", "dokho"));
  const prompt = findValue(norm, "prompt", "yeucau") || "Lật các thẻ bài để ghép các cặp từ vựng công sở tương ứng.";
  const explanationVi = findValue(norm, "explanation_vi", "giaithich") || "Ghi nhớ các cặp từ vựng công sở thiết yếu.";
  const conceptTags = parseConceptTags(findValue(norm, "concept_tags", "tukhoa"), "vocabulary");

  const pairs: Array<{ pairId: string; en: string; vi: string }> = [];
  const cards: Array<{ id: string; pairId: string; content: string; type: "en" | "vi" }> = [];

  for (let i = 1; i <= 8; i++) {
    const en = findValue(norm, `cap${i}en`, `pair${i}en`, `en${i}`);
    const vi = findValue(norm, `cap${i}vi`, `pair${i}vi`, `vi${i}`);
    if (en && vi) {
      const pairId = `p${i}`;
      pairs.push({ pairId, en, vi });
    }
  }

  // Build card pairs
  pairs.forEach((p, idx) => {
    cards.push({ id: `c${idx * 2 + 1}`, pairId: p.pairId, content: p.en, type: "en" });
    cards.push({ id: `c${idx * 2 + 2}`, pairId: p.pairId, content: p.vi, type: "vi" });
  });

  // Shuffle cards so pairs are not stored sequentially side-by-side
  for (let k = cards.length - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [cards[k], cards[r]] = [cards[r], cards[k]];
  }

  return {
    game_type: "memory-flip",
    topic_id: topicId,
    difficulty,
    skill: "vocabulary",
    prompt,
    explanation_vi: explanationVi,
    concept_tags: conceptTags,
    status: "published",
    version: 1,
    public_payload: {
      pairsCount: pairs.length,
      cards,
    },
    private_solution: {
      pairs,
    },
  };
}

/**
 * Checks whether the uploaded Memory Flip rows are in the vertical format
 * (each row is 1 vocabulary pair: English word and Vietnamese meaning)
 */
function isVerticalMemoryFlip(rawRows: Array<Record<string, unknown>>): boolean {
  if (rawRows.length === 0) return false;
  const firstNorm = normalizeRowKeys(rawRows[0]);
  const hasCap1 = findValue(firstNorm, "cap1en", "pair1en") !== "";
  if (hasCap1) return false;

  const hasEn =
    findValue(
      firstNorm,
      "tutienganhen",
      "english",
      "tutienganh",
      "en",
      "word",
      "lemma",
      "vocab"
    ) !== "";
  const hasVi =
    findValue(
      firstNorm,
      "nghiatiengvietvi",
      "vietnamese",
      "nghiatiengviet",
      "vi",
      "meaning"
    ) !== "";

  return hasEn || hasVi;
}

/**
 * Parses vertical vocabulary list rows into grouped Memory Flip boards
 * (automatically chunks 4 pairs per game board)
 */
function parseVerticalMemoryFlip(
  rawRows: Array<Record<string, unknown>>,
  validQuestions: AnyQuestion[],
  errors: ExcelImportRowError[]
) {
  interface ExtractedPair {
    rowNumber: number;
    en: string;
    vi: string;
    difficulty: "A0" | "A1" | "A2" | "B1";
    conceptTags: string[];
    topicId: string;
  }

  const extractedPairs: ExtractedPair[] = [];

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const norm = normalizeRowKeys(rawRow);
    const en = findValue(
      norm,
      "tutienganhen",
      "english",
      "tutienganh",
      "en",
      "word",
      "lemma",
      "vocab"
    );
    const vi = findValue(
      norm,
      "nghiatiengvietvi",
      "vietnamese",
      "nghiatiengviet",
      "vi",
      "meaning"
    );
    const difficulty = parseDifficulty(findValue(norm, "difficulty", "dokho"));
    const conceptTags = parseConceptTags(
      findValue(norm, "concept_tags", "tukhoa", "chude"),
      "vocabulary"
    );
    const topicId = findValue(norm, "topic_id", "machude") || DEFAULT_TOPIC_ID;

    if (!en || !vi) {
      errors.push({
        row: rowNumber,
        error: `Dòng ${rowNumber} thiếu từ tiếng Anh hoặc nghĩa tiếng Việt.`,
        rawData: rawRow,
      });
      return;
    }

    extractedPairs.push({
      rowNumber,
      en,
      vi,
      difficulty,
      conceptTags,
      topicId,
    });
  });

  const CHUNK_SIZE = 4;
  for (let i = 0; i < extractedPairs.length; i += CHUNK_SIZE) {
    const chunk = extractedPairs.slice(i, i + CHUNK_SIZE);
    if (chunk.length < 4) {
      errors.push({
        row: chunk[0].rowNumber,
        error: `Còn lại ${chunk.length} cặp từ (từ dòng ${chunk[0].rowNumber} đến ${chunk[chunk.length - 1].rowNumber}) không đủ 4 cặp để tạo thành một ván chơi (cần tối thiểu 4 cặp từ).`,
      });
      continue;
    }

    const boardIndex = Math.floor(i / CHUNK_SIZE) + 1;
    const pairs = chunk.map((c, idx) => ({
      pairId: `b${boardIndex}-p${idx + 1}`,
      en: c.en,
      vi: c.vi,
    }));

    const cards: Array<{
      id: string;
      pairId: string;
      content: string;
      type: "en" | "vi";
    }> = [];
    pairs.forEach((p, idx) => {
      cards.push({
        id: `b${boardIndex}-c${idx * 2 + 1}`,
        pairId: p.pairId,
        content: p.en,
        type: "en",
      });
      cards.push({
        id: `b${boardIndex}-c${idx * 2 + 2}`,
        pairId: p.pairId,
        content: p.vi,
        type: "vi",
      });
    });

    // Shuffle cards so pairs are not stored sequentially side-by-side
    for (let k = cards.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [cards[k], cards[r]] = [cards[r], cards[k]];
    }

    const allTags = Array.from(new Set(chunk.flatMap((c) => c.conceptTags)));
    const explanationVi =
      "Các cặp từ vựng: " +
      pairs.map((p) => `${p.en} (${p.vi})`).join(", ");

    const candidate = {
      game_type: "memory-flip",
      topic_id: chunk[0].topicId,
      difficulty: chunk[0].difficulty,
      skill: "vocabulary",
      prompt: `Lật các thẻ bài để ghép ${pairs.length} cặp từ vựng công sở thông dụng.`,
      explanation_vi: explanationVi,
      concept_tags: allTags.length > 0 ? allTags : ["vocabulary", "office"],
      status: "published",
      version: 1,
      public_payload: {
        pairsCount: pairs.length,
        cards,
      },
      private_solution: {
        pairs,
      },
    };

    const validation: ValidationResult<AnyQuestion> = validateQuestion(candidate);
    if (validation.success) {
      validQuestions.push(validation.data);
    } else {
      errors.push({
        row: chunk[0].rowNumber,
        error: validation.errors.join("; "),
      });
    }
  }
}

/**
 * Transforms an Excel row into an Error Detective Question
 */
function transformErrorDetective(
  norm: Record<string, string>
): Record<string, unknown> {
  const topicId = findValue(norm, "topic_id", "machude") || DEFAULT_TOPIC_ID;
  const difficulty = parseDifficulty(findValue(norm, "difficulty", "dokho"));
  const sentence = findValue(norm, "cauhoanchinhcoloi", "caucualoi", "sentence", "cautienganhcoloi");
  const errorPart = findValue(norm, "cumtubisai", "errorpart", "errorphrase");
  const correctRepair = findValue(norm, "cachsuadung", "correctrepair", "correctoption");
  const distractor1 = findValue(norm, "phuongangaynheu1", "distractor1", "option2");
  const distractor2 = findValue(norm, "phuongangaynheu2", "distractor2", "option3");
  const grammarConcept = findValue(norm, "diemnguphap", "grammarconcept") || "Ngữ pháp công sở";
  const explanationVi = findValue(norm, "explanation_vi", "giaithich") || `Lỗi ngữ pháp về: ${grammarConcept}`;
  const conceptTags = parseConceptTags(findValue(norm, "concept_tags", "tukhoa"), "grammar");
  const prompt = findValue(norm, "prompt", "yeucau") || "Tìm lỗi sai trong câu và chọn cách sửa đúng nhất.";

  // Build segments: split sentence around errorPart
  const segments: Array<{ id: string; text: string }> = [];
  const errorIdx = sentence.indexOf(errorPart);

  if (errorIdx > 0) {
    segments.push({ id: "s1", text: sentence.substring(0, errorIdx).trim() });
    segments.push({ id: "s2", text: errorPart });
    const remainder = sentence.substring(errorIdx + errorPart.length).trim();
    if (remainder) {
      segments.push({ id: "s3", text: remainder });
    }
  } else if (errorIdx === 0) {
    segments.push({ id: "s1", text: errorPart });
    const remainder = sentence.substring(errorPart.length).trim();
    if (remainder) {
      segments.push({ id: "s2", text: remainder });
    }
  } else {
    // Fallback if exact substring not found
    segments.push({ id: "s1", text: sentence });
    segments.push({ id: "s2", text: errorPart || "error" });
  }

  const errorSegmentId = segments.find((s) => s.text === errorPart)?.id || segments[0].id;

  const correctionOptions = [
    { id: "opt1", text: correctRepair },
    { id: "opt2", text: distractor1 || "is not" },
  ];
  if (distractor2) {
    correctionOptions.push({ id: "opt3", text: distractor2 });
  }

  const correctedSentence = sentence.replace(errorPart, correctRepair);

  return {
    game_type: "error-detective",
    topic_id: topicId,
    difficulty,
    skill: "grammar",
    prompt,
    explanation_vi: explanationVi,
    concept_tags: conceptTags,
    status: "published",
    version: 1,
    public_payload: {
      sentence,
      segments,
      correctionOptions,
    },
    private_solution: {
      errorSegmentId,
      correctOptionId: "opt1",
      grammarConcept,
      correctedSentence,
    },
  };
}

/**
 * Transforms an Excel row into a Listen & Choose Question
 */
function transformListenChoose(
  norm: Record<string, string>
): Record<string, unknown> {
  const topicId = findValue(norm, "topic_id", "machude") || DEFAULT_TOPIC_ID;
  const difficulty = parseDifficulty(findValue(norm, "difficulty", "dokho"));
  const rawAudio = findValue(norm, "linkaudio", "audiopath", "audio", "fileaudio", "duongdan");
  const audioPath = rawAudio || "tts";
  const transcriptEn = findValue(
    norm,
    "cauthoaitienganh",
    "cauthoaitienganhdocbangmay",
    "cauthoaidoc",
    "cauthoai",
    "thoai",
    "cauthoidoc",
    "cauthoitienganh",
    "cautienganh",
    "cautienganhcandoc",
    "noidungnghe",
    "noidungcandoc",
    "transcripttienganh",
    "transcript",
    "transcripten",
    "cauhoi",
    "english",
    "en",
    "sentence",
    "text",
    "content",
    "doanthoai"
  );
  const speechText = transcriptEn;
  const opt1 = findValue(norm, "luachon1", "phuongan1", "option1", "luachona", "phuongana", "dapan1", "caua");
  const opt2 = findValue(norm, "luachon2", "phuongan2", "option2", "luachonb", "phuonganb", "dapan2", "caub");
  const opt3 = findValue(norm, "luachon3", "phuongan3", "option3", "luachonc", "phuonganc", "dapan3", "cauc");
  const opt4 = findValue(norm, "luachon4", "phuongan4", "option4", "luachond", "phuongand", "dapan4", "caud");
  const rawCorrect = findValue(norm, "dapandung", "dapan", "correctoption", "correct", "ketqua", "correctindex");
  const explanationVi = findValue(norm, "explanation_vi", "giaithich") || (transcriptEn ? `Transcript: "${transcriptEn}"` : "Nghe kỹ âm thanh để chọn đáp án.");
  const conceptTags = parseConceptTags(findValue(norm, "concept_tags", "tukhoa"), "listening");
  const prompt = findValue(norm, "prompt", "yeucau") || "Lắng nghe phát âm và chọn thông tin chính xác nhất.";

  const options = [
    { id: "opt1", text: opt1 },
    { id: "opt2", text: opt2 },
  ];
  if (opt3) options.push({ id: "opt3", text: opt3 });
  if (opt4) options.push({ id: "opt4", text: opt4 });

  let correctOptionId = "opt1";
  if (rawCorrect) {
    const trimmed = rawCorrect.trim();
    const upper = trimmed.toUpperCase();
    if (upper === "A" || upper === "1") {
      correctOptionId = "opt1";
    } else if (upper === "B" || upper === "2") {
      correctOptionId = "opt2";
    } else if (upper === "C" || upper === "3") {
      correctOptionId = "opt3";
    } else if (upper === "D" || upper === "4") {
      correctOptionId = "opt4";
    } else {
      // Check if user entered exact option text
      const matchedIdx = options.findIndex(
        (o) => o.text.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (matchedIdx !== -1) {
        correctOptionId = options[matchedIdx].id;
      } else {
        const num = rawCorrect.replace(/\D/g, "");
        if (num && parseInt(num, 10) >= 1 && parseInt(num, 10) <= options.length) {
          correctOptionId = `opt${num}`;
        }
      }
    }
  }

  return {
    game_type: "listen-choose",
    topic_id: topicId,
    difficulty,
    skill: "listening",
    prompt,
    explanation_vi: explanationVi,
    concept_tags: conceptTags,
    status: "published",
    version: 1,
    public_payload: {
      audioPath,
      speechText,
      options,
    },
    private_solution: {
      correctOptionId,
      transcriptEn,
    },
  };
}

/**
 * Transforms an Excel row into a Roleplay Question
 */
function transformRoleplay(
  norm: Record<string, string>
): Record<string, unknown> {
  const topicId = findValue(norm, "topic_id", "machude") || DEFAULT_TOPIC_ID;
  const difficulty = parseDifficulty(findValue(norm, "difficulty", "dokho"));
  const situation = findValue(norm, "boicanh", "situation", "tinhhuong");
  const npcRole = findValue(norm, "vainpc", "npcrole", "nguoidoithoai");
  const npcText = findValue(norm, "loithoainpc", "loaithoainpc", "npctext", "cauthoainpc");
  const prompt = findValue(norm, "prompt", "yeucau") || "Chọn phản hồi chuyên nghiệp nhất trong tình huống sau.";
  const explanationVi = findValue(norm, "explanation_vi", "giaithich") || "Giao tiếp công sở đòi hỏi sự khéo léo và giải pháp tích cực.";
  const conceptTags = parseConceptTags(findValue(norm, "concept_tags", "tukhoa"), "speaking");

  const choice1 = findValue(norm, "luachon1", "choice1");
  const rating1Raw = findValue(norm, "danhgia1", "rating1").toLowerCase();
  const feedback1 = findValue(norm, "giaithich1", "feedback1") || "Phản hồi mẫu 1.";

  const choice2 = findValue(norm, "luachon2", "choice2");
  const rating2Raw = findValue(norm, "danhgia2", "rating2").toLowerCase();
  const feedback2 = findValue(norm, "giaithich2", "feedback2") || "Phản hồi mẫu 2.";

  const parseRating = (r: string): "appropriate" | "acceptable" | "inappropriate" => {
    if (r.includes("phù hợp") || r.includes("appropriate") || r === "1") return "appropriate";
    if (r.includes("chấp nhận") || r.includes("acceptable") || r === "2") return "acceptable";
    return "inappropriate";
  };

  const choices = [
    { id: "c1", text: choice1 },
    { id: "c2", text: choice2 },
  ];

  const evaluations = [
    {
      choiceId: "c1",
      rating: parseRating(rating1Raw),
      scoreDelta: parseRating(rating1Raw) === "appropriate" ? 10 : parseRating(rating1Raw) === "acceptable" ? 5 : 0,
      feedbackVi: feedback1,
    },
    {
      choiceId: "c2",
      rating: parseRating(rating2Raw),
      scoreDelta: parseRating(rating2Raw) === "appropriate" ? 10 : parseRating(rating2Raw) === "acceptable" ? 5 : 0,
      feedbackVi: feedback2,
    },
  ];

  return {
    game_type: "roleplay",
    topic_id: topicId,
    difficulty,
    skill: "speaking",
    prompt,
    explanation_vi: explanationVi,
    concept_tags: conceptTags,
    status: "published",
    version: 1,
    public_payload: {
      situation,
      npcRole,
      npcText,
      choices,
      isTerminal: false,
    },
    private_solution: {
      evaluations,
    },
  };
}

/**
 * Main parser: takes an ArrayBuffer of an Excel or CSV file and a specific game type,
 * transforms each row and validates it through the Zod schema.
 */
export function parseGameExcelOrCsv(
  buffer: ArrayBuffer | Uint8Array,
  gameType: SupportedGameType
): ExcelImportResult {
  const wb = XLSX.read(buffer, { type: "array", codepage: 65001 });
  const firstSheetName = wb.SheetNames[0];

  if (!firstSheetName || !wb.Sheets[firstSheetName]) {
    return {
      gameType,
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      validQuestions: [],
      errors: [{ row: 1, error: "File Excel không có trang tính (sheet) nào." }],
    };
  }

  const sheet = wb.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (rawRows.length === 0) {
    return {
      gameType,
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      validQuestions: [],
      errors: [{ row: 1, error: "Tệp Excel trống hoặc không có dòng dữ liệu nào." }],
    };
  }

  const validQuestions: AnyQuestion[] = [];
  const errors: ExcelImportRowError[] = [];

  if (gameType === "memory-flip" && isVerticalMemoryFlip(rawRows)) {
    parseVerticalMemoryFlip(rawRows, validQuestions, errors);
  } else {
    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // header is row 1
      const norm = normalizeRowKeys(rawRow);

      try {
        let candidate: Record<string, unknown>;

        switch (gameType) {
          case "sentence-builder":
            candidate = transformSentenceBuilder(norm);
            break;
          case "memory-flip":
            candidate = transformMemoryFlip(norm);
            break;
          case "error-detective":
            candidate = transformErrorDetective(norm);
            break;
          case "listen-choose":
            candidate = transformListenChoose(norm);
            break;
          case "roleplay":
            candidate = transformRoleplay(norm);
            break;
        }

        const validation: ValidationResult<AnyQuestion> = validateQuestion(candidate);

        if (validation.success) {
          validQuestions.push(validation.data);
        } else {
          errors.push({
            row: rowNumber,
            error: validation.errors.join("; "),
            rawData: rawRow,
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Lỗi xử lý dữ liệu dòng.";
        errors.push({
          row: rowNumber,
          error: msg,
          rawData: rawRow,
        });
      }
    });
  }

  return {
    gameType,
    totalRows: rawRows.length,
    validCount: validQuestions.length,
    errorCount: errors.length,
    validQuestions,
    errors,
  };
}

/**
 * Returns user-friendly columns and sample rows for generating game-specific Excel templates
 */
export function getGameExcelTemplateDefinition(gameType: SupportedGameType): {
  headers: string[];
  sampleRows: string[][];
  description: string;
} {
  switch (gameType) {
    case "sentence-builder":
      return {
        description: "Nhập câu tiếng Anh hoàn chỉnh, hệ thống sẽ tự động tách thành các thẻ từ để người học ghép câu.",
        headers: [
          "Độ khó (A0/A1/A2/B1)",
          "Câu tiếng Việt gợi ý",
          "Câu tiếng Anh chuẩn",
          "Giải thích tiếng Việt",
          "Từ khóa",
        ],
        sampleRows: [
          [
            "A1",
            "Vui lòng gửi cho tôi báo cáo dự án trước 5 giờ chiều.",
            "Please send me the project report before 5 PM.",
            "Cấu trúc Please + V nguyên mẫu để đưa ra lời đề nghị công việc lịch sự.",
            "office;email;requests",
          ],
          [
            "A2",
            "Tôi thường kiểm tra hộp thư email vào mỗi buổi sáng.",
            "I usually check my emails every morning.",
            "Thì hiện tại đơn diễn tả thói quen làm việc hàng ngày.",
            "habits;present-simple;daily",
          ],
        ],
      };

    case "memory-flip":
      return {
        description:
          "Nhập danh sách từ vựng theo hàng dọc (mỗi dòng 1 cặp từ). Hệ thống tự động gom cứ mỗi 4 từ thành một bàn chơi Memory Flip hoàn chỉnh.",
        headers: [
          "Từ tiếng Anh (EN)",
          "Nghĩa tiếng Việt (VI)",
          "Độ khó (A1/A2)",
          "Từ khóa / Chủ đề",
        ],
        sampleRows: [
          ["Colleague", "Đồng nghiệp", "A1", "office;workflow"],
          ["Deadline", "Hạn chót", "A1", "office;workflow"],
          ["Meeting", "Cuộc họp", "A1", "office;workflow"],
          ["Schedule", "Lịch trình", "A1", "office;workflow"],
          ["Presentation", "Thuyết trình", "A2", "presentation;business"],
          ["Feedback", "Nhận xét góp ý", "A2", "communication;office"],
          ["Contract", "Hợp đồng", "A2", "business;legal"],
          ["Proposal", "Bản đề xuất", "A2", "business;planning"],
        ],
      };

    case "error-detective":
      return {
        description: "Phát hiện và sửa lỗi ngữ pháp công sở (hệ thống tự động cắt đoạn câu).",
        headers: [
          "Độ khó (A1/A2)",
          "Câu hoàn chỉnh có lỗi",
          "Cụm từ bị sai",
          "Cách sửa đúng",
          "Phương án gây nhiễu 1",
          "Phương án gây nhiễu 2",
          "Điểm ngữ pháp",
          "Giải thích tiếng Việt",
          "Từ khóa",
        ],
        sampleRows: [
          [
            "A1",
            "He don't agree with the new project schedule.",
            "don't agree",
            "doesn't agree",
            "not agree",
            "isn't agree",
            "Subject-Verb Agreement",
            "Chủ ngữ ngôi thứ ba số ít (He) trong câu phủ định dùng trợ động từ doesn't.",
            "grammar;present-simple",
          ],
        ],
      };

    case "listen-choose":
      return {
        description: "Nghe audio hoặc phát âm tự động và chọn đáp án chính xác (không cần file âm thanh riêng).",
        headers: [
          "Độ khó (A1/A2)",
          "Câu thoại tiếng Anh (đọc bằng máy)",
          "Lựa chọn 1",
          "Lựa chọn 2",
          "Lựa chọn 3",
          "Lựa chọn 4",
          "Đáp án đúng (1, 2, 3, 4 hoặc A, B, C, D)",
          "Giải thích tiếng Việt",
          "Từ khóa",
        ],
        sampleRows: [
          [
            "A1",
            "The team meeting has been rescheduled to 2 PM.",
            "Cuộc họp diễn ra lúc 2:00 PM",
            "Cuộc họp diễn ra lúc 3:00 PM",
            "Cuộc họp bị hủy bỏ",
            "Cuộc họp dời sang ngày mai lúc 10:00 AM",
            "A",
            "Đoạn thông báo nói cuộc họp dời sang 2 giờ chiều (2 PM).",
            "listening;numbers-and-time",
          ],
          [
            "A2",
            "Could you please email me the quarterly sales report before noon?",
            "Gửi báo cáo bán hàng quý trước buổi trưa",
            "In hợp đồng trước 5 giờ chiều",
            "Gọi điện cho đối tác vào buổi sáng",
            "Chuẩn bị phòng họp trước 12 giờ",
            "A",
            "Đoạn thoại yêu cầu gửi báo cáo bán hàng quý (quarterly sales report) trước buổi trưa (before noon).",
            "listening;workplace-requests",
          ],
          [
            "A2",
            "We achieved a thirty percent increase in sales this quarter.",
            "Tăng trưởng 30%",
            "Tăng trưởng 13%",
            "Tăng trưởng 33%",
            "Giảm 30%",
            "A",
            "Đoạn thoại phát âm 'thirty percent' (30%), phân biệt với 'thirteen' (13).",
            "listening;business-reports",
          ],
        ],
      };

    case "roleplay":
      return {
        description: "Tình huống đối thoại công sở phân nhánh và nhận xét sư phạm.",
        headers: [
          "Độ khó (A2/B1)",
          "Bối cảnh tình huống",
          "Vai NPC",
          "Lời thoại NPC",
          "Lựa chọn 1",
          "Đánh giá 1 (Phù hợp/Chấp nhận được/Không phù hợp)",
          "Giải thích 1",
          "Lựa chọn 2",
          "Đánh giá 2 (Phù hợp/Chấp nhận được/Không phù hợp)",
          "Giải thích 2",
          "Từ khóa",
        ],
        sampleRows: [
          [
            "A2",
            "Dự án gặp sự cố kỹ thuật ngoài dự kiến và bạn cần thêm thời gian.",
            "Trưởng phòng Kỹ thuật",
            "Hi, can you confirm if the deliverables will be ready by 5 PM today?",
            "We encountered an unexpected technical issue. May we have until tomorrow morning at 10 AM to ensure quality?",
            "Phù hợp",
            "Rất xuất sắc! Nêu lý do ngắn gọn và cam kết mốc giờ mới rõ ràng.",
            "No, today is impossible. You gave us too much work.",
            "Không phù hợp",
            "Chưa phù hợp. Giọng điệu mang tính đổ lỗi cho cấp trên.",
            "speaking;negotiation",
          ],
        ],
      };
  }
}

/**
 * Generates an Excel workbook binary for a specific game
 */
export function exportGameExcelTemplate(gameType: SupportedGameType): Uint8Array {
  const def = getGameExcelTemplateDefinition(gameType);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([def.headers, ...def.sampleRows]);

  // Set generous column widths
  ws["!cols"] = def.headers.map(() => ({ wch: 28 }));

  XLSX.utils.book_append_sheet(wb, ws, "Nhập liệu câu hỏi");
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buffer);
}
