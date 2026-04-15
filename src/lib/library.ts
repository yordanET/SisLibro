import { listBooks, type BookSummary } from "@/lib/books";
import { getCatalogEntry } from "@/lib/catalog";

export type LibraryBook = BookSummary & {
  author: string;
  year: number;
  description: string;
  coverImageFileName?: string;
  ratingAvg: number;
  ratingCount: number;
};

export async function listLibraryBooks(): Promise<LibraryBook[]> {
  const books = await listBooks();
  const enriched = await Promise.all(
    books.map(async (book) => {
      const catalog = await getCatalogEntry(book.fileName);
      const ratingAvg =
        catalog && catalog.ratingCount > 0
          ? catalog.ratingSum / catalog.ratingCount
          : 0;

      return {
        ...book,
        title: catalog?.title ?? book.title,
        author:
          catalog?.authors && catalog.authors.length > 0
            ? catalog.authors.join(", ")
            : "Autor no especificado",
        year: catalog?.year ?? new Date(book.updatedAt).getFullYear(),
        description: catalog?.description ?? "Sin descripción.",
        coverImageFileName: catalog?.coverImageFileName,
        ratingAvg,
        ratingCount: catalog?.ratingCount ?? 0,
      } satisfies LibraryBook;
    }),
  );

  return enriched;
}
