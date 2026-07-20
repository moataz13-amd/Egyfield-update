import { useState, useEffect } from 'react';
import api from '../services/api';

const normalize = (val) => {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && val.en) return val.en;
  if (val === null || val === undefined) return '';
  return String(val);
};

export function useSEO(pageRoute) {
  const [seo, setSeo] = useState({ metaTitle: '', metaDescription: '', keywords: [], ogTitle: '', ogDescription: '', ogImage: '', twitterTitle: '', twitterDescription: '', twitterImage: '', canonicalUrl: '', robots: 'index,follow' });

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await api.get('/settings');
        const globalSeo = res.data?.seo || {};

        let pageSeo = {};
        if (pageRoute) {
          try {
            const pageRes = await api.get('/seo/pages', { params: { page: pageRoute } });
            if (pageRes.data?.length > 0) {
              const sp = pageRes.data[0];
              pageSeo = {
                metaTitle: sp.title,
                metaDescription: sp.description,
                keywords: sp.keywords || [],
                ogTitle: sp.ogTitle,
                ogDescription: sp.ogDescription,
                ogImage: sp.ogImage,
                twitterTitle: sp.twitterTitle,
                twitterDescription: sp.twitterDescription,
                twitterImage: sp.twitterImage,
                canonicalUrl: sp.canonicalUrl,
                robots: `${sp.robots || 'index'},${sp.follow || 'follow'}`,
              };
            }
          } catch {}
        }

        setSeo({
          metaTitle: pageSeo.metaTitle || normalize(globalSeo.metaTitle),
          metaDescription: pageSeo.metaDescription || normalize(globalSeo.metaDescription),
          keywords: pageSeo.keywords?.length > 0 ? pageSeo.keywords : (Array.isArray(globalSeo.keywords) ? globalSeo.keywords : []),
          ogTitle: pageSeo.ogTitle || pageSeo.metaTitle || normalize(globalSeo.metaTitle),
          ogDescription: pageSeo.ogDescription || pageSeo.metaDescription || normalize(globalSeo.metaDescription),
          ogImage: pageSeo.ogImage || normalize(globalSeo.ogImage),
          twitterTitle: pageSeo.twitterTitle || pageSeo.metaTitle || normalize(globalSeo.metaTitle),
          twitterDescription: pageSeo.twitterDescription || pageSeo.metaDescription || normalize(globalSeo.metaDescription),
          twitterImage: pageSeo.twitterImage || pageSeo.ogImage || normalize(globalSeo.ogImage),
          canonicalUrl: pageSeo.canonicalUrl || '',
          robots: pageSeo.robots || 'index,follow',
        });
      } catch {}
    };
    fetchSeo();
  }, [pageRoute]);

  return seo;
}
