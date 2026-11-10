import { NextRequest, NextResponse } from "next/server";
import { inquirySchema, formatZodError } from "@/lib/validation/inquiry.schema";
import { inquiryService } from "@/server/services/inquiry.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await inquiryService.getSummary();
  return NextResponse.json({
    success: true,
    data: summary,
  });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = inquirySchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Submitted data failed schema validation",
            details: formatZodError(parseResult.error),
          },
        },
        { status: 400 }
      );
    }

    const record = await inquiryService.createInquiry(parseResult.data);
    return NextResponse.json(
      {
        success: true,
        data: record,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON_PAYLOAD",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 }
    );
  }
}
