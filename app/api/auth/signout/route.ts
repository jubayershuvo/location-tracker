import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Signed out successfully" },
    { status: 200 }
  );

  response.cookies.set({
    ...authCookieOptions(),
  });

  return response;
}
