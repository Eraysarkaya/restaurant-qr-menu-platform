import { createHash } from "node:crypto";

export const PLATFORM_COOKIE = "restaurant_platform_session";
export const SUPPORT_COOKIE = "restaurant_support_session";

export function hashPlatformToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
