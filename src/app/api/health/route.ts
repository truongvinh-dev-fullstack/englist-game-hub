import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptimeSeconds = process.uptime();
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const memoryUsage = process.memoryUsage();

  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(uptimeSeconds),
      service: "english-game-hub",
      version: "0.1.0",
      environment: process.env.NODE_ENV || "development",
      checks: {
        supabaseClientConfigured: hasSupabaseUrl && hasSupabaseAnonKey,
        supabaseServiceRoleConfigured: hasServiceRoleKey,
        memoryHeapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

