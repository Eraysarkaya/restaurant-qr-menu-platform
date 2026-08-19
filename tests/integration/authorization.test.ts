import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSession, findUser } = vi.hoisted(() => ({ getSession: vi.fn(), findUser: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/server/auth/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("@/server/db/client", () => ({ getDb: () => ({ user: { findUnique: findUser } }) }));

describe("admin authorization", () => {
  beforeEach(() => { getSession.mockReset(); findUser.mockReset(); });

  it("oturumsuz mutation'ı reddeder", async () => {
    getSession.mockResolvedValue(null);
    const { requireAdminAction } = await import("@/server/auth/session");
    await expect(requireAdminAction()).rejects.toThrow("yetkiniz yok");
  });

  it("OWNER rolüne izin verir", async () => {
    const session = { user: { id: "owner", role: "OWNER" }, session: { id: "session" } };
    getSession.mockResolvedValue(session);
    findUser.mockResolvedValue({ role: "OWNER", isActive: true, mustChangePassword: false });
    const { requireAdminAction } = await import("@/server/auth/session");
    await expect(requireAdminAction()).resolves.toMatchObject(session);
  });

  it("pasif editörün admin erişimini reddeder", async () => {
    getSession.mockResolvedValue({ user: { id: "user", role: "EDITOR" }, session: { id: "session" } });
    findUser.mockResolvedValue({ role: "EDITOR", isActive: false, mustChangePassword: false });
    const { requireAdminAction } = await import("@/server/auth/session");
    await expect(requireAdminAction()).rejects.toThrow("yetkiniz yok");
  });
});
