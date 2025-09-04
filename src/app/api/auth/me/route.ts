import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

// Força esta route a ser dinâmica e a não usar qualquer cache (edge/CDN ou browser)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json(
  { user: user ?? null },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' } }
    );
  } catch (error) {
    console.error('Error in auth me:', error);
    return NextResponse.json(
      { user: null },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' } }
    );
  }
}
