import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET() {
  try {
    await getDb().restaurantSettings.findUnique({
      where: { id: "singleton" },
      select: { id: true },
    });
    return NextResponse.json({ status: "ok" }, { headers: responseHeaders });
  } catch {
    return NextResponse.json(
      { status: "unavailable" },
      { status: 503, headers: responseHeaders },
    );
  }
}
