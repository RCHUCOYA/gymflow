import type { Metadata } from "next";
import Link from "next/link";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

export const metadata: Metadata = {
  title: "Login",
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {
  return (
    <AuthFormShell
      mode="login"
      title="Iniciar sesion"
      description="Accede a tu panel segun tu rol dentro de GymFlow."
      submitLabel="Ingresar"
      footer={
        <div className="space-y-2">
          <p>
            No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold text-primary">
              Registrate
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="font-semibold text-primary">
              Olvide mi contrasena
            </Link>
          </p>
        </div>
      }
    />
  );
}
