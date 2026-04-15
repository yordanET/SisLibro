import { LibraryPage } from "@/components/library-page";
import { listLibraryBooks } from "@/lib/library";

export const dynamic = "force-dynamic";

export default async function Home() {
  const books = await listLibraryBooks();
  return <LibraryPage initialBooks={books} />;
}
