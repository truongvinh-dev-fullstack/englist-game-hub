"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, Radio, Sparkles, Gauge } from "lucide-react";
import type { ListenChoosePublicPayload } from "@/lib/validations/content/listen-choose";
import { cn } from "@/lib/utils";

export interface ListenChooseRendererProps {
  payload: ListenChoosePublicPayload;
  speechText?: string;
  selectedOptionId: string | null;
  disabled?: boolean;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
}

export function ListenChooseRenderer({
  payload,
  speechText,
  selectedOptionId,
  disabled = false,
  onSelectOption,
  onSubmit,
}: ListenChooseRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudioError, setHasAudioError] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [speechRate, setSpeechRate] = useState<number>(0.9); // 0.9 standard, 0.75 slow
  const [isTtsMode, setIsTtsMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Spoken text source priority: payload.speechText -> speechText prop -> audioPath if non-url
  const textToSpeak = (payload.speechText || speechText || "").trim();

  // TTS browser speech execution helper
  const speakWithWebSpeech = useCallback(
    (text: string, rate: number = 0.9) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setHasAudioError(true);
        setIsPlaying(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = rate;
        utterance.pitch = 1.0;

        // Try to pick natural English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(
          (v) =>
            (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB") || v.lang.startsWith("en")) &&
            !v.name.toLowerCase().includes("whisper")
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
          setHasAudioError(false);
          setIsTtsMode(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setPlayCount((prev) => prev + 1);
        };

        utterance.onerror = (e) => {
          // Ignore intentional cancel/interrupt calls
          if (e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("SpeechSynthesis error:", e);
            setHasAudioError(true);
          }
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setHasAudioError(true);
        setIsPlaying(false);
      }
    },
    []
  );

  // Play audio safely: uses audio file if available, falls back to Web Speech TTS
  const playAudio = useCallback(() => {
    setHasAudioError(false);

    const hasAudioFile =
      payload.audioPath &&
      payload.audioPath !== "tts" &&
      (payload.audioPath.startsWith("http") ||
        payload.audioPath.startsWith("/") ||
        payload.audioPath.match(/\.(mp3|wav|ogg|m4a)$/i));

    if (hasAudioFile) {
      if (!audioRef.current) {
        audioRef.current = new Audio(payload.audioPath);
        audioRef.current.onplay = () => {
          setIsPlaying(true);
          setIsTtsMode(false);
        };
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlayCount((prev) => prev + 1);
        };
        audioRef.current.onerror = () => {
          // Audio file failed -> graceful fallback to Web Speech TTS
          if (textToSpeak) {
            speakWithWebSpeech(textToSpeak, speechRate);
          } else {
            setIsPlaying(false);
            setHasAudioError(true);
          }
        };
      } else {
        audioRef.current.src = payload.audioPath;
      }

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to TTS if browser audio play failed
          if (textToSpeak) {
            speakWithWebSpeech(textToSpeak, speechRate);
          } else {
            setIsPlaying(false);
            setHasAudioError(true);
          }
        });
      }
    } else if (textToSpeak) {
      // Direct Web Speech API synthesis
      speakWithWebSpeech(textToSpeak, speechRate);
    } else {
      setHasAudioError(true);
      setIsPlaying(false);
    }
  }, [payload.audioPath, textToSpeak, speakWithWebSpeech, speechRate]);

  // Stop currently playing speech/audio
  const stopAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Toggle speed between standard 0.9x and slower 0.75x
  const toggleSpeed = () => {
    const nextRate = speechRate === 0.9 ? 0.75 : 0.9;
    setSpeechRate(nextRate);
    if (isPlaying) {
      stopAudio();
    }
  };

  // Reset audio on question payload change
  useEffect(() => {
    setIsPlaying(false);
    setHasAudioError(false);
    setPlayCount(0);
    setIsTtsMode(false);

    stopAudio();

    // Friendly auto-play on load (if allowed by browser policy)
    const timer = setTimeout(() => {
      playAudio();
    }, 350);

    return () => {
      clearTimeout(timer);
      stopAudio();
    };
  }, [payload.audioPath, textToSpeak, playAudio, stopAudio]);

  // Keyboard shortcut listener: 1-4 for options, Space to replay, Enter to submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= payload.options.length) {
        e.preventDefault();
        const target = payload.options[num - 1];
        if (target) {
          onSelectOption(target.id);
        }
      } else if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) {
          stopAudio();
        } else {
          playAudio();
        }
      } else if (e.key === "Enter" && selectedOptionId) {
        e.preventDefault();
        onSubmit();
      }
    },
    [disabled, payload.options, onSelectOption, isPlaying, playAudio, stopAudio, selectedOptionId, onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Audio Listening Control Center */}
      <div className="rounded-3xl border-2 border-slate-200/90 bg-linear-to-b from-surface to-slate-50/80 p-6 sm:p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
        {/* Main Audio Pulse Button */}
        <div className="relative">
          {isPlaying && (
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          )}
          <button
            type="button"
            onClick={isPlaying ? stopAudio : playAudio}
            aria-label={isPlaying ? "Đang phát âm thanh" : "Bấm để nghe âm thanh"}
            className={cn(
              "relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full text-white shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-primary active:scale-95 min-h-touch min-w-touch cursor-pointer",
              isPlaying
                ? "bg-amber-500 shadow-amber-500/30 scale-105"
                : hasAudioError
                ? "bg-red-500 shadow-red-500/30 hover:bg-red-600"
                : "bg-primary shadow-primary/30 hover:bg-primary-hover hover:scale-105"
            )}
          >
            {hasAudioError ? (
              <VolumeX className="h-9 w-9 sm:h-11 sm:w-11" />
            ) : isPlaying ? (
              <Radio className="h-9 w-9 sm:h-11 sm:w-11 animate-pulse" />
            ) : (
              <Volume2 className="h-9 w-9 sm:h-11 sm:w-11" />
            )}
          </button>
        </div>

        {/* Audio State Label & Action */}
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-bold text-slate-900">
            {hasAudioError
              ? "Không thể phát âm thanh tự động"
              : isPlaying
              ? "Đang phát âm thanh... lắng nghe kỹ nhé"
              : playCount > 0
              ? "Chạm vào loa để nghe lại"
              : "Chạm vào loa để bắt đầu nghe"}
          </p>
          <p className="text-xs text-slate-500">
            {hasAudioError
              ? "Vui lòng chạm nút bên dưới để thử lại"
              : playCount > 0
              ? `Bạn đã nghe ${playCount} lần (phím tắt: Phím cách)`
              : "Khuyên dùng tai nghe để nhận diện âm chuẩn nhất"}
          </p>
        </div>

        {/* Speed Adjustment & Audio Engine Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={toggleSpeed}
            title="Đổi tốc độ đọc giọng tiếng Anh"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
              speechRate === 0.75
                ? "bg-amber-50 text-amber-700 border-amber-300 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>Tốc độ: {speechRate === 0.75 ? "0.75x (Chậm)" : "0.9x (Chuẩn)"}</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-full border border-slate-200/60">
            {isTtsMode || (!payload.audioPath || payload.audioPath === "tts")
              ? "🔊 Phát âm chuẩn giọng đọc bản ngữ (TTS)"
              : "🎧 Audio phòng thu"}
          </span>
        </div>

        {/* Fallback & Retry Button */}
        {hasAudioError && (
          <button
            type="button"
            onClick={playAudio}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Thử phát lại âm thanh</span>
          </button>
        )}

        {/* Zero-leakage Notice */}
        <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100/70 px-2.5 py-1 rounded-full">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Văn bản lời đọc (transcript) sẽ hiển thị chi tiết sau khi bạn nộp bài</span>
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Chọn đáp án đúng nhất theo nội dung nghe được:</span>
          <span className="text-[11px] text-slate-400">
            {selectedOptionId ? "Đã chọn đáp án" : "Chưa chọn"}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Các lựa chọn nghe hiểu"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {payload.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onSelectOption(option.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all min-h-touch focus-visible:outline-2 focus-visible:outline-primary select-none cursor-pointer",
                  isSelected
                    ? "border-primary bg-blue-50/80 text-primary font-bold shadow-xs ring-2 ring-primary/20 scale-101"
                    : "border-slate-200 bg-surface text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm leading-snug">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span>*Chạm để nghe lại không giới hạn</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          Bấm <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Space</kbd> để nghe lại, <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">1..4</kbd> để chọn đáp án
        </span>
      </div>
    </div>
  );
}
