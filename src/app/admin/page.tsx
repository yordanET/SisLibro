import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { listLibraryBooks } from "@/lib/library";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!verifySessionToken(session)) {
    redirect("/admin-barra-logic");
  }

  const books = await listLibraryBooks();
  return <AdminPanel initialBooks={books} />;
}
