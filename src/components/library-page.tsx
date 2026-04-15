"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { BookOpenIcon, SearchIcon, XIcon } from "@/components/icons";
import { StarRatingDisplay, StarRatingInput } from "@/components/star-rating";
import type { LibraryBook } from "@/lib/library";

type LibraryPageProps = {
  initialBooks: LibraryBook[];
};

function formatSize(size: number): string {
  const kb = size / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(2)} MB`;
}

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function LibraryPage({ initialBooks }: LibraryPageProps) {
  const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<LibraryBook | null>(null);
  const [ratingBusy, setRatingBusy] = useState(false);

  const filteredBooks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return books;
    }
    return books.filter((book) =>
      `${book.title} ${book.fileName} ${book.extension} ${book.author} ${book.year}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [books, query]);

  function coverColor(seed: string): string {
    const palette = ["#C4A77D", "#7D9B8F", "#8B7DA0", "#A07D6B", "#6B8B8D", "#8D7D6B"];
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 1000000;
    }
    return palette[hash % palette.length] ?? "#8D7D6B";
  }

  async function rateBook(fileName: string, stars: number) {
    setRatingBusy(true);
    try {
      const response = await fetch(
        `/api/books/${encodeURIComponent(fileName)}/rating`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stars }),
        },
      );
      const result = (await response.json()) as {
        ok?: boolean;
        ratingAvg?: number;
        ratingCount?: number;
      };

      if (response.ok && result.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b.fileName === fileName
              ? {
                  ...b,
                  ratingAvg: result.ratingAvg ?? b.ratingAvg,
                  ratingCount: result.ratingCount ?? b.ratingCount,
                }
              : b,
          ),
        );
        setActive((prev) =>
          prev && prev.fileName === fileName
            ? {
                ...prev,
                ratingAvg: result.ratingAvg ?? prev.ratingAvg,
                ratingCount: result.ratingCount ?? prev.ratingCount,
              }
            : prev,
        );
      }
    } finally {
      setRatingBusy(false);
    }
  }

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

          <div className="hidden lg:flex items-center gap-6 sm:gap-8 font-body text-xs sm:text-sm">
            <a href="#" className="nav-link" style={{ color: "#6B635A" }}>
              Inicio
            </a>
            <a href="#" className="nav-link" style={{ color: "#6B635A" }}>
              Biblioteca
            </a>
          </div>

          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-auto">
            <input
              type="text"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-body text-xs sm:text-sm pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-full border outline-none focus:ring-2 w-full sm:w-44 focus:sm:w-56 transition-all"
              style={{
                background: "#EFECE5",
                borderColor: "#DDD7CC",
                color: "#2C3539",
              }}
            />
            <SearchIcon
              className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 flex-shrink-0 h-3.5 w-3.5"
              style={{ color: "#8B7D6B" }}
            />
          </div>
        </div>
      </nav>

      <header className="w-full max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="anim-fade-up">
          <p
            className="font-body text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "#8B7D6B" }}
          >
            Sistema de biblioteca
          </p>
          <h1
            className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4"
            style={{ color: "#2C3539" }}
          >
            Descubre tu próxima lectura
          </h1>
          <p
            className="font-body text-lg max-w-lg"
            style={{ color: "#8B7D6B" }}
          >
            Colecciones curadas para el lector exigente
          </p>
        </div>
      </header>

      <section className="w-full max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-baseline justify-between mb-8 anim-fade-up">
          <p className="font-body text-sm" style={{ color: "#6B635A" }}>
            {filteredBooks.length} resultados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredBooks.map((b, i) => {
            const color = coverColor(b.fileName);
            const encodedName = encodeURIComponent(b.fileName);
            const coverUrl = b.coverImageFileName
              ? `/api/covers/${encodeURIComponent(b.fileName)}`
              : null;
            const ratingLabel =
              b.ratingCount > 0 ? b.ratingAvg.toFixed(1) : "Sin calificación";

            return (
              <div
                key={b.id}
                className="book-card rounded-2xl overflow-hidden cursor-pointer anim-fade-up"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 2px 16px rgba(44,53,57,0.06)",
                  animationDelay: `${i * 0.08}s`,
                }}
                onClick={() => setActive(b)}
                role="button"
                tabIndex={0}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 220, background: color }}
                >
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={`Portada de ${b.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      priority={i < 3}
                    />
                  ) : null}
                  <div className="book-cover absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <BookOpenIcon
                        className="h-6 w-6"
                        style={{ color: "rgba(255,255,255,0.9)" }}
                      />
                    </div>
                    <span
                      className="font-display text-xl font-semibold"
                      style={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      {b.title}
                    </span>
                  </div>
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-body"
                    style={{
                      background: "rgba(255,255,255,0.22)",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {b.extension}
                  </div>
                </div>
                <div className="p-5">
                  <h3
                    className="font-display text-xl font-semibold mb-1"
                    style={{ color: "#2C3539" }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="font-body text-sm mb-3"
                    style={{ color: "#8B7D6B" }}
                  >
                    {b.author} · {b.year}
                  </p>
                  <div className="flex items-center justify-between">
                    <StarRatingDisplay rating={b.ratingAvg} />
                    <span className="font-body text-xs" style={{ color: "#A09888" }}>
                      {ratingLabel}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={`/libro/${encodedName}`}
                      className="font-body text-xs underline"
                      style={{ color: "#6B635A" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir
                    </Link>
                    <a
                      href={`/api/books/${encodedName}?download=1`}
                      className="font-body text-xs underline"
                      style={{ color: "#6B635A" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Descargar
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBooks.length === 0 ? (
          <p className="font-body text-center py-20" style={{ color: "#8B7D6B" }}>
            No hay libros que coincidan con tu búsqueda.
          </p>
        ) : null}
      </section>

      <footer className="w-full border-t py-8 px-6" style={{ borderColor: "#E2DDD4" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs" style={{ color: "#8B7D6B" }}>
            © {new Date().getFullYear()} SisLibro.
          </p>
          <p className="font-body text-xs" style={{ color: "#8B7D6B" }}>
            Biblioteca digital universitaria.
          </p>
        </div>
      </footer>

      {active ? (
        <div
          className="fixed inset-0 z-[100]"
          onClick={() => setActive(null)}
        >
          <div
            className="modal-overlay absolute inset-0"
            style={{
              background: "rgba(44,53,57,0.45)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="modal-content relative w-full max-w-xl sm:max-w-2xl max-h-[90%] overflow-auto rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10"
              style={{ background: "#F7F5F0" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#EFECE5", color: "#6B635A" }}
              >
                <XIcon className="h-[18px] w-[18px]" />
              </button>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div
                  className="flex-shrink-0 w-full sm:w-40 md:w-48 h-48 sm:h-56 md:h-64 rounded-lg sm:rounded-xl flex flex-col items-center justify-center"
                  style={{ background: coverColor(active.fileName), position: "relative", overflow: "hidden" }}
                >
                  {active.coverImageFileName ? (
                    <Image
                      src={`/api/covers/${encodeURIComponent(active.fileName)}`}
                      alt={`Portada de ${active.title}`}
                      fill
                      sizes="(max-width: 1024px) 60vw, 240px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                  <BookOpenIcon
                    className="h-8 w-8 mb-2"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  />
                  <span
                    className="font-display text-base sm:text-lg font-semibold text-center px-3 sm:px-4"
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    {active.title}
                  </span>
                </div>
                <div className="flex-1">
                  <span
                    className="font-body text-xs tracking-[0.2em] uppercase"
                    style={{ color: "#8B7D6B" }}
                  >
                    {active.extension}
                  </span>
                  <h2
                    className="font-display text-2xl sm:text-3xl font-bold mt-1 mb-1"
                    style={{ color: "#2C3539" }}
                  >
                    {active.title}
                  </h2>
                  <p className="font-body text-sm mb-3 sm:mb-4" style={{ color: "#8B7D6B" }}>
                    {active.author} · {active.year}
                  </p>

                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <StarRatingDisplay rating={active.ratingAvg} />
                    <span className="font-body text-sm font-medium" style={{ color: "#2C3539" }}>
                      {active.ratingCount > 0 ? active.ratingAvg.toFixed(1) : "—"}
                    </span>
                    <span className="font-body text-xs" style={{ color: "#A09888" }}>
                      · {active.ratingCount} votos
                    </span>
                  </div>

                  <p className="font-body text-sm leading-relaxed mb-5 sm:mb-6" style={{ color: "#6B635A" }}>
                    {active.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
                    <Link
                      className="font-body text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all"
                      style={{ background: "#2C3539", color: "#F7F5F0" }}
                      href={`/libro/${encodeURIComponent(active.fileName)}`}
                    >
                      Abrir
                    </Link>
                    <a
                      className="font-body text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border transition-all"
                      style={{
                        background: "transparent",
                        color: "#6B635A",
                        borderColor: "#DDD7CC",
                      }}
                      href={`/api/books/${encodeURIComponent(active.fileName)}?download=1`}
                    >
                      Descargar
                    </a>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-body text-xs" style={{ color: "#8B7D6B" }}>
                      Calificar:
                    </span>
                    <StarRatingInput
                      onRate={(stars) => rateBook(active.fileName, stars)}
                      disabled={ratingBusy}
                    />
                  </div>

                  <p className="mt-5 font-body text-xs" style={{ color: "#A09888" }}>
                    Archivo: {active.fileName} · {formatSize(active.size)} ·{" "}
                    {formatDate(active.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
