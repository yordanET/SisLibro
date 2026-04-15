import { NextResponse } from "next/server";
import { addRating } from "@/lib/catalog";
import { sanitizeFileName } from "@/lib/books";

type RouteContext = {
  params: Promise<{ fileName: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { fileName } = await context.params;
  const safeName = sanitizeFileName(decodeURIComponent(fileName));

  try {
    const body = (await request.json()) as { stars?: number };
    const stars = Number(body.stars);
    if (!Number.isFinite(stars)) {
      return NextResponse.json({ error: "Calificación inválida." }, { status: 400 });
    }

    const result = await addRating({ fileName: safeName, stars });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la calificación." },
      { status: 500 },
    );
  }
}

