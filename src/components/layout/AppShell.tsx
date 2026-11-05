import React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  userXP?: number;
  userName?: string;
  isGuest?: boolean;
  containerClassName?: string;
}

export function AppShell({
  children,
  hideHeader = false,
  hideBottomNav = false,
  userXP = 0,
  userName,
  isGuest = true,
  containerClassName,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-appText">
      {!hideHeader && (
        <Header userXP={userXP} userName={userName} isGuest={isGuest} />
      )}

      <main
        className={cn(
          "flex-1 w-full",
          !hideBottomNav && "pb-20 md:pb-8",
          containerClassName
        )}
      >
        {children}
      </main>

      {!hideBottomNav && <BottomNav isGuest={isGuest} />}
    </div>
  );
}

