import { useState, useEffect } from 'react';
import api from '../services/api';

const normalize = (val) => {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && val.en) return val.en;
  if (val === null || val === undefined) return '';
  return String(val);
};

export function useSEO() {
  const [seo, setSeo] = useState({ metaTitle: '', metaDescription: '', keywords: [] });

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data?.seo) {
          const s = res.data.seo;
          setSeo({
            metaTitle: normalize(s.metaTitle),
            metaDescription: normalize(s.metaDescription),
            keywords: Array.isArray(s.keywords) ? s.keywords : [],
          });
        }
      })
      .catch(() => {});
  }, []);

  return seo;
}
