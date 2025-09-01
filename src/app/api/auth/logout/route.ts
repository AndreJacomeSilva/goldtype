import { NextResponse } from "next/server";
import { logout } from "@/lib/session";

export async function POST() {
  try {
    await logout();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in auth logout:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
