import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getBookPath, sanitizeFileName } from "@/lib/books";
import { deleteCatalogEntry, getCatalogEntry } from "@/lib/catalog";
import { COVERS_DIR, ensureMediaDirs } from "@/lib/media";

type RouteContext = {
  params: Promise<{ fileName: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { fileName } = await context.params;
  const decodedName = decodeURIComponent(fileName);
  const safeFileName = sanitizeFileName(decodedName);
  const fullPath = await getBookPath(safeFileName);

  if (!fullPath) {
    return NextResponse.json({ error: "Libro no encontrado." }, { status: 404 });
  }

  try {
    await fs.unlink(fullPath);
  } catch {
    return NextResponse.json(
      { error: "No se pudo borrar el archivo." },
      { status: 500 },
    );
  }

  try {
    const entry = await getCatalogEntry(safeFileName);
    if (entry?.coverImageFileName) {
      await ensureMediaDirs();
      const coverPath = path.join(COVERS_DIR, entry.coverImageFileName);
      try {
        await fs.unlink(coverPath);
      } catch {
      }
    }
    await deleteCatalogEntry(safeFileName);
  } catch {
  }

  return NextResponse.json({ ok: true });
}
