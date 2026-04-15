import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpenIcon } from "@/components/icons";
import { LoginForm } from "@/components/login-form";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function AdminBarraLogicPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (verifySessionToken(session)) {
    redirect("/admin");
  }

  return (
    <div
      className="w-full min-h-screen overflow-auto"
      style={{ background: "#F7F5F0" }}
    >
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

      <main className="w-full max-w-6xl mx-auto px-6 py-14">
        <div className="max-w-xl mx-auto">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

