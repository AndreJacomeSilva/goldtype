import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user ?? null });
  } catch (error) {
    console.error('Error in auth me:', error);
    return NextResponse.json({ user: null });
  }
}
