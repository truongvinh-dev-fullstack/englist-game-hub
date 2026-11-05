import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finishSession, SessionServiceError } from "@/services/session.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Bạn cần đăng nhập để hoàn thành phiên chơi." } },
        { status: 401 }
      );
    }

    const summary = await finishSession(sessionId, user.id);
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    if (error instanceof SessionServiceError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Đã có lỗi hệ thống xảy ra." } },
      { status: 500 }
    );
  }
}

