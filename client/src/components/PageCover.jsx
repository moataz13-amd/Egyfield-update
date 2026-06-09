import { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import api from '../services/api';
import './PageCover.css';

const PageCover = ({ pageKey, fallbackTitle, fallbackSubtitle, children }) => {
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

  const shouldShowText = cover?.showText !== false;
  let title = '';
  let subtitle = '';

  if (cover) {
    if (shouldShowText) {
      const coverTitle = cover.title?.[lang] ?? cover.title?.en;
      const coverSubtitle = cover.subtitle?.[lang] ?? cover.subtitle?.en;
      
      title = typeof coverTitle === 'string' ? coverTitle : fallbackTitle;
      subtitle = typeof coverSubtitle === 'string' ? coverSubtitle : fallbackSubtitle;
    }
  } else {
    title = fallbackTitle;
    subtitle = fallbackSubtitle;
  }

  const hasImage = cover?.enabled && cover?.image?.url;
  const hasTextContent = !!(title || subtitle);
  const showOverlay = (shouldShowText && hasTextContent) || !!children;

  return (
    <div className={`page-cover ${hasImage ? 'page-cover--image' : 'page-cover--gradient'}`}>
      {hasImage && (
        <div className="page-cover-img-wrapper">
          <img src={cover.image.url} alt={title} className="page-cover-img" />
          {showOverlay && <div className="page-cover-overlay" />}
        </div>
      )}
      {!hasImage && (
        <div className="page-cover-bg">
          <div className="page-cover-orb page-cover-orb-1" />
          <div className="page-cover-orb page-cover-orb-2" />
          <div className="page-cover-orb page-cover-orb-3" />
        </div>
      )}
      {showOverlay && (
        <div className="container page-cover-content">
          {shouldShowText && title && <h1>{title}</h1>}
          {shouldShowText && subtitle && <p>{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

export default PageCover;
