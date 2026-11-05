"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  FileCheck,
  Table,
  Layers,
} from "lucide-react";
import {
  exportGameExcelTemplate,
  parseGameExcelOrCsv,
  getGameExcelTemplateDefinition,
  type SupportedGameType,
  type ExcelImportResult,
} from "@/lib/services/excel-game-importer.service";
import {
  parseQuestionsCsv,
  getSampleCsvTemplate,
  type ParsedCsvResult,
} from "@/lib/services/csv-importer.service";
import { saveCustomQuestions } from "@/lib/storage/question-storage";

interface GameTabConfig {
  id: SupportedGameType;
  title: string;
  badge: string;
  skillText: string;
  skillColor: string;
  icon: string;
}

const GAME_TABS: GameTabConfig[] = [
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    badge: "Xếp câu",
    skillText: "Ngữ pháp",
    skillColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "🔤",
  },
  {
    id: "memory-flip",
    title: "Memory Flip",
    badge: "Lật thẻ nhớ",
    skillText: "Từ vựng",
    skillColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "🃏",
  },
  {
    id: "error-detective",
    title: "Error Detective",
    badge: "Tìm lỗi sai",
    skillText: "Ngữ pháp",
    skillColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "🔍",
  },
  {
    id: "listen-choose",
    title: "Listen & Choose",
    badge: "Nghe hiểu",
    skillText: "Luyện nghe",
    skillColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: "🎧",
  },
  {
    id: "roleplay",
    title: "Roleplay Simulator",
    badge: "Hội thoại",
    skillText: "Giao tiếp",
    skillColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: "🎭",
  },
];

export default function AdminImportPage() {
  const [activeGame, setActiveGame] = useState<SupportedGameType>("sentence-builder");
  const [excelResult, setExcelResult] = useState<ExcelImportResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isImported, setIsImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw CSV Legacy Mode states
  const [showRawCsvMode, setShowRawCsvMode] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvParseResult, setCsvParseResult] = useState<ParsedCsvResult | null>(null);

  const activeTabConfig = GAME_TABS.find((t) => t.id === activeGame)!;
  const activeTemplateDef = getGameExcelTemplateDefinition(activeGame);

  // 1. Download game-specific Excel template (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const buffer = exportGameExcelTemplate(activeGame);
    const blob = new Blob([buffer.buffer as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mau_nhap_lieu_${activeGame}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Load sample data directly into preview
  const handleLoadSampleData = () => {
    const buffer = exportGameExcelTemplate(activeGame);
    const result = parseGameExcelOrCsv(buffer, activeGame);
    setExcelResult(result);
    setUploadedFileName(`mau_nhap_lieu_${activeGame}.xlsx (Dữ liệu mẫu chuẩn)`);
    setIsImported(false);
  };

  // 3. Handle file drop/upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadedFileName(file.name);
    setIsImported(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const result = parseGameExcelOrCsv(buffer, activeGame);
        setExcelResult(result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 4. Commit Import
  const handleCommitImport = () => {
    if (!excelResult || excelResult.validCount === 0) return;
    saveCustomQuestions(excelResult.validQuestions);
    setIsImported(true);
  };

  // 5. Raw CSV Handlers
  const handleDownloadRawCsv = () => {
    const sample = getSampleCsvTemplate();
    const blob = new Blob(["\uFEFF" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "english_game_hub_sample_questions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValidateRawCsv = () => {
    if (!csvText.trim()) return;
    const result = parseQuestionsCsv(csvText);
    setCsvParseResult(result);
    setIsImported(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-2">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Công cụ nạp câu hỏi thông minh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nhập dữ liệu câu hỏi từ file Excel (.xlsx)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Mỗi mini-game có mẫu Excel và cấu trúc cột riêng biệt, dễ điền và không yêu cầu viết mã JSON.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRawCsvMode(!showRawCsvMode)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Layers className="h-4 w-4 text-slate-400" />
            <span>{showRawCsvMode ? "Chuyển về nhập Excel" : "Chế độ CSV nâng cao"}</span>
          </button>
        </div>
      </div>

      {!showRawCsvMode ? (
        <>
          {/* Game Selection Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Bước 1: Chọn mini-game cần nhập dữ liệu:</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {GAME_TABS.map((tab) => {
                const isSelected = activeGame === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveGame(tab.id);
                      setExcelResult(null);
                      setUploadedFileName("");
                      setIsImported(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-surface text-slate-700 hover:bg-slate-50/90 font-medium"
                    }`}
                  >
                    <span className="text-2xl mb-1.5" aria-hidden="true">
                      {tab.icon}
                    </span>
                    <span className="text-xs font-bold">{tab.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{tab.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Game Action Box */}
          <div className="rounded-3xl border border-slate-200 bg-surface p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{activeTabConfig.icon}</span>
                    <span>Quy trình nạp cho {activeTabConfig.title}</span>
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${activeTabConfig.skillColor}`}
                  >
                    {activeTabConfig.skillText}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{activeTemplateDef.description}</p>
              </div>

              {/* Template Download & Preview Sample */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Tải file Excel mẫu (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Table className="h-4 w-4 text-slate-500" />
                  <span>Xem thử dữ liệu mẫu</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bước 2: Tải lên tệp Excel (.xlsx, .xls) hoặc .csv đã điền:
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all space-y-3"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Bấm để chọn tệp hoặc kéo thả file Excel vào đây
                  </p>
                  <p className="text-xs text-slate-400">
                    Hỗ trợ định dạng: <strong>.xlsx, .xls, .csv</strong> (Hệ thống tự động kiểm tra Zod Schema)
                  </p>
                </div>
                {uploadedFileName && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-xs">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    <span>{uploadedFileName}</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Validation & Preview Result Area */}
          {excelResult && (
            <div className="rounded-3xl border border-slate-200 bg-surface p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kết quả đối soát cho {activeTabConfig.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đã kiểm tra <strong>{excelResult.totalRows} dòng</strong> trong file.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{excelResult.validCount} câu hợp lệ</span>
                  </span>

                  {excelResult.errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-xs font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{excelResult.errorCount} lỗi</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Error Details */}
              {excelResult.errors.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 sm:p-5 space-y-2">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Các dòng phát hiện lỗi:</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-red-700">
                    {excelResult.errors.map((err, idx) => (
                      <p key={idx} className="font-mono">
                        <strong>Dòng {err.row}:</strong> {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Questions Preview Table */}
              {excelResult.validCount > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Bảng xem trước {excelResult.validCount} câu hỏi chuẩn bị nạp:</span>
                  </h4>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Độ khó</th>
                            <th className="py-2.5 px-3">Yêu cầu / Câu hỏi</th>
                            <th className="py-2.5 px-3">Giải thích</th>
                            <th className="py-2.5 px-3">Từ khóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {excelResult.validQuestions.map((q, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  {q.difficulty}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                                {q.prompt}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                                {q.explanation_vi}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                {q.concept_tags.join(", ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Commit Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {isImported
                    ? "Đã nạp thành công các câu hỏi vào ngân hàng đề thi!"
                    : "Xác nhận nạp để lưu toàn bộ các câu hợp lệ."}
                </span>

                {isImported ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Nạp thành công!</span>
                    </span>
                    <Link
                      href="/admin/questions"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-2"
                    >
                      <span>Xem danh sách câu hỏi</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={excelResult.validCount === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Xác nhận nạp ({excelResult.validCount} câu hợp lệ)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Legacy Raw CSV Mode */
        <div className="rounded-3xl border border-slate-200 bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Chế độ nhập CSV chuẩn Raw (Toàn bộ 6 game)
              </h2>
              <p className="text-xs text-slate-500">
                Dành cho kỹ thuật viên nhập trực tiếp chuỗi JSON public_payload và private_solution.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadRawCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Tải file CSV mẫu</span>
            </button>
          </div>

          <textarea
            id="csv-input"
            rows={10}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setCsvParseResult(null);
            }}
            placeholder="Dán nội dung CSV..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 font-mono text-xs text-slate-800 leading-relaxed focus:border-emerald-600 focus:bg-white focus:outline-hidden"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {csvText.split(/\r?\n/).filter((l) => l.trim().length > 0).length} dòng
            </span>
            <button
              type="button"
              onClick={handleValidateRawCsv}
              disabled={!csvText.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs"
            >
              <FileCheck className="h-4 w-4" />
              <span>Kiểm tra tính hợp lệ</span>
            </button>
          </div>

          {csvParseResult && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
              <p className="font-bold text-slate-800">
                Kết quả kiểm tra CSV: {csvParseResult.validCount} hợp lệ, {csvParseResult.errorCount} lỗi.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
