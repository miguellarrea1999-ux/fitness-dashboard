// Ruta privada para Bitácora: lista de actividades de Garmin paginada (?start=0&limit=100).
import { getGarminClient, persistGarminTokens } from "@/lib/garmin";
import { bitacoraAuthorized } from "@/lib/bitacoraAuth";

export const runtime = "nodejs";
export const maxDuration = 60;

type Raw = {
  activityId: number; activityName?: string; activityType?: { typeKey?: string };
  startTimeLocal?: string; duration?: number; distance?: number; averageHR?: number; calories?: number;
};

export async function GET(req: Request) {
  if (!bitacoraAuthorized(req)) return new Response("Unauthorized", { status: 401 });
  const u = new URL(req.url);
  const start = Math.max(0, Number(u.searchParams.get("start") ?? 0) | 0);
  const limit = Math.min(200, Math.max(1, Number(u.searchParams.get("limit") ?? 100) | 0));
  try {
    const c = await getGarminClient();
    const raw = (await c.getActivities(start, limit)) as unknown as Raw[];
    await persistGarminTokens(c);
    return Response.json(raw.map((a) => ({
      id: a.activityId, name: a.activityName ?? "", type: a.activityType?.typeKey ?? "other",
      start: a.startTimeLocal ?? null, durationMin: a.duration ? Math.round(a.duration / 60) : null,
      distanceKm: a.distance ? Math.round(a.distance / 100) / 10 : null,
      avgHR: a.averageHR ?? null, kcal: a.calories ?? null,
    })), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
