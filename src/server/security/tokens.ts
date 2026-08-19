import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { assertRuntimeEnv } from "@/server/env";

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function trackingTokenForIdempotency(idempotencyKey: string) {
  return createHmac("sha256", assertRuntimeEnv().BETTER_AUTH_SECRET).update(`order:${idempotencyKey}`).digest("base64url");
}

export function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
