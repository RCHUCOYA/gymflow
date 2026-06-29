import type { Metadata } from "next";
import Link from "next/link";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

export const metadata: Metadata = {
  title: "Registro",
  robots: {
    index: false,
    follow: false
  }
};

export default function RegisterPage() {
  return (
    <AuthFormShell
      mode="register"
      title="Crear cuenta"
      description="Registra un usuario cliente para comprar membresias y reservar servicios."
      submitLabel="Crear cuenta"
      footer={
        <p>
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Inicia sesion
          </Link>
        </p>
      }
    />
  );
}
