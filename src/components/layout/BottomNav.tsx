"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, RotateCcw, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavProps {
  isGuest?: boolean;
}

export const BOTTOM_NAV_ITEMS = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/games", label: "Kho game", icon: Gamepad2 },
  { href: "/review", label: "Ôn tập", icon: RotateCcw },
  { href: "/progress", label: "Tiến độ", icon: TrendingUp },
  { href: "/profile", label: "Tài khoản", icon: User },
];

export function BottomNav({ isGuest = true }: BottomNavProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Thanh điều hướng dưới màn hình"
      className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200/90 bg-white/95 backdrop-blur-md md:hidden safe-area-bottom shadow-lg"
    >
      <div className="grid h-16 grid-cols-5 items-center justify-around px-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const targetHref = item.href === "/profile" && isGuest ? "/login" : item.href;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={targetHref}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-1 min-h-touch transition-colors",
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-2")}
                aria-hidden="true"
              />
              <span className="text-[11px] leading-tight tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
