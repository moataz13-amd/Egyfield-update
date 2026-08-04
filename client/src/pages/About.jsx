import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import SeoMeta from '../components/SeoMeta';
import { Target, Eye, ShieldCheck, Award, FileText, ExternalLink } from 'lucide-react';
import PageCover from '../components/PageCover';
import api, { resolveField } from '../services/api';
import './About.css';

const About = () => {
  const { t, language } = useLanguage();
  const seo = useSEO('/about');
  const lang = language || 'en';
  const [about, setAbout] = useState(null);

  useEffect(() => {
    api.get('/about').then(res => setAbout(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [about]);

  // Fallback timeline/certs if API hasn't loaded yet
  const timelineEvents = about?.timeline || [];
  const certifications = about?.certifications || [];

  return (
    <>
      <SeoMeta
        title={seo.metaTitle || t('about.title')}
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
        jsonld={{ '@context': 'https://schema.org', '@type': 'AboutPage', name: t('about.title'), isPartOf: { '@type': 'WebSite', name: 'Delta Harvest', url: 'https://deltaharvest.com' } }}
      />

      <div className="about-page">
        {/* Page Cover */}
        <PageCover
          pageKey="about"
          fallbackTitle={t('about.title')}
          fallbackSubtitle={t('about.subtitle')}
        />

        {/* Company Story */}
        <section className="section story-section">
          <div className="container story-grid">
            <div className="story-content reveal">
              <h2>{t('about.storyTitle')}</h2>
              <p>{about?.storyText1?.[lang] || t('about.storyText1')}</p>
              <p>{about?.storyText2?.[lang] || t('about.storyText2')}</p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section mv-section">
          <div className="container mv-grid">
            <div className="mv-card glass-card reveal">
              <div className="mv-icon"><Target size={36} /></div>
              <h3>{t('about.mission')}</h3>
              <p>{about?.missionText?.[lang] || t('about.missionText')}</p>
            </div>
            <div className="mv-card glass-card reveal reveal-delay-2">
              <div className="mv-icon"><Eye size={36} /></div>
              <h3>{t('about.vision')}</h3>
              <p>{about?.visionText?.[lang] || t('about.visionText')}</p>
            </div>
          </div>
        </section>

        {/* Company Timeline */}
        {timelineEvents.length > 0 && (
          <section className="section timeline-section">
            <div className="container">
              <div className="section-header reveal">
                <h2>{language === 'ar' ? 'رحلتنا' : 'Our Journey'}</h2>
                <p>{language === 'ar' ? 'كيف نمت لنصبح واحدة من أبرز شركات التصدير الزراعي في مصر.' : "How we grew to become one of Egypt's leading agricultural exporters."}</p>
              </div>
              <div className="timeline">
                {timelineEvents.map((evt, i) => (
                  <div key={i} className={`timeline-item reveal ${i % 2 === 0 ? 'left' : 'right'}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content glass-card">
                      <span className="timeline-year">{evt.year}</span>
                      <h3>{resolveField(evt.title, lang)}</h3>
                      <p>{resolveField(evt.description, lang)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certifications & Quality */}
        {certifications.length > 0 && (
          <section className="section cert-section">
            <div className="container">
              <div className="section-header reveal">
                <h2>{t('about.certTitle')}</h2>
                <p>{t('about.certSubtitle')}</p>
              </div>
              <div className="cert-grid">
                {certifications.map((cert, i) => {
                  const isFile = cert.type === 'image' || cert.type === 'pdf';
                  const certName = typeof cert.name === 'object' ? (cert.name[lang] || cert.name.en || '') : cert.name;
                  if (isFile) return (
                    <a key={i} href={cert.url} target="_blank" rel="noopener noreferrer" className={`cert-card cert-card-file glass-card reveal ${i > 0 ? `reveal-delay-${i + 1}` : ''}`}>
                      <div className="cert-icon">
                        {cert.type === 'pdf' ? <FileText size={40} /> : <img src={cert.url} alt={certName} className="cert-file-thumb" loading="lazy" decoding="async" />}
                      </div>
                      <h3>{certName}</h3>
                      <span className="cert-view-link"><ExternalLink size={14} /> {language === 'ar' ? 'عرض' : 'View'}</span>
                    </a>
                  );
                  return (
                    <div key={i} className={`cert-card glass-card reveal ${i > 0 ? `reveal-delay-${i + 1}` : ''}`}>
                      <div className="cert-icon">
                        {i % 2 === 0 ? <ShieldCheck size={40} /> : <Award size={40} />}
                      </div>
                      <h3>{certName}</h3>
                      <p>{resolveField(cert.description, lang)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default About;
