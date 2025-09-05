import { NextResponse } from "next/server";
import { logout } from "@/lib/session";

export async function POST() {
  try {
    await logout();
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' } });
  } catch (error) {
    console.error('Error in auth logout:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
