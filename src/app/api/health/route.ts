import { NextResponse } from "next/server";

export async function GET() {
  // Simple health check endpoint
  // Also used by keepalive cron to prevent Supabase free tier from pausing
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      app: "HMIF Proker Manager",
    },
    { status: 200 }
  );
}
