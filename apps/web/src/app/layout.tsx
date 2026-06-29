import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gymflow.example.com"),
  title: {
    default: "GymFlow",
    template: "%s | GymFlow"
  },
  description:
    "Plataforma inteligente para gestionar gimnasios, membresias, reservas, tienda, pagos simulados y reportes.",
  applicationName: "GymFlow",
  openGraph: {
    title: "GymFlow",
    description:
      "Gestion integral de gimnasios con membresias, reservas, tienda, pagos simulados y dashboard.",
    url: "https://gymflow.example.com",
    siteName: "GymFlow",
    locale: "es_PE",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "GymFlow",
    description:
      "Gestion integral de gimnasios con membresias, reservas, tienda, pagos simulados y dashboard."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
