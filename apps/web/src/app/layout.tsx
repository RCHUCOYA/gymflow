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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gymflow.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GymFlow",
    template: "%s | GymFlow"
  },
  description:
    "Plataforma inteligente para gestionar gimnasios, membresias, reservas, tienda, pagos simulados y reportes.",
  applicationName: "GymFlow",
  keywords: ["gym management", "gestion de gimnasios", "membresias gimnasio", "reservas fitness"],
  authors: [{ name: "GymFlow" }],
  creator: "GymFlow",
  publisher: "GymFlow",
  openGraph: {
    title: "GymFlow",
    description:
      "Gestion integral de gimnasios con membresias, reservas, tienda, pagos simulados y dashboard.",
    url: siteUrl,
    siteName: "GymFlow",
    locale: "es_PE",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "GymFlow",
    description:
      "Gestion integral de gimnasios con membresias, reservas, tienda, pagos simulados y dashboard.",
    creator: "@gymflow"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: siteUrl
  }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GymFlow",
  url: siteUrl,
  description:
    "Plataforma SaaS para la gestion integral de gimnasios modernos.",
  sameAs: []
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GymFlow",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/tienda?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
