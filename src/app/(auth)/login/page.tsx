"use client";

import React, { useActionState, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  signUpWithPassword,
  signInWithPassword,
  signInWithEmail,
  quickRegisterDemoAction,
  type AuthActionResult,
} from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

function AuthFormContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const shouldDefaultToRegister =
    pathname.includes("register") || searchParams.get("tab") === "register";

  const [activeTab, setActiveTab] = useState<"register" | "login">(
    shouldDefaultToRegister ? "register" : "login"
  );
  const [loginMethod, setLoginMethod] = useState<"password" | "magic-link">("password");

  // Track register action state
  const [registerState, registerAction, isRegisterPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signUpWithPassword, null);

  // Track password login action state
  const [loginState, loginAction, isLoginPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signInWithPassword, null);

  // Track magic link action state
  const [magicLinkState, magicLinkAction, isMagicLinkPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signInWithEmail, null);

  // Quick 1-click state
  const [isQuickPending, setIsQuickPending] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Handle auto redirect on successful registration
  useEffect(() => {
    if (!registerState?.success || !registerState.redirectUrl) return;
    const timer = setTimeout(() => {
      window.location.href = registerState.redirectUrl || "/games";
    }, 700);
    return () => clearTimeout(timer);
  }, [registerState]);

  // Handle auto redirect on successful login
  useEffect(() => {
    if (!loginState?.success || !loginState.redirectUrl) return;
    const timer = setTimeout(() => {
      window.location.href = loginState.redirectUrl || "/games";
    }, 700);
    return () => clearTimeout(timer);
  }, [loginState]);

  const handleQuickRegister = async () => {
    setIsQuickPending(true);
    setQuickError(null);
    try {
      const res = await quickRegisterDemoAction();
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else if (res.error) {
        setQuickError(res.error);
        setIsQuickPending(false);
      }
    } catch {
      setQuickError("Không thể tạo tài khoản nhanh lúc này. Vui lòng thử lại.");
      setIsQuickPending(false);
    }
  };

  const isCurrentSuccess =
    activeTab === "register"
      ? registerState?.success
      : loginMethod === "password"
      ? loginState?.success
      : magicLinkState?.success;

  const currentSuccessMessage =
    activeTab === "register"
      ? registerState?.message
      : loginMethod === "password"
      ? loginState?.message
      : magicLinkState?.message;

  const currentError =
    quickError ||
    (activeTab === "register"
      ? registerState?.error
      : loginMethod === "password"
      ? loginState?.error
      : magicLinkState?.error);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-4 py-8 sm:px-6">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại Trang chủ</span>
        </Link>
      </div>

      {/* Card Container */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface p-6 sm:p-8 shadow-xs">
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "register"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <UserPlus className="h-4 w-4" />
            <span>Đăng ký</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "login"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LogIn className="h-4 w-4" />
            <span>Đăng nhập</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            {activeTab === "register" ? (
              <UserPlus className="h-6 w-6" aria-hidden="true" />
            ) : (
              <LogIn className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === "register" ? "Tạo tài khoản học viên" : "Đăng nhập tài khoản"}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">
            {activeTab === "register"
              ? "Đăng ký siêu tốc chỉ mất 10 giây để lưu điểm XP và tiến độ học."
              : "Chọn hình thức đăng nhập thuận tiện nhất cho bạn."}
          </p>
        </div>

        {/* Success Alert */}
        {isCurrentSuccess && currentSuccessMessage && (
          <div
            role="alert"
            className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-900">Thành công!</p>
              <p className="mt-1 leading-relaxed">{currentSuccessMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {currentError && (
          <div
            role="alert"
            className="mt-5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{currentError}</p>
          </div>
        )}

        {/* Forms Container */}
        {!isCurrentSuccess && (
          <div className="mt-6">
            {/* REGISTER TAB */}
            {activeTab === "register" && (
              <form action={registerAction} className="space-y-4">
                <div>
                  <label
                    htmlFor="reg-fullName"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Họ và tên của bạn <span className="text-slate-400 font-normal">(tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-fullName"
                      name="fullName"
                      type="text"
                      placeholder="Ví dụ: Minh Anh"
                      className="w-full min-h-touch rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      className="w-full min-h-touch rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Mật khẩu <span className="text-red-500">*</span>{" "}
                    <span className="text-slate-400 font-normal">(tối thiểu 6 ký tự)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full min-h-touch rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegisterPending}
                  className="w-full min-h-touch rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isRegisterPending ? (
                    <span>Đang tạo tài khoản...</span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>Đăng ký & Bắt đầu học ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* LOGIN TAB */}
            {activeTab === "login" && (
              <div>
                {/* Login Method Sub-Toggle */}
                <div className="mb-4 flex items-center justify-center gap-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("password")}
                    className={cn(
                      "pb-1 border-b-2 transition-colors",
                      loginMethod === "password"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Bằng Mật khẩu
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("magic-link")}
                    className={cn(
                      "pb-1 border-b-2 transition-colors",
                      loginMethod === "magic-link"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Email Magic Link
                  </button>
                </div>

                {loginMethod === "password" ? (
                  <form action={loginAction} className="space-y-4">
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          id="login-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="name@example.com"
                          className="w-full min-h-touch rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          id="login-password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          placeholder="••••••••"
                          className="w-full min-h-touch rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoginPending}
                      className="w-full min-h-touch rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoginPending ? (
                        <span>Đang đăng nhập...</span>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" aria-hidden="true" />
                          <span>Đăng nhập</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form action={magicLinkAction} className="space-y-4">
                    <div>
                      <label
                        htmlFor="magic-email"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Địa chỉ Email nhận Magic Link
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          id="magic-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="name@company.com"
                          className="w-full min-h-touch rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isMagicLinkPending}
                      className="w-full min-h-touch rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isMagicLinkPending ? (
                        <span>Đang gửi liên kết...</span>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          <span>Gửi liên kết đăng nhập qua Email</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* FAST 1-CLICK INSTANT REGISTER / ACCESS */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="relative flex justify-center text-xs uppercase mb-3">
                <span className="bg-surface px-2 text-slate-400 font-medium">
                  Hoặc cách nhanh nhất
                </span>
              </div>
              <button
                type="button"
                disabled={isQuickPending}
                onClick={handleQuickRegister}
                className="w-full min-h-touch rounded-2xl border-2 border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-900 transition-all flex items-center justify-center gap-2 group shadow-xs disabled:opacity-50"
              >
                <Zap className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>
                  {isQuickPending
                    ? "Đang khởi tạo tài khoản nhanh..."
                    : "⚡ Đăng ký siêu tốc 1-chạm (Vào học ngay)"}
                </span>
              </button>
              <p className="mt-1.5 text-center text-[11px] text-muted">
                Tự động tạo tài khoản học viên demo trong 1 giây, không cần gõ phím.
              </p>
            </div>
          </div>
        )}

        {/* Guest Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/games"
            className="text-xs font-semibold text-primary hover:text-primary-hover"
          >
            Tiếp tục trải nghiệm với tư cách Khách &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppShell isGuest={true}>
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center text-slate-500 text-sm">
            Đang tải trang tài khoản...
          </div>
        }
      >
        <AuthFormContent />
      </Suspense>
    </AppShell>
  );
}
