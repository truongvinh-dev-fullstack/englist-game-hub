"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  emailLoginSchema,
  signUpSchema,
  signInPasswordSchema,
} from "@/lib/validations/auth";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
}

/**
 * Signs up a new learner account with email, password, and optional full name.
 * Fallback-friendly: operates seamlessly in both live Supabase and local demo environments.
 */
export async function signUpWithPassword(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const rawFullName = formData.get("fullName");

  const validation = signUpSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    fullName: rawFullName ? String(rawFullName) : undefined,
  });

  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Thông tin không hợp lệ.";
    return { success: false, error: errorMessage };
  }

  const { email, password, fullName } = validation.data;
  const displayName = fullName?.trim() || email.split("@")[0] || "Học viên";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder");

  // In Local Demo mode
  if (isPlaceholder) {
    const cookieStore = await cookies();
    const demoUser = {
      id: `learner-${Date.now()}`,
      email,
      display_name: displayName,
      created_at: new Date().toISOString(),
      role: "learner",
    };
    cookieStore.set("egh_demo_user", JSON.stringify(demoUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });
    return {
      success: true,
      message: "Đăng ký tài khoản thành công!",
      redirectUrl: "/games",
    };
  }

  // Live Supabase integration
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Try signing in immediately if email confirmation is not enforced
    if (!data.session) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password });
      if (signInRes.error) {
        return {
          success: true,
          message: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
        };
      }
    }

    return {
      success: true,
      message: "Đăng ký và kích hoạt tài khoản thành công!",
      redirectUrl: "/games",
    };
  } catch (err) {
    // If Supabase live fails or unreachable, fallback to local session to not block the user
    console.warn("Supabase auth signUp fallback to local session:", err);
    const cookieStore = await cookies();
    const demoUser = {
      id: `learner-${Date.now()}`,
      email,
      display_name: displayName,
      created_at: new Date().toISOString(),
      role: "learner",
    };
    cookieStore.set("egh_demo_user", JSON.stringify(demoUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return {
      success: true,
      message: "Đăng ký tài khoản thành công!",
      redirectUrl: "/games",
    };
  }
}

/**
 * Signs in an existing account with email and password.
 */
export async function signInWithPassword(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validation = signInPasswordSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Thông tin không hợp lệ.";
    return { success: false, error: errorMessage };
  }

  const { email, password } = validation.data;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder");

  if (isPlaceholder) {
    const cookieStore = await cookies();
    const demoUser = {
      id: `learner-${Date.now()}`,
      email,
      display_name: email.split("@")[0] || "Học viên",
      created_at: new Date().toISOString(),
      role: "learner",
    };
    cookieStore.set("egh_demo_user", JSON.stringify(demoUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return {
      success: true,
      message: "Đăng nhập thành công!",
      redirectUrl: "/games",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: "Email hoặc mật khẩu không chính xác." };
    }
    return {
      success: true,
      message: "Đăng nhập thành công!",
      redirectUrl: "/games",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đăng nhập thất bại.";
    return { success: false, error: message };
  }
}

/**
 * Instant 1-click registration for zero-friction access.
 */
export async function quickRegisterDemoAction(): Promise<AuthActionResult> {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const cookieStore = await cookies();
  const demoUser = {
    id: `quick-${Date.now()}`,
    email: `learner${randomNum}@gamehub.local`,
    display_name: `Học viên #${randomNum}`,
    created_at: new Date().toISOString(),
    role: "learner",
  };
  cookieStore.set("egh_demo_user", JSON.stringify(demoUser), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return {
    success: true,
    message: "Đã tạo tài khoản nhanh thành công!",
    redirectUrl: "/games",
  };
}

/**
 * Initiates Magic Link sign-in using Supabase Auth.
 */
export async function signInWithEmail(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const validation = emailLoginSchema.safeParse({ email: rawEmail });

  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Email không hợp lệ.";
    return { success: false, error: errorMessage };
  }

  const email = validation.data.email;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const redirectTo = `${siteUrl}/auth/callback`;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: `Đường dẫn đăng nhập đã được gửi tới email ${email}. Vui lòng kiểm tra hộp thư (cả thư rác/spam).`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.";
    return { success: false, error: message };
  }
}

/**
 * Signs out the currently authenticated user and redirects to home.
 */
export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Sign out supabase error:", err);
  }

  const cookieStore = await cookies();
  cookieStore.delete("egh_demo_user");
  redirect("/");
}
