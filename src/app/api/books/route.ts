import { NextResponse } from "next/server";
import { listLibraryBooks } from "@/lib/library";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const books = await listLibraryBooks();
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener la lista de libros." },
      { status: 500 },
    );
  }
}
