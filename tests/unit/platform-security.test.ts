import { describe, expect, it } from "vitest";
import { hashPlatformToken } from "@/platform/security";

describe("platform token güvenliği", () => {
  it("ham token yerine kararlı SHA-256 hash üretir", () => {
    const token = "a".repeat(43);
    const hash = hashPlatformToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(token);
    expect(hashPlatformToken(token)).toBe(hash);
    expect(hashPlatformToken(`${token}b`)).not.toBe(hash);
  });
});
