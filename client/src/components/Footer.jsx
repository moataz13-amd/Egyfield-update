import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Mail, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  const currentLang = language || 'en';

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,30 1440,50 L1440,100 L0,100 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <Logo className="footer-logo-img" variant="light" />
              </div>
              <p className="footer-description">
                {settings?.tagline?.[currentLang] || settings?.tagline?.en || t('footer.description')}
              </p>
              <div className="footer-socials">
                <a href={settings?.social?.facebook || "#"} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href={settings?.social?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href={settings?.social?.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                {settings?.social?.youtube && (
                  <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="footer-section">
              <h4>{t('footer.quickLinks')}</h4>
              <ul>
                <li><Link to="/">{t('nav.home')}</Link></li>
                <li><Link to="/products">{t('nav.products')}</Link></li>
                <li><Link to="/about">{t('nav.about')}</Link></li>
                <li><Link to="/contact">{t('nav.contact')}</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>{t('footer.contactInfo')}</h4>
              <ul className="footer-contact-list">
                <li>
                  <MapPin size={16} />
                  <span>
                    {settings?.address?.[currentLang] || settings?.address?.en || t('contact.addressText')}
                  </span>
                </li>
                <li>
                  <Phone size={16} />
                  <span>
                    {settings?.phone || t('contact.phoneText')}
                  </span>
                </li>
                <li>
                  <Mail size={16} />
                  <span>
                    {settings?.email || t('contact.emailText')}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>{t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
