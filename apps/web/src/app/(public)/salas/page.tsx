import type { Metadata } from "next";
import { RoomsClientPage } from "./rooms-client";

export const metadata: Metadata = {
  title: "Salas y Horarios",
  description:
    "Explora las salas de entrenamiento disponibles y reserva un horario segun tu membresia activa en GymFlow.",
  alternates: {
    canonical: "/salas"
  },
  openGraph: {
    title: "Salas y Horarios | GymFlow",
    description:
      "Explora las salas de entrenamiento disponibles y reserva un horario segun tu membresia activa.",
    url: "https://gymflow.example.com/salas"
  }
};

export default function SalasPage() {
  return <RoomsClientPage />;
}
