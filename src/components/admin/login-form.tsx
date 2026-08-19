"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/validations/schemas";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");

    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,
      });

      if (result.error) {
        setServerError(
          result.error.status === 429
            ? "Çok fazla deneme yaptınız. Birkaç dakika sonra tekrar deneyin."
            : "E-posta veya parola hatalı.",
        );
        return;
      }

      router.replace("/staff");
      router.refresh();
    } catch {
      setServerError("Giriş hizmetine şu anda ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {serverError ? (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" autoComplete="username" {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Parola</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : <LockKeyhole />}
        {isSubmitting ? "Giriş yapılıyor…" : "Güvenli giriş yap"}
      </Button>
    </form>
  );
}
