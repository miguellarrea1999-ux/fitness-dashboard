import { timingSafeEqual } from "node:crypto";

/** Token compartido con la app Bitácora (variable BITACORA_TOKEN). */
export function bitacoraAuthorized(req: Request): boolean {
  const expected = process.env.BITACORA_TOKEN;
  if (!expected) return false;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
