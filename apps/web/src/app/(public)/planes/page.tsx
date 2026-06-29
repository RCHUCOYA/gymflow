import type { Metadata } from "next";
import { MembershipPlansClientPage } from "./membership-plans-client";

export const metadata: Metadata = {
  title: "Planes de Membresia",
  description:
    "Explora planes de membresia para gimnasios con beneficios, reservas, entrenadores, nutricionistas y promociones.",
  alternates: {
    canonical: "/planes"
  },
  openGraph: {
    title: "Planes de Membresia | GymFlow",
    description:
      "Explora planes de membresia para gimnasios con beneficios, reservas, entrenadores, nutricionistas y promociones.",
    url: "https://gymflow.example.com/planes"
  }
};

export default function MembershipPlansPage() {
  return <MembershipPlansClientPage />;
}
