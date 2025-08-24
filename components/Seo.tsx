import Head from 'next/head'
import React from 'react'

export type SeoProps = {
  title: string
  description: string
  keywords?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  ogUrl?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: object
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
}) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    {canonical && <link rel="canonical" href={canonical} />}
    {/* Open Graph */}
    <meta property="og:title" content={ogTitle || title} />
    <meta property="og:description" content={ogDescription || description} />
    <meta property="og:type" content={ogType} />
    {ogUrl && <meta property="og:url" content={ogUrl} />}
    {ogImage && <meta property="og:image" content={ogImage} />}
    {/* Twitter Card */}
    <meta name="twitter:card" content={twitterCard} />
    <meta name="twitter:title" content={twitterTitle || title} />
    <meta name="twitter:description" content={twitterDescription || description} />
    {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    {/* Structured Data */}
    {structuredData && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    )}
  </Head>
)
