import { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import api from '../services/api';
import './PageCover.css';

const PageCover = ({ pageKey, fallbackTitle, fallbackSubtitle }) => {
  const { language } = useLanguage();
  const lang = language || 'en';
  const [cover, setCover] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        const pc = res.data?.pageCovers?.[pageKey];
        if (pc) setCover(pc);
      })
      .catch(() => {});
  }, [pageKey]);

  const title = cover?.title?.[lang] || cover?.title?.en || fallbackTitle || '';
  const subtitle = cover?.subtitle?.[lang] || cover?.subtitle?.en || fallbackSubtitle || '';
  const hasImage = cover?.enabled && cover?.image?.url;

  return (
    <div className={`page-cover ${hasImage ? 'page-cover--image' : 'page-cover--gradient'}`}>
      {hasImage && (
        <div className="page-cover-img-wrapper">
          <img src={cover.image.url} alt={title} className="page-cover-img" />
          <div className="page-cover-overlay" />
        </div>
      )}
      {!hasImage && (
        <div className="page-cover-bg">
          <div className="page-cover-orb page-cover-orb-1" />
          <div className="page-cover-orb page-cover-orb-2" />
          <div className="page-cover-orb page-cover-orb-3" />
        </div>
      )}
      <div className="container page-cover-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageCover;
