"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { BookOpenIcon } from "@/components/icons";
import { StarRatingDisplay } from "@/components/star-rating";
import type { LibraryBook } from "@/lib/library";

type AdminPanelProps = {
  initialBooks: LibraryBook[];
};

function coverColor(seed: string): string {
  const palette = ["#C4A77D", "#7D9B8F", "#8B7DA0", "#A07D6B", "#6B8B8D", "#8D7D6B"];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000000;
  }
  return palette[hash % palette.length] ?? "#8D7D6B";
}

export function AdminPanel({ initialBooks }: AdminPanelProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const totalBooks = useMemo(() => initialBooks.length, [initialBooks]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedFile) {
      setMessage("Selecciona un archivo antes de subir.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (coverFile) {
      formData.append("cover", coverFile);
    }
    formData.append("title", title);
    formData.append("authors", authors);
    formData.append("year", year);
    formData.append("description", description);

    setBusy(true);
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "No se pudo subir el archivo.");
        setBusy(false);
        return;
      }
      setMessage("Libro subido correctamente.");
      setSelectedFile(null);
      setCoverFile(null);
      setTitle("");
      setAuthors("");
      setYear(String(new Date().getFullYear()));
      setDescription("");
      router.refresh();
    } catch {
      setMessage("Error de red al subir el archivo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-barra-logic");
    router.refresh();
  }

  async function handleDeleteBook(fileName: string) {
    const ok = window.confirm("¿Seguro que deseas borrar este libro? Esta acción no se puede deshacer.");
    if (!ok) {
      return;
    }

    setMessage("");
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/books/${encodeURIComponent(fileName)}`,
        { method: "DELETE" },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "No se pudo borrar el libro.");
        return;
      }
      setMessage("Libro borrado correctamente.");
      router.refresh();
    } catch {
      setMessage("Error de red al borrar el libro.");
    } finally {
      setBusy(false);
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

          <div className="flex items-center gap-3 font-body text-xs sm:text-sm">
            <Link className="nav-link" href="/" style={{ color: "#6B635A" }}>
              Biblioteca
            </Link>
            <button
              type="button"
              className="nav-link"
              onClick={handleLogout}
              style={{ color: "#6B635A" }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <header className="w-full max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="anim-fade-up">
          <p
            className="font-body text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "#8B7D6B" }}
          >
            Administración
          </p>
          <h1
            className="font-display text-4xl md:text-5xl font-bold leading-tight mb-2"
            style={{ color: "#2C3539" }}
          >
            Gestión de Libros
          </h1>
          <p className="font-body text-sm" style={{ color: "#8B7D6B" }}>
            {totalBooks} libros en el repositorio
          </p>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-6 pb-20">
        <section
          className="rounded-2xl p-5 sm:p-7 anim-fade-up"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 16px rgba(44,53,57,0.06)" }}
        >
          <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: "#2C3539" }}>
            Subir un libro
          </h2>
          <p className="font-body text-sm mb-5" style={{ color: "#8B7D6B" }}>
            Sube el archivo y completa título, autor(es), año y descripción.
          </p>

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="font-body text-sm" style={{ color: "#6B635A" }}>
              Archivo
              <input
                className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
                style={{ background: "#EFECE5", borderColor: "#DDD7CC", color: "#2C3539" }}
                type="file"
                accept=".pdf,.epub,.txt,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  if (file && !title.trim()) {
                    const derived = file.name.replace(/\.[^/.]+$/, "").trim();
                    if (derived) {
                      setTitle(derived);
                    }
                  }
                }}
              />
            </label>

            <label className="font-body text-sm" style={{ color: "#6B635A" }}>
              Portada (opcional)
              <input
                className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
                style={{ background: "#EFECE5", borderColor: "#DDD7CC", color: "#2C3539" }}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <label className="font-body text-sm" style={{ color: "#6B635A" }}>
              Título
              <input
                className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
                style={{ background: "#EFECE5", borderColor: "#DDD7CC", color: "#2C3539" }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del libro"
                required
              />
            </label>

            <label className="font-body text-sm" style={{ color: "#6B635A" }}>
              Autor(es)
              <input
                className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
                style={{ background: "#EFECE5", borderColor: "#DDD7CC", color: "#2C3539" }}
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Autor 1, Autor 2"
                required
              />
            </label>

            <label className="font-body text-sm" style={{ color: "#6B635A" }}>
              Año
              <input
                className="mt-2 w-full font-body text-sm px-4 py-2 rounded-full border outline-none focus:ring-2"
                style={{ background: "#EFECE5", borderColor: "#DDD7CC", color: "#2C3539" }}
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                required
              />
            </label>

            <label className="font-body text-sm md:col-span-2" style={{ color: "#6B635A" }}>
              Descripción
              <textarea
                className="mt-2 w-full font-body text-sm px-4 py-3 rounded-2xl border outline-none focus:ring-2 resize-none"
                style={{ background: "#EFECE5", borderColor: "#DDD7CC", color: "#2C3539" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del libro..."
                rows={4}
                required
              />
            </label>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <button
                className="font-body text-sm px-6 py-2.5 rounded-full transition-all"
                style={{ background: "#2C3539", color: "#F7F5F0" }}
                type="submit"
                disabled={busy}
              >
                {busy ? "Subiendo..." : "Subir libro"}
              </button>

              {message ? (
                <p className="font-body text-sm" style={{ color: "#8B7D6B" }}>
                  {message}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-5" style={{ color: "#2C3539" }}>
            Libros publicados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {initialBooks.map((b, i) => {
              const encodedName = encodeURIComponent(b.fileName);
              const color = coverColor(b.fileName);
              const coverUrl = b.coverImageFileName
                ? `/api/covers/${encodeURIComponent(b.fileName)}`
                : null;
              return (
                <div
                  key={b.id}
                  className="book-card rounded-2xl overflow-hidden anim-fade-up"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 2px 16px rgba(44,53,57,0.06)",
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <div className="relative overflow-hidden" style={{ height: 190, background: color }}>
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={`Portada de ${b.title}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : null}
                    <div className="book-cover absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <span className="font-display text-xl font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
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
                    <h3 className="font-display text-xl font-semibold mb-1" style={{ color: "#2C3539" }}>
                      {b.title}
                    </h3>
                    <p className="font-body text-sm mb-3" style={{ color: "#8B7D6B" }}>
                      {b.author} · {b.year}
                    </p>
                    <div className="flex items-center justify-between">
                      <StarRatingDisplay rating={b.ratingAvg} />
                      <span className="font-body text-xs" style={{ color: "#A09888" }}>
                        {b.ratingCount > 0 ? b.ratingAvg.toFixed(1) : "—"}
                      </span>
                    </div>
                    <p className="font-body text-sm mt-3" style={{ color: "#6B635A" }}>
                      {b.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        className="font-body text-xs underline"
                        style={{ color: "#6B635A" }}
                        href={`/libro/${encodedName}`}
                      >
                        Abrir
                      </Link>
                      <a
                        className="font-body text-xs underline"
                        style={{ color: "#6B635A" }}
                        href={`/api/books/${encodedName}?download=1`}
                      >
                        Descargar
                      </a>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="font-body text-xs underline"
                        style={{ color: "#9C2B2B" }}
                        onClick={() => handleDeleteBook(b.fileName)}
                        disabled={busy}
                      >
                        Borrar
                      </button>
                      <span className="font-body text-xs" style={{ color: "#A09888" }}>
                        {b.fileName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
