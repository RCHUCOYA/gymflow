import type { Metadata } from "next";
import { StoreClientPage } from "./store-client";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Compra proteinas, suplementos, bebidas y accesorios de fitness en la tienda de GymFlow.",
  alternates: { canonical: "/tienda" },
  openGraph: {
    title: "Tienda | GymFlow",
    description: "Compra proteinas, suplementos, bebidas y accesorios de fitness.",
    url: "https://gymflow.example.com/tienda"
  }
};

export default function TiendaPage() {
  return <StoreClientPage />;
}
