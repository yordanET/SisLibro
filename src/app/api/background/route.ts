export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("La opción de fondo fue deshabilitada.", { status: 404 });
}
