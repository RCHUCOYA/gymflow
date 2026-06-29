"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/providers/auth-provider";

type AuthFormShellProps = {
  mode: "login" | "register";
  title: string;
  description: string;
  submitLabel: string;
  footer: React.ReactNode;
};

type AuthFormData = {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
};

export function AuthFormShell({ mode, title, description, submitLabel, footer }: AuthFormShellProps) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(() => {
    const baseSchema = z.object({
      firstName: z.string().trim().min(2, "Minimo 2 caracteres").optional(),
      lastName: z.string().trim().min(2, "Minimo 2 caracteres").optional(),
      email: z.string().email("Ingresa un correo valido"),
      password: z.string().min(8, "Minimo 8 caracteres"),
      phone: z.string().trim().min(7, "Minimo 7 caracteres").optional().or(z.literal(""))
    });

    if (mode !== "register") {
      return baseSchema;
    }

    return baseSchema
      .refine((data) => Boolean(data.firstName), {
        path: ["firstName"],
        message: "El nombre es obligatorio"
      })
      .refine((data) => Boolean(data.lastName), {
        path: ["lastName"],
        message: "El apellido es obligatorio"
      });
  }, [mode]);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: ""
    }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    try {
      if (mode === "register") {
        await register({
          firstName: values.firstName ?? "",
          lastName: values.lastName ?? "",
          email: values.email,
          password: values.password,
          phone: values.phone || undefined
        });
      } else {
        await login({
          email: values.email,
          password: values.password
        });
      }

      router.push("/profile");
    } catch {
      setServerError("No se pudo iniciar sesion. Verifica tus credenciales o intenta nuevamente.");
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">GymFlow</p>
          <h1 className="mt-2 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Nombres
                </label>
                <input
                  id="firstName"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName ? (
                  <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Apellidos
                </label>
                <input
                  id="lastName"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName ? (
                  <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                ) : null}
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="cliente@gymflow.dev"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Password123"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          {mode === "register" ? (
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefono (opcional)
              </label>
              <input
                id="phone"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="+51900000003"
                {...form.register("phone")}
              />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
          ) : null}

          {serverError ? <p className="text-xs text-destructive">{serverError}</p> : null}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {form.formState.isSubmitting ? "Procesando..." : submitLabel}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </section>
    </main>
  );
}
