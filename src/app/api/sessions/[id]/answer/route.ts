import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitAnswerInputSchema } from "@/lib/validations/session";
import { submitSessionAnswer, SessionServiceError } from "@/services/session.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Bạn cần đăng nhập để nộp câu trả lời." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = submitAnswerInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Dữ liệu nộp câu trả lời không hợp lệ.",
            details: validation.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const feedback = await submitSessionAnswer({
      sessionId,
      userId: user.id,
      questionId: validation.data.questionId,
      answer: validation.data.answer,
      requestId: validation.data.requestId,
    });

    return NextResponse.json(feedback, { status: 200 });
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

