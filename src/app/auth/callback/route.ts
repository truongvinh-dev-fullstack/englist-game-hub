import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Prevent Open Redirect attacks: ensure 'next' is a relative path starting with a single '/'
  const isSafeRedirect =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("://");
  const safeRedirectPath = isSafeRedirect ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeRedirectPath, requestUrl.origin));
    }
  }

  // Return user to an error state or login with error message if code exchange failed
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent("Liên kết đăng nhập không hợp lệ hoặc đã hết hạn.")}`, requestUrl.origin)
  );
}

