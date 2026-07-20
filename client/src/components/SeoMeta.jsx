import { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { LanguageContext } from '../context/LanguageContext';

const LANG_MAP = { en: 'en', ar: 'ar', fr: 'fr', it: 'it', tr: 'tr' };

const SeoMeta = ({ title, description, keywords, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, canonicalUrl, robots, jsonld }) => {
  const { language } = useContext(LanguageContext);
  const siteUrl = 'https://egyfield.com';
  const fullTitle = title ? `${title} — EgyField` : 'EgyField — Premium Egyptian Agricultural Exports';
  const fullDesc = description || 'EgyField specializes in premium Egyptian agricultural exports: pickles, fresh produce, frozen products, grains & legumes. Worldwide delivery.';
  const ogImg = ogImage || 'https://egyfield.com/src/assets/egyfield.svg';
  const currentPath = window.location.pathname + window.location.search;
  const fullCanonical = canonicalUrl || (siteUrl + currentPath.split('?')[0]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      {keywords?.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robots || 'index, follow'} />

      <link rel="canonical" href={fullCanonical} />

      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || fullDesc} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || fullDesc} />
      <meta name="twitter:image" content={twitterImage || ogImg} />

      {/* hreflang for all supported languages */}
      {Object.values(LANG_MAP).map(lang => (
        <link key={lang} rel="alternate" hrefLang={lang} href={`${siteUrl}/${lang !== 'en' ? lang : ''}${currentPath}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${currentPath}`} />

      {jsonld && (
        <script type="application/ld+json">{JSON.stringify(jsonld)}</script>
      )}
    </Helmet>
  );
};

export default SeoMeta;
