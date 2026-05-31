import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { ExternalLink, Handshake } from 'lucide-react';
import api from '../services/api';
import './Partners.css';

const Partners = () => {
  const { language } = useLanguage();
  const lang = language || 'en';
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageActive, setPageActive] = useState(null); // null = still checking

  // Check if the page is enabled by admin
  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data && res.data.isPartnersActive === false) {
          setPageActive(false);
        } else {
          setPageActive(true);
        }
      })
      .catch(() => {
        setPageActive(true); // default to active on error
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
      <Helmet>
        <title>{language === 'ar' ? 'شركاؤنا' : 'Our Partners'} — EgyField</title>
        <meta name="description" content="EgyField's trusted global partners and distributors delivering premium agricultural products worldwide." />
      </Helmet>

      <div className="partners-page">
        {/* Page Header */}
        <div className="partners-hero">
          <div className="container">
            <div className="partners-hero-icon">
              <Handshake size={48} />
            </div>
            <h1>{language === 'ar' ? 'شركاؤنا في النجاح' : 'Our Partners in Success'}</h1>
            <p>
              {language === 'ar' 
                ? 'نفخر بالعمل مع نخبة من الشركاء والموزعين العالميين لتقديم الحاصلات الزراعية المصرية بأعلى معايير الجودة.' 
                : 'We are proud to work with leading global partners and distributors to deliver premium Egyptian agricultural exports.'}
            </p>
          </div>
        </div>

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

