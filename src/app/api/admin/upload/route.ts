import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import {
  BOOKS_DIR,
  ensureBooksDir,
  isAllowedBook,
  sanitizeFileName,
} from "@/lib/books";
import { upsertCatalogEntry } from "@/lib/catalog";
import {
  COVERS_DIR,
  ensureMediaDirs,
  isAllowedImage,
  sanitizeImageFileName,
} from "@/lib/media";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const uploaded = formData.get("file");
    const cover = formData.get("cover");
    const title = String(formData.get("title") ?? "");
    const authorsRaw = String(formData.get("authors") ?? "");
    const yearRaw = String(formData.get("year") ?? "");
    const description = String(formData.get("description") ?? "");

    if (!(uploaded instanceof File)) {
      return NextResponse.json(
        { error: "Debes seleccionar un archivo." },
        { status: 400 },
      );
    }

    const safeFileName = sanitizeFileName(uploaded.name);
    if (!safeFileName || !isAllowedBook(safeFileName)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa PDF, EPUB, TXT, DOC o DOCX." },
        { status: 400 },
      );
    }

    const year = Number.parseInt(yearRaw, 10);
    const authors = authorsRaw
      .split(/[;,]/g)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (!title.trim() || authors.length === 0 || !description.trim() || !Number.isFinite(year)) {
      return NextResponse.json(
        { error: "Completa título, autor(es), año y descripción." },
        { status: 400 },
      );
    }

    if (uploaded.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 25MB." },
        { status: 400 },
      );
    }

    await ensureBooksDir();

    const bytes = Buffer.from(await uploaded.arrayBuffer());
    const destination = path.join(BOOKS_DIR, safeFileName);
    await fs.writeFile(destination, bytes);

    let coverImageFileName: string | undefined;
    if (cover instanceof File && cover.size > 0) {
      const safeCoverName = sanitizeImageFileName(cover.name);
      if (!safeCoverName || !isAllowedImage(safeCoverName)) {
        return NextResponse.json(
          { error: "Portada inválida. Usa PNG, JPG, JPEG, WEBP o GIF." },
          { status: 400 },
        );
      }

      await ensureMediaDirs();
      const coverExt = path.extname(safeCoverName).toLowerCase();
      const base = safeFileName.replace(/\.[^/.]+$/, "");
      coverImageFileName = sanitizeImageFileName(`${base}${coverExt}`);
      const coverBytes = Buffer.from(await cover.arrayBuffer());
      await fs.writeFile(path.join(COVERS_DIR, coverImageFileName), coverBytes);
    }

    await upsertCatalogEntry({
      fileName: safeFileName,
      title,
      authors,
      year,
      description,
      coverImageFileName,
    });

    return NextResponse.json({ ok: true, fileName: safeFileName });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el libro." },
      { status: 500 },
    );
  }
}
