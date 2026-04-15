import { promises as fs } from "fs";
import path from "path";
import { BOOKS_DIR, ensureBooksDir, sanitizeFileName } from "@/lib/books";

export type CatalogEntry = {
  fileName: string;
  title: string;
  authors: string[];
  year: number;
  description: string;
  coverImageFileName?: string;
  ratingCount: number;
  ratingSum: number;
  createdAt: string;
  updatedAt: string;
};

type CatalogFile = {
  version: 1;
  entries: Record<string, CatalogEntry>;
};

const CATALOG_PATH = path.join(BOOKS_DIR, "catalog.json");

function nowIso(): string {
  return new Date().toISOString();
}

function titleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAuthors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

async function readCatalogFile(): Promise<CatalogFile> {
  await ensureBooksDir();
  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf8");
    const parsed = JSON.parse(raw) as CatalogFile;
    if (!parsed || parsed.version !== 1 || typeof parsed.entries !== "object") {
      return { version: 1, entries: {} };
    }
    const normalizedEntries: Record<string, CatalogEntry> = {};
    for (const [key, entry] of Object.entries(parsed.entries ?? {})) {
      const safeKey = sanitizeFileName(key);
      const anyEntry = entry as unknown as Record<string, unknown>;
      const fileName = sanitizeFileName(String(anyEntry.fileName ?? safeKey));
      const title = String(anyEntry.title ?? "").trim() || titleFromFileName(fileName);
      const authorsFromArray = normalizeAuthors(anyEntry.authors);
      const authorsFromLegacy = normalizeAuthors(anyEntry.author);
      const authors =
        authorsFromArray.length > 0 ? authorsFromArray : authorsFromLegacy;
      const coverImageFileNameRaw = String(anyEntry.coverImageFileName ?? "").trim();
      const coverImageFileName = coverImageFileNameRaw ? coverImageFileNameRaw : undefined;

      const year = Number(anyEntry.year);
      const ratingCount = Number(anyEntry.ratingCount);
      const ratingSum = Number(anyEntry.ratingSum);

      normalizedEntries[fileName] = {
        fileName,
        title,
        authors,
        year: Number.isFinite(year) ? year : new Date().getFullYear(),
        description: String(anyEntry.description ?? "").trim() || "Sin descripción.",
        coverImageFileName,
        ratingCount: Number.isFinite(ratingCount) ? ratingCount : 0,
        ratingSum: Number.isFinite(ratingSum) ? ratingSum : 0,
        createdAt: String(anyEntry.createdAt ?? nowIso()),
        updatedAt: String(anyEntry.updatedAt ?? nowIso()),
      };
    }

    return { version: 1, entries: normalizedEntries };
  } catch {
    return { version: 1, entries: {} };
  }
}

async function writeCatalogFile(data: CatalogFile): Promise<void> {
  await ensureBooksDir();
  const tmpPath = `${CATALOG_PATH}.tmp-${Date.now()}`;
  const contents = JSON.stringify(data, null, 2);
  await fs.writeFile(tmpPath, contents, "utf8");
  try {
    await fs.rename(tmpPath, CATALOG_PATH);
  } catch {
    await fs.writeFile(CATALOG_PATH, contents, "utf8");
    try {
      await fs.unlink(tmpPath);
    } catch {
    }
  }
}

export async function getCatalogEntry(
  fileName: string,
): Promise<CatalogEntry | null> {
  const safe = sanitizeFileName(fileName);
  const catalog = await readCatalogFile();
  return catalog.entries[safe] ?? null;
}

export async function upsertCatalogEntry(input: {
  fileName: string;
  title: string;
  authors: string[];
  year: number;
  description: string;
  coverImageFileName?: string;
}): Promise<CatalogEntry> {
  const safe = sanitizeFileName(input.fileName);
  const catalog = await readCatalogFile();
  const existing = catalog.entries[safe];
  const createdAt = existing?.createdAt ?? nowIso();
  const ratingCount = existing?.ratingCount ?? 0;
  const ratingSum = existing?.ratingSum ?? 0;

  const entry: CatalogEntry = {
    fileName: safe,
    title: input.title.trim() || titleFromFileName(safe),
    authors: input.authors.map((a) => a.trim()).filter((a) => a.length > 0),
    year: input.year,
    description: input.description.trim(),
    coverImageFileName: input.coverImageFileName ?? existing?.coverImageFileName,
    ratingCount,
    ratingSum,
    createdAt,
    updatedAt: nowIso(),
  };

  catalog.entries[safe] = entry;
  await writeCatalogFile(catalog);
  return entry;
}

export async function addRating(input: {
  fileName: string;
  stars: number;
}): Promise<{ ratingCount: number; ratingAvg: number }> {
  const safe = sanitizeFileName(input.fileName);
  const stars = Math.max(1, Math.min(5, Math.round(input.stars)));

  const catalog = await readCatalogFile();
  const existing = catalog.entries[safe];
  if (!existing) {
    const entry: CatalogEntry = {
      fileName: safe,
      title: titleFromFileName(safe),
      authors: [],
      year: new Date().getFullYear(),
      description: "Sin descripción.",
      coverImageFileName: undefined,
      ratingCount: 1,
      ratingSum: stars,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    catalog.entries[safe] = entry;
    await writeCatalogFile(catalog);
    return { ratingCount: entry.ratingCount, ratingAvg: entry.ratingSum / entry.ratingCount };
  }

  existing.ratingCount += 1;
  existing.ratingSum += stars;
  existing.updatedAt = nowIso();
  catalog.entries[safe] = existing;
  await writeCatalogFile(catalog);

  return {
    ratingCount: existing.ratingCount,
    ratingAvg: existing.ratingSum / existing.ratingCount,
  };
}

export async function deleteCatalogEntry(fileName: string): Promise<void> {
  const safe = sanitizeFileName(fileName);
  const catalog = await readCatalogFile();
  if (catalog.entries[safe]) {
    delete catalog.entries[safe];
    await writeCatalogFile(catalog);
  }
}
