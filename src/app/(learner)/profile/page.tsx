import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User, Mail, Calendar, LogOut, Shield, Award } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let user = null;
  let profile = null;
  let isUserAdmin = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = p;

      const { data: adminCheck } = await supabase.rpc("is_admin", {
        check_user_id: user.id,
      });
      isUserAdmin = Boolean(adminCheck);
    }
  } catch (err) {
    console.warn("Supabase user fetch in profile page:", err);
  }

  // Check demo user cookie if Supabase user is not present
  let demoUser: {
    id: string;
    email: string;
    display_name: string;
    created_at: string;
    role?: string;
  } | null = null;

  if (!user) {
    const cookieStore = await cookies();
    const rawDemo = cookieStore.get("egh_demo_user")?.value;
    if (rawDemo) {
      try {
        demoUser = JSON.parse(rawDemo);
      } catch {}
    }
  }

  if (!user && !demoUser) {
    redirect("/login?next=/profile");
  }

  const displayName =
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    demoUser?.display_name ||
    "Học viên";
  const email = user?.email || demoUser?.email || "Chưa có email";
  const createdAt = user?.created_at || demoUser?.created_at || new Date().toISOString();
  const joinedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell isGuest={false} userName={displayName}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Header Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-black shadow-lg shadow-indigo-500/25">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{displayName}</h1>
                {isUserAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/60">
                    <Shield className="h-3 w-3" />
                    Quản trị viên
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{email}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tham gia ngày {joinedDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Account Details & Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-surface p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Loại tài khoản</h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Tài khoản học viên đã xác thực. Tiến trình học, điểm XP và lịch sử câu sai được đồng bộ tự động lên máy chủ.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-surface p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900">Mục tiêu học tập</h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Mục tiêu mặc định: 2 phiên học (5–10 phút) mỗi ngày để duy trì thói quen phản xạ tiếng Anh công sở.
            </p>
          </div>
        </div>

        {/* Action Controls & Sign Out */}
        <div className="rounded-2xl border border-slate-200/90 bg-surface p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Đăng xuất tài khoản</h3>
            <p className="text-xs text-muted">
              Kết thúc phiên đăng nhập trên thiết bị này.
            </p>
          </div>
          <form action={signOutAction} className="w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-100/80 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Đăng xuất</span>
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

