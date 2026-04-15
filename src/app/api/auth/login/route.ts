import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
  validateAdminCredentials,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, securityCode } = (await request.json()) as {
      email?: string;
      password?: string;
      securityCode?: string;
    };

    if (
      !email ||
      !password ||
      !securityCode ||
      !validateAdminCredentials(email, password, securityCode)
    ) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken(email.toLowerCase().trim()),
      sessionCookieOptions,
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 400 },
    );
  }
}
