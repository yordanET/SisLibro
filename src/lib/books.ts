import { promises as fs } from "fs";
import path from "path";

export const BOOKS_DIR = path.join(process.cwd(), "libros");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".epub", ".txt", ".doc", ".docx"]);

export type BookSummary = {
  id: string;
  fileName: string;
  title: string;
  extension: string;
  size: number;
  updatedAt: string;
};

export async function ensureBooksDir(): Promise<void> {
  await fs.mkdir(BOOKS_DIR, { recursive: true });
}

export function sanitizeFileName(name: string): string {
  const baseName = path.basename(name);
  return baseName.replace(/[^\w.\- ()]/g, "_").trim();
}

export function isAllowedBook(fileName: string): boolean {
  const extension = path.extname(fileName).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension);
}

function fileNameToTitle(fileName: string): string {
  const extension = path.extname(fileName);
  const withoutExtension = fileName.slice(0, -extension.length);
  return withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function listBooks(): Promise<BookSummary[]> {
  await ensureBooksDir();
  const entries = await fs.readdir(BOOKS_DIR, { withFileTypes: true });

  const books = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const safeFileName = sanitizeFileName(entry.name);
        if (!isAllowedBook(safeFileName)) {
          return null;
        }

        const fullPath = path.join(BOOKS_DIR, safeFileName);
        const stat = await fs.stat(fullPath);

        return {
          id: safeFileName,
          fileName: safeFileName,
          title: fileNameToTitle(safeFileName),
          extension: path.extname(safeFileName).replace(".", "").toUpperCase(),
          size: stat.size,
          updatedAt: stat.mtime.toISOString(),
        } satisfies BookSummary;
      }),
  );

  return books
    .filter((book): book is BookSummary => Boolean(book))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export async function getBookPath(fileName: string): Promise<string | null> {
  const safeFileName = sanitizeFileName(fileName);
  if (!safeFileName || !isAllowedBook(safeFileName)) {
    return null;
  }

  await ensureBooksDir();
  const fullPath = path.join(BOOKS_DIR, safeFileName);

  try {
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) {
      return null;
    }
    return fullPath;
  } catch {
    return null;
  }
}
