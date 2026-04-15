import { promises as fs } from "fs";
import path from "path";
import { sanitizeFileName } from "@/lib/books";
import { getCatalogEntry } from "@/lib/catalog";
import { COVERS_DIR, imageContentType } from "@/lib/media";

type RouteContext = {
  params: Promise<{ fileName: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: RouteContext) {
  const { fileName } = await context.params;
  const safeName = sanitizeFileName(decodeURIComponent(fileName));
  const entry = await getCatalogEntry(safeName);
  const cover = entry?.coverImageFileName;
  if (!cover) {
    return new Response("Sin portada.", { status: 404 });
  }

  const fullPath = path.join(COVERS_DIR, cover);
  try {
    const buffer = await fs.readFile(fullPath);
    return new Response(buffer, {
      headers: {
        "Content-Type": imageContentType(cover),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("No se pudo cargar la portada.", { status: 500 });
  }
}

