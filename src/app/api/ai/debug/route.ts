import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    provider: "Pollinations AI",
    note: "Free, no API key needed, works globally",
  });
}
