import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  FileSpreadsheet,
  ArrowLeft,
  Settings,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-bold shadow-xs">
                <Settings className="h-5 w-5" />
              </span>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                English Hub CMS
              </span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-extrabold text-red-700 border border-red-200 uppercase tracking-wider">
              <ShieldAlert className="h-3 w-3" />
              <span>Admin Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Về cổng học viên</span>
              <span className="sm:hidden">Thoát</span>
            </Link>
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <div className="border-t border-slate-100 bg-surface px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            {[
              { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
              { href: "/admin/questions", label: "Quản lý câu hỏi", icon: HelpCircle },
              { href: "/admin/topics", label: "Quản lý chủ đề", icon: BookOpen },
              { href: "/admin/import", label: "Nhập dữ liệu Excel / CSV", icon: FileSpreadsheet },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
                >
                  <Icon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}

