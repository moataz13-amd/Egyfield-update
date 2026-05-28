import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { Home, Sprout } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found</title>
      </Helmet>

      <div className="notfound-page">
        <div className="container notfound-container">
          <div className="notfound-content glass-card">
            <div className="notfound-icon-container" style={{ marginBottom: '24px', display: 'inline-block' }}>
              <Sprout size={64} style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="notfound-title">{t('notFound.title')}</h1>
            <h2 className="notfound-subtitle">{t('notFound.subtitle')}</h2>
            <p className="notfound-text">{t('notFound.text')}</p>
            <Link to="/" className="btn btn-primary btn-lg notfound-btn">
              <Home size={18} />
              <span>{t('notFound.button')}</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
