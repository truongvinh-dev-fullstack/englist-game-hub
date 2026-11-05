import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSessionInputSchema } from "@/lib/validations/session";
import { createSession, SessionServiceError } from "@/services/session.service";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Bạn cần đăng nhập để tạo phiên chơi có lưu điểm." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createSessionInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Dữ liệu khởi tạo phiên chơi không hợp lệ.",
            details: validation.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const sessionData = await createSession({
      userId: user.id,
      gameSlug: validation.data.gameSlug,
      topicId: validation.data.topicId,
      difficulty: validation.data.difficulty,
    });

    return NextResponse.json(sessionData, { status: 201 });
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

