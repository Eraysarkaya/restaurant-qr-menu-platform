import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/server/db/client";
import { assertRuntimeEnv } from "@/server/env";

const runtimeEnv = assertRuntimeEnv();
const useSecureCookies = new URL(runtimeEnv.BETTER_AUTH_URL).protocol === "https:";

export const auth = betterAuth({
  database: prismaAdapter(getDb(), { provider: "postgresql" }),
  baseURL: runtimeEnv.BETTER_AUTH_URL,
  secret: runtimeEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [new URL(runtimeEnv.APP_URL).origin],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 300, max: 5 },
    },
  },
  advanced: {
    useSecureCookies,
    cookiePrefix: "kose-mutfak",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: useSecureCookies,
      path: "/",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "OWNER",
        input: false,
      },
      isActive: { type: "boolean", required: false, defaultValue: true, input: false },
      mustChangePassword: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await getDb().user.findUnique({ where: { id: session.userId }, select: { isActive: true } });
          return user?.isActive ? undefined : false;
        },
        after: async (session) => {
          await getDb().user.update({ where: { id: session.userId }, data: { lastLoginAt: new Date() } });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
