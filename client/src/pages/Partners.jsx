import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import SeoMeta from '../components/SeoMeta';
import { ExternalLink, Handshake } from 'lucide-react';
import PageCover from '../components/PageCover';
import api from '../services/api';
import './Partners.css';

const Partners = () => {
  const { language } = useLanguage();
  const seo = useSEO('/partners');
  const lang = language || 'en';
  const [settings, setSettings] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageActive, setPageActive] = useState(null);

  // Check if the page is enabled by admin
  useEffect(() => {
    api.get('/settings')
      .then(res => {
        setSettings(res.data);
        if (res.data && res.data.isPartnersActive === false) {
          setPageActive(false);
        } else {
          setPageActive(true);
        }
      })
      .catch(() => {
        setPageActive(true);
      });
  }, []);

  // Fetch partners only if page is active
  useEffect(() => {
    if (pageActive !== true) return;
    api.get('/partners')
      .then(res => {
        setPartners(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [pageActive]);

  // Still checking settings — show nothing
  if (pageActive === null) return null;

  // Page disabled by admin — redirect to 404
  if (pageActive === false) return <Navigate to="/404" replace />;

  return (
    <>
      <SeoMeta
        title={seo.metaTitle || (language === 'ar' ? 'شركاؤنا' : 'Our Partners')}
        description={seo.metaDescription}
        keywords={seo.keywords}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
        ogImage={seo.ogImage}
        twitterTitle={seo.twitterTitle}
        twitterDescription={seo.twitterDescription}
        twitterImage={seo.twitterImage}
        canonicalUrl={seo.canonicalUrl}
        robots={seo.robots}
        language={language}
        jsonld={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: language === 'ar' ? 'الشركاء' : 'Partners', isPartOf: { '@type': 'WebSite', name: 'Delta Harvest', url: 'https://deltaharvest.com' } }}
      />

      <div className="partners-page">
        {/* Page Cover */}
        <PageCover
          pageKey="partners"
          fallbackTitle={language === 'ar' ? 'شركاؤنا في النجاح' : 'Our Partners in Success'}
          fallbackSubtitle={language === 'ar' 
            ? 'نفخر بالعمل مع نخبة من الشركاء والموزعين العالميين لتقديم الحاصلات الزراعية المصرية بأعلى معايير الجودة.' 
            : 'We are proud to work with leading global partners and distributors to deliver premium Egyptian agricultural exports.'}
        />

        {/* Partners Grid */}
        <section className="section partners-section">
          <div className="container">
            {loading ? (
              <div className="partners-loading">
                <div className="spinner"></div>
                <p>{language === 'ar' ? 'جاري تحميل شركائنا...' : 'Loading partners...'}</p>
              </div>
            ) : partners.length === 0 ? (
              <div className="partners-empty">
                <p>{language === 'ar' ? 'لا يوجد شركاء مضافين حالياً.' : 'No partners added yet.'}</p>
              </div>
            ) : (
              <div className="partners-grid">
                {partners.map((partner) => (
                  <div key={partner._id} className="partner-card glass-card">
                    <div className="partner-logo-wrapper">
                      <img 
                        src={partner.logo?.url} 
                        alt={partner.name?.[lang] || partner.name?.en} 
                        className="partner-logo-img"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="partner-info">
                      <h3>{partner.name?.[lang] || partner.name?.en}</h3>
                      {partner.website && (
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="partner-link-btn"
                        >
                          <span>{language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Partners;

