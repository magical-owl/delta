import { NextResponse } from "next/server";
import { getSystemHealth } from "@/server/dal/health.dal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getSystemHealth();
    return NextResponse.json(
      {
        success: true,
        data: health,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_HEALTH_ERROR",
          message: error instanceof Error ? error.message : "Health check failed",
        },
      },
      { status: 500 }
    );
  }
}
