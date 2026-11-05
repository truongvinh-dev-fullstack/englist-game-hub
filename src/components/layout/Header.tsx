"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { XPBadge } from "@/components/ui/XPBadge";

export interface HeaderProps {
  userXP?: number;
  userName?: string;
  isGuest?: boolean;
}

export const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/games", label: "Kho game" },
  { href: "/topics", label: "Chủ đề" },
  { href: "/review", label: "Ôn tập" },
  { href: "/progress", label: "Tiến độ" },
];

export function Header({
  userXP = 0,
  userName,
  isGuest = true,
}: HeaderProps) {
  const pathname = usePathname() ?? "";
  const [clientUser, setClientUser] = React.useState<{ name: string } | null>(null);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(new RegExp("(?:^|; )egh_demo_user=([^;]*)"));
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        setClientUser({ name: parsed.display_name || parsed.email });
      } catch {}
    }
  }, []);

  const effectiveIsGuest = isGuest && !clientUser;
  const effectiveUserName = userName || clientUser?.name;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="English Game Hub - Về trang chủ"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <Gamepad2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              English Game Hub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Thanh điều hướng chính"
            className="hidden md:flex md:items-center md:gap-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-touch flex items-center",
                    isActive
                      ? "bg-slate-100 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / XP / Auth CTA */}
        <div className="flex items-center gap-3">
          <XPBadge xp={userXP} size="sm" className="sm:inline-flex" />

          {effectiveIsGuest ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex min-h-touch items-center justify-center rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/login?tab=register"
                className="inline-flex min-h-touch items-center justify-center rounded-xl bg-primary px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
              aria-label="Trang cá nhân của bạn"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-xs">
                {effectiveUserName ? effectiveUserName.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <span className="hidden lg:inline text-sm font-medium text-slate-800">
                {effectiveUserName || "Học viên"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
