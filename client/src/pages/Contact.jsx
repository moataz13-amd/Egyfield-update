import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import ContactForm from '../components/ContactForm';
import { MapPin, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => {});
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
  }, [settings]);

  const currentLang = language || 'en';

  const addressVal = settings?.address?.[currentLang] || settings?.address?.en || t('contact.addressText');
  const phoneVal = settings?.phone || t('contact.phoneText');
  const emailVal = settings?.email || t('contact.emailText');

  const contactInfos = [
    {
      icon: <MapPin size={24} />,
      title: t('contact.address'),
      value: addressVal,
      link: `https://maps.google.com/?q=${encodeURIComponent(settings?.address?.en || 'Cairo, Egypt')}`,
    },
    {
      icon: <Phone size={24} />,
      title: t('contact.phone'),
      value: phoneVal,
      link: `tel:${phoneVal.replace(/\s+/g, '')}`,
    },
    {
      icon: <Mail size={24} />,
      title: t('contact.emailLabel'),
      value: emailVal,
      link: `mailto:${emailVal}`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} — {settings?.companyName?.[currentLang] || 'EgyField'}</title>
        <meta name="description" content="Get in touch with EgyField export team for bulk premium agricultural crop orders, custom packaging options, and export quotes." />
      </Helmet>

      <div className="contact-page">
        {/* Page Header */}
        <div className="contact-hero">
          <div className="container">
            <h1>{t('contact.title')}</h1>
            <p>{t('contact.subtitle')}</p>
          </div>
        </div>

        <div className="container contact-container">
          <div className="contact-grid">
            {/* Contact Info Cards */}
            <div className="contact-info-panel reveal">
              <h2>{t('contact.formTitle')}</h2>
              <p className="contact-info-intro">
                Have inquiries about custom packaging, bulk orders, or product seasons? Reach out to us. We will get back to you within 24 hours.
              </p>
              <div className="contact-cards">
                {contactInfos.map((info, i) => (
                  <a
                    key={i}
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card glass-card"
                  >
                    <div className="contact-card-icon">{info.icon}</div>
                    <div className="contact-card-details">
                      <h3>{info.title}</h3>
                      <p>{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form Panel */}
            <div className="contact-form-panel reveal reveal-delay-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
