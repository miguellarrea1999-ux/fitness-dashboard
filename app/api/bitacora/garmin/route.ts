// Ruta privada para la app Bitácora (diario y hábitos de Miguel).
// Sin parámetros: últimos 7 días (resumen). Con ?from=YYYY-MM-DD&to=YYYY-MM-DD: historial completo por día (máx. 14 días).
import { getBitacoraRange, getGarminWeekSummary } from "@/lib/garmin";
import { bitacoraAuthorized } from "@/lib/bitacoraAuth";

export const runtime = "nodejs";
export const maxDuration = 120;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  if (!bitacoraAuthorized(req)) return new Response("Unauthorized", { status: 401 });
  const u = new URL(req.url);
  const from = u.searchParams.get("from"), to = u.searchParams.get("to");
  try {
    if (from && to) {
      if (!ISO.test(from) || !ISO.test(to) || from > to) return new Response("Bad range", { status: 400 });
      return Response.json(await getBitacoraRange(from, to), { headers: { "cache-control": "no-store" } });
    }
    return Response.json(await getGarminWeekSummary(), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
