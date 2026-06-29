import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gymflow.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/planes", "/salas", "/entrenadores", "/nutricionistas", "/tienda"],
        disallow: [
          "/admin/",
          "/profile",
          "/reservations",
          "/appointments",
          "/cart",
          "/orders",
          "/staff/",
          "/agenda"
        ]
      }
    ],
    sitemap: `${base}/sitemap.xml`
  };
}
