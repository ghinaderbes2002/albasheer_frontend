import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'البشير للأدوات المنزلية'
const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL ?? 'https://albasheercomplex.com'
const DEFAULT_IMAGE = `${BASE_URL}/images/logo_al_basheer-removebg-preview.png`

interface SeoProps {
  title?: string
  description?: string
  image?: string
  url?: string
  canonical?: string
  type?: 'website' | 'product'
  jsonLd?: Record<string, unknown>
}

export function Seo({
  title,
  description = 'أحدث الأجهزة الكهربائية المنزلية بأفضل الأسعار وضمان حقيقي — البشير للأدوات المنزلية',
  image = DEFAULT_IMAGE,
  url,
  canonical: canonicalOverride,
  type = 'website',
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonical = canonicalOverride ?? (url ? `${BASE_URL}${url}` : undefined)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
