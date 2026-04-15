import { promises as fs } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { getBookPath, sanitizeFileName } from "@/lib/books";

type RouteContext = {
  params: Promise<{ fileName: string }>;
};

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
  ".txt": "text/plain; charset=utf-8",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  const { fileName } = await context.params;
  const decodedName = decodeURIComponent(fileName);
  const safeFileName = sanitizeFileName(decodedName);
  const fullPath = await getBookPath(safeFileName);

  if (!fullPath) {
    return new Response("Libro no encontrado.", { status: 404 });
  }

  const extension = path.extname(safeFileName).toLowerCase();
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";
  const download = request.nextUrl.searchParams.get("download") === "1";
  const dispositionType = download ? "attachment" : "inline";

  try {
    const fileBuffer = await fs.readFile(fullPath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${dispositionType}; filename="${safeFileName}"`,
      },
    });
  } catch {
    return new Response("No fue posible abrir el libro.", { status: 500 });
  }
}
