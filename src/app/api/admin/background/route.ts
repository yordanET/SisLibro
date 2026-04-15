import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await request.arrayBuffer();
  return NextResponse.json(
    { error: "La opción de fondo fue deshabilitada." },
    { status: 404 },
  );
}
