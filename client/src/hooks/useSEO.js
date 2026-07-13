import { useState, useEffect } from 'react';
import api from '../services/api';

export function useSEO() {
  const [seo, setSeo] = useState({ metaTitle: '', metaDescription: '', keywords: [] });

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data?.seo) setSeo(res.data.seo);
      })
      .catch(() => {});
  }, []);

  return seo;
}
