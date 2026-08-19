import "server-only";
import { headers } from "next/headers";

export async function requestIp() {
  const values = await headers();
  const forwarded = values.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || values.get("x-real-ip") || "127.0.0.1").slice(0, 64);
}
