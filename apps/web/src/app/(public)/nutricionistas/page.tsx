import type { Metadata } from "next";
import { NutritionistsClientPage } from "./nutritionists-client";

export const metadata: Metadata = {
  title: "Nutricionistas Deportivos",
  description:
    "Agenda consultas nutricionales y recibe planes personalizados segun tu objetivo deportivo en GymFlow.",
  alternates: { canonical: "/nutricionistas" },
  openGraph: {
    title: "Nutricionistas Deportivos | GymFlow",
    description:
      "Agenda consultas nutricionales y recibe planes personalizados segun tu objetivo deportivo.",
    url: "https://gymflow.example.com/nutricionistas"
  }
};

export default function NutritionistsPage() {
  return <NutritionistsClientPage />;
}
