# 20. SEO, Accesibilidad y Optimizacion Web

## Objetivo

Definir la estrategia completa de SEO tecnico, SEO on-page, accesibilidad, responsive design, marketing analytics y rendimiento web para GymFlow antes de implementar la aplicacion en Next.js.

## SEO tecnico

### Metadata dinamica con Next.js App Router

- Usar `metadata` o `generateMetadata` por ruta.
- Centralizar valores base en una configuracion SEO.
- Construir titulos con el patron: `Pagina | GymFlow`.
- Usar metadata dinamica para productos, entrenadores, nutricionistas y publicaciones futuras del blog.
- Definir `metadataBase` con el dominio de produccion.

### Convenciones globales

| Elemento | Estrategia |
| --- | --- |
| Title | Maximo recomendado: 50-60 caracteres. |
| Meta description | 140-160 caracteres, orientada a conversion. |
| Keywords | Uso documental; no depender de ellas para ranking. |
| Canonical | Una URL canonica por pagina indexable. |
| Open Graph | Titulo, descripcion, tipo, URL e imagen por pagina clave. |
| Twitter Cards | `summary_large_image` para paginas publicas. |
| robots.txt | Permitir paginas publicas, bloquear areas privadas. |
| sitemap.xml | Incluir rutas publicas indexables. |
| Manifest PWA | Nombre, iconos, color de tema y display standalone. |
| Favicons | Iconos en tamanos 16, 32, 180 y 512 px. |
| Breadcrumbs | Usar navegacion visible y JSON-LD `BreadcrumbList`. |
| URLs amigables | Kebab-case, sin IDs tecnicos visibles cuando exista slug. |
| Redirecciones | 301 para cambios permanentes y 302 para temporales. |
| Indexacion | Indexar marketing y catalogo publico; no indexar dashboard ni auth. |

### robots.txt previsto

```txt
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /staff
Disallow: /profile
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /login
Disallow: /register

Sitemap: https://gymflow.example.com/sitemap.xml
```

### Sitemap publico previsto

```text
/
/nosotros
/planes
/salas
/entrenadores
/nutricionistas
/tienda
/productos/[slug]
/blog
/blog/[slug]
/contacto
```

### Rutas no indexables

```text
/login
/register
/forgot-password
/dashboard
/profile
/reservations
/cart
/checkout
/orders
/admin/*
/staff/*
```

## SEO por pagina

| Pagina | Title | Meta Description | Keywords | Canonical | Structured Data |
| --- | --- | --- | --- | --- | --- |
| Landing | GymFlow | Plataforma inteligente para gestionar gimnasios, membresias, reservas, tienda, pagos simulados y reportes desde un solo lugar. | gym management software, gestion de gimnasios, reservas gimnasio | `/` | Organization, WebSite, FAQPage |
| Nosotros | Nosotros | Conoce la vision de GymFlow: una plataforma SaaS para modernizar la operacion de gimnasios y centros fitness. | software fitness, gimnasio SaaS | `/nosotros` | Organization |
| Planes | Planes de Membresia | Explora planes de membresia para gimnasios con beneficios, reservas, entrenadores, nutricionistas y promociones. | membresias gimnasio, planes fitness | `/planes` | Offer |
| Salas | Salas de Entrenamiento | Reserva salas de pesas, yoga, crossfit, pilates, baile, boxeo y entrenamiento funcional con control de aforo. | reservas salas gimnasio, salas fitness | `/salas` | SportsActivityLocation |
| Entrenadores | Entrenadores Personales | Encuentra entrenadores por especialidad y agenda sesiones segun los beneficios de tu membresia. | entrenador personal, agenda fitness | `/entrenadores` | LocalBusiness |
| Nutricionistas | Nutricionistas Deportivos | Agenda consultas nutricionales y recibe planes personalizados segun tu objetivo deportivo. | nutricionista deportivo, plan nutricional | `/nutricionistas` | LocalBusiness |
| Tienda | Tienda Fitness | Compra proteinas, creatina, bebidas, shakers, guantes, toallas y accesorios deportivos. | tienda fitness, suplementos gimnasio | `/tienda` | Product, Offer |
| Producto | Producto Fitness | Consulta precio, stock, categoria y beneficios del producto fitness seleccionado. | suplemento, accesorio fitness | `/productos/[slug]` | Product, Offer, BreadcrumbList |
| Blog | Blog Fitness | Consejos sobre entrenamiento, nutricion, membresias, gestion fitness y tecnologia para gimnasios. | blog fitness, gestion gimnasios | `/blog` | WebSite, BreadcrumbList |
| Contacto | Contacto | Contacta con GymFlow para conocer la plataforma y resolver dudas sobre gestion integral de gimnasios. | contacto gymflow, demo gimnasio | `/contacto` | LocalBusiness |

## Open Graph y Twitter Cards

### Defaults

```json
{
  "og:type": "website",
  "og:site_name": "GymFlow",
  "og:locale": "es_PE",
  "twitter:card": "summary_large_image",
  "twitter:site": "@gymflow"
}
```

### Imagenes sociales

- Tamano recomendado: 1200 x 630 px.
- Formato: WebP o PNG optimizado.
- Variantes: landing, planes, tienda, blog y producto.
- Texto embebido minimo para evitar problemas de recorte.

## Structured Data Schema.org

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GymFlow",
  "url": "https://gymflow.example.com",
  "logo": "https://gymflow.example.com/icons/icon-512.png",
  "sameAs": []
}
```

### LocalBusiness / SportsActivityLocation

```json
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "GymFlow Demo Gym",
  "url": "https://gymflow.example.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PE",
    "addressLocality": "Lima"
  }
}
```

### Product y Offer

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Whey Protein",
  "category": "Suplementos",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "PEN",
    "price": "129.90",
    "availability": "https://schema.org/InStock"
  }
}
```

### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://gymflow.example.com"
    }
  ]
}
```

### FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "GymFlow procesa pagos reales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. En esta version los pagos son simulados para fines academicos y de portafolio."
      }
    }
  ]
}
```

### WebSite con SearchAction

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://gymflow.example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gymflow.example.com/tienda?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## Rendimiento web

### Objetivos Lighthouse

| Categoria | Objetivo |
| --- | --- |
| Performance | > 90 |
| SEO | > 95 |
| Accessibility | > 95 |
| Best Practices | > 95 |

### Estrategias

- Lazy loading para imagenes bajo el primer viewport.
- `next/image` para optimizacion, tamanos responsivos y formatos modernos.
- Code splitting natural por rutas con App Router.
- Dynamic imports para charts, modales pesados y componentes administrativos.
- Font optimization con `next/font` y subset latino.
- Evitar librerias grandes cuando exista alternativa nativa o ligera.
- Cachear datos publicos como planes, salas, productos destacados y blog.
- Usar skeletons y streaming donde mejore percepcion de carga.
- Reducir JavaScript cliente en paginas publicas.

### Cache strategy

| Recurso | Estrategia |
| --- | --- |
| Landing, Nosotros, Contacto | Cache estatico con revalidacion programada. |
| Planes y salas publicas | Revalidacion corta o tag-based futura. |
| Productos publicos | Cache con invalidacion al actualizar inventario visible. |
| Dashboard | No cache compartido; datos privados por usuario/rol. |
| Imagenes | CDN Cloudinary + Next image cache. |
| API privada | Cache control `no-store` para datos sensibles. |

## Accesibilidad WCAG 2.1 AA

| Area | Regla |
| --- | --- |
| Contraste | Texto normal minimo 4.5:1; texto grande 3:1. |
| Teclado | Toda accion debe ser alcanzable sin mouse. |
| Focus | Indicador visible y consistente. |
| ARIA | Usar roles ARIA solo cuando HTML semantico no sea suficiente. |
| Formularios | Labels, descripciones, errores asociados y mensajes claros. |
| Lectores de pantalla | Orden logico, landmarks, textos alternativos utiles. |
| Modales | Focus trap, cierre con Escape y retorno de foco. |
| Tablas | Headers claros y captions cuando aporten contexto. |
| Motion | Respetar `prefers-reduced-motion`. |

## Responsive design

### Breakpoints oficiales

| Nombre | Min width | Uso |
| --- | --- | --- |
| `xs` | 360px | Moviles pequenos. |
| `sm` | 640px | Moviles grandes. |
| `md` | 768px | Tablets. |
| `lg` | 1024px | Laptop. |
| `xl` | 1280px | Desktop. |
| `2xl` | 1536px | Pantallas grandes. |

### Reglas responsive

- Mobile first.
- Navegacion inferior o drawer en mobile.
- Tablas administrativas con columnas prioritarias y vista detalle.
- Cards en una columna en mobile, grid en desktop.
- Dashboard con KPIs apilados en mobile y layout denso en desktop.
- Formularios con una columna en mobile y dos columnas solo cuando mejore lectura.

## Estrategia de marketing y analytics

| Herramienta | Uso | Estado |
| --- | --- | --- |
| Google Search Console | Indexacion, sitemap, rendimiento organico. | Documentado. |
| Google Analytics | Medicion de trafico y conversiones. | Documentado. |
| Google Tag Manager | Gestion de etiquetas sin redeploy. | Documentado. |
| Meta Pixel | Remarketing y conversiones futuras. | Documentado, no implementado. |
| Microsoft Clarity | Mapas de calor y sesiones anonimizadas. | Documentado. |

### Eventos de conversion

- `sign_up_started`.
- `sign_up_completed`.
- `login_completed`.
- `membership_viewed`.
- `membership_purchase_started`.
- `membership_purchase_completed`.
- `reservation_created`.
- `product_added_to_cart`.
- `checkout_started`.
- `order_completed`.
- `contact_form_submitted`.

## Estrategia de contenido

- Landing con propuesta clara en el primer viewport.
- CTA principal: comprar membresia o solicitar demo segun contexto.
- CTA secundario: explorar planes.
- Beneficios por actor: administrador, recepcionista, cliente y profesional.
- Testimonios preparados como componente futuro.
- FAQ orientado a objeciones: pagos simulados, reservas, membresias, tienda y seguridad.
- Blog preparado para articulos de entrenamiento, nutricion, gestion de gimnasios y tecnologia fitness.
- Contenido transaccional para planes, salas, entrenadores, nutricionistas y productos.

## Indicadores de calidad

| Metrica | Objetivo |
| --- | --- |
| Lighthouse Performance | > 90 |
| Lighthouse SEO | > 95 |
| Lighthouse Accessibility | > 95 |
| Lighthouse Best Practices | > 95 |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |
| FCP | < 1.8 s |
| TTFB | < 800 ms |
| JS inicial publico | Mantener lo minimo por ruta. |

## Checklist SEO previo al despliegue

- Metadata por pagina definida.
- Canonicals correctos.
- Open Graph y Twitter Cards con imagenes validas.
- `robots.txt` configurado.
- `sitemap.xml` generado.
- Rutas privadas marcadas como no indexables.
- JSON-LD validado con Rich Results Test.
- Imagenes con `alt` util.
- Headings en orden logico.
- URLs en kebab-case.
- Redirecciones documentadas.
- Lighthouse en objetivos.
- Core Web Vitals dentro de umbrales.
- Search Console listo para verificar dominio.

