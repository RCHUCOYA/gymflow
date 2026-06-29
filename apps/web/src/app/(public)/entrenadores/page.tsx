import type { Metadata } from "next";
import { TrainersClientPage } from "./trainers-client";

export const metadata: Metadata = {
  title: "Entrenadores Personales",
  description:
    "Encuentra entrenadores por especialidad y agenda sesiones personalizadas segun los beneficios de tu membresia en GymFlow.",
  alternates: { canonical: "/entrenadores" },
  openGraph: {
    title: "Entrenadores Personales | GymFlow",
    description:
      "Encuentra entrenadores por especialidad y agenda sesiones segun tu membresia.",
    url: "https://gymflow.example.com/entrenadores"
  }
};

export default function TrainersPage() {
  return <TrainersClientPage />;
}
