import "server-only";
import { z } from "zod";

const runtimeSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .url("DATABASE_URL geçerli bir PostgreSQL URL'si olmalıdır.")
      .refine((value) => ["postgres:", "postgresql:"].includes(new URL(value).protocol), "DATABASE_URL PostgreSQL kullanmalıdır."),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
    APP_ENV: z.enum(["development", "staging", "production"]).default(
      process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV === "preview" ? "staging" : "development",
    ),
    BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET en az 32 karakter olmalıdır."),
    BETTER_AUTH_URL: z.string().url(),
    APP_URL: z.string().url(),
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: z
      .string()
      .refine((value) => {
        try {
          return Buffer.from(value, "base64").byteLength === 32;
        } catch {
          return false;
        }
      }, "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY base64 biçiminde 32 bayt olmalıdır.")
      .optional(),
  })
  .superRefine((env, context) => {
    if (env.APP_ENV !== "production") return;

    for (const [key, value] of [
      ["BETTER_AUTH_URL", env.BETTER_AUTH_URL],
      ["APP_URL", env.APP_URL],
    ] as const) {
      if (new URL(value).protocol !== "https:") {
        context.addIssue({
          code: "custom",
          path: [key],
          message: `${key} üretimde HTTPS kullanmalıdır.`,
        });
      }
    }

    if (new URL(env.BETTER_AUTH_URL).origin !== new URL(env.APP_URL).origin) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_URL"],
        message: "BETTER_AUTH_URL ve APP_URL aynı origin'i kullanmalıdır.",
      });
    }

    if (["localhost", "127.0.0.1"].includes(new URL(env.APP_URL).hostname)) {
      context.addIssue({
        code: "custom",
        path: ["APP_URL"],
        message: "APP_URL üretimde yerel adres olamaz.",
      });
    }

    if (/change-me|development-only|example/i.test(env.BETTER_AUTH_SECRET)) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_SECRET"],
        message: "Üretimde örnek veya geliştirme sırrı kullanılamaz.",
      });
    }

    if (!env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_SERVER_ACTIONS_ENCRYPTION_KEY"],
        message: "Çok örnekli üretim dağıtımları için sabit Server Action anahtarı gerekir.",
      });
    }

  });

let cachedRuntimeEnv: z.infer<typeof runtimeSchema> | undefined;

export function assertRuntimeEnv() {
  if (cachedRuntimeEnv) return cachedRuntimeEnv;

  const parsed = runtimeSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).filter(Boolean).join(", ");
    throw new Error(`Uygulama ortam değişkenleri eksik veya geçersiz${missing ? `: ${missing}` : "."}`);
  }

  cachedRuntimeEnv = parsed.data;
  return cachedRuntimeEnv;
}

export function appUrl() {
  return assertRuntimeEnv().APP_URL;
}
