import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenIcon } from "@/components/icons";
import { BookRating } from "@/components/book-rating";
import { sanitizeFileName } from "@/lib/books";
import { listLibraryBooks } from "@/lib/library";

type BookDetailPageProps = {
  params: Promise<{ fileName: string }>;
};

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { fileName } = await params;
  const safeName = sanitizeFileName(decodeURIComponent(fileName));
  const books = await listLibraryBooks();
  const book = books.find((item) => item.fileName === safeName);

  if (!book) {
    notFound();
  }

  const encodedName = encodeURIComponent(book.fileName);
  const canInlineView = book.extension === "PDF" || book.extension === "TXT";

  return (
    <div className="w-full min-h-screen overflow-auto" style={{ background: "#F7F5F0" }}>
      <nav
        className="w-full sticky top-0 z-50 anim-fade-in"
        style={{
          background: "rgba(247,245,240,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2DDD4",
        }}
      >
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#2C3539" }}
            >
              <BookOpenIcon className="h-4 w-4" style={{ color: "#F7F5F0" }} />
            </div>
            <span
              className="font-display text-lg sm:text-2xl font-bold tracking-tight hidden sm:inline"
              style={{ color: "#2C3539" }}
            >
              Nova
            </span>
          </div>

          <Link className="nav-link font-body text-xs sm:text-sm" href="/" style={{ color: "#6B635A" }}>
            Volver
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-6xl mx-auto px-6 pt-12 pb-20">
        <section
          className="rounded-2xl overflow-hidden anim-fade-up"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(44,53,57,0.06)" }}
        >
          <div className="p-6 sm:p-8 md:p-10">
            <p className="font-body text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "#8B7D6B" }}>
              Detalle del libro
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: "#2C3539" }}>
              {book.title}
            </h1>
            <p className="font-body text-sm mb-4" style={{ color: "#8B7D6B" }}>
              {book.author} · {book.year} · {book.extension} · Actualizado {formatDate(book.updatedAt)}
            </p>

            <BookRating fileName={book.fileName} initialAvg={book.ratingAvg} initialCount={book.ratingCount} />

            <p className="font-body text-sm leading-relaxed mt-5" style={{ color: "#6B635A" }}>
              {book.description}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                className="font-body text-sm px-6 py-2.5 rounded-full transition-all text-center"
                style={{ background: "#2C3539", color: "#F7F5F0" }}
                href={`/api/books/${encodedName}?download=1`}
              >
                Descargar libro
              </a>
              <a
                className="font-body text-sm px-6 py-2.5 rounded-full border transition-all text-center"
                style={{ background: "transparent", color: "#6B635A", borderColor: "#DDD7CC" }}
                href={`/api/books/${encodedName}`}
              >
                Abrir en pestaña
              </a>
            </div>
          </div>

          {canInlineView ? (
            <div className="w-full border-t" style={{ borderColor: "#E2DDD4" }}>
              <iframe
                title={`Visor de ${book.title}`}
                src={`/api/books/${encodedName}`}
                className="w-full"
                style={{ minHeight: "72vh", border: 0, background: "#F7F5F0" }}
              />
            </div>
          ) : (
            <div className="p-6 sm:p-8 border-t" style={{ borderColor: "#E2DDD4" }}>
              <p className="font-body text-sm" style={{ color: "#6B635A" }}>
                Vista previa no disponible para {book.extension}. Usa la descarga para abrirlo localmente.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
