import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import ContactForm from '../components/ContactForm';
import PageCover from '../components/PageCover';
import { MapPin, Phone, Mail, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);
  const isAr = language === 'ar';

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
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

  const contactCards = [
    {
      icon: <MapPin size={22} />,
      title: t('contact.address'),
      value: addressVal,
      link: `https://maps.google.com/?q=${encodeURIComponent(settings?.address?.en || 'Cairo, Egypt')}`,
      color: '#7BB445',
      bg: 'rgba(123, 180, 69, 0.08)',
    },
    {
      icon: <Phone size={22} />,
      title: t('contact.phone'),
      value: phoneVal,
      link: `tel:${phoneVal.replace(/\s+/g, '')}`,
      color: '#5BA8C8',
      bg: 'rgba(91, 168, 200, 0.08)',
    },
    {
      icon: <Mail size={22} />,
      title: t('contact.emailLabel'),
      value: emailVal,
      link: `mailto:${emailVal}`,
      color: '#D4A843',
      bg: 'rgba(212, 168, 67, 0.08)',
    },
    {
      icon: <Clock size={22} />,
      title: isAr ? 'ساعات العمل' : 'Working Hours',
      value: isAr ? 'الأحد – الخميس • ٩ ص – ٥ م' : 'Sun – Thu • 9 AM – 5 PM',
      link: null,
      color: '#9B6DD7',
      bg: 'rgba(155, 109, 215, 0.08)',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} — {settings?.companyName?.[currentLang] || 'EgyField'}</title>
        <meta name="description" content="Get in touch with EgyField export team for premium agricultural crop orders, custom packaging, and export quotes." />
      </Helmet>

      <div className="contact-page">
        {/* ===== Page Cover ===== */}
        <PageCover
          pageKey="contact"
          fallbackTitle={t('contact.title')}
          fallbackSubtitle={t('contact.subtitle')}
        />

        {/* ===== Contact Info Strip ===== */}
        <div className="contact-info-strip">
          <div className="container">
            <div className="contact-info-grid">
              {contactCards.map((card, i) => (
                <a
                  key={i}
                  href={card.link || '#'}
                  target={card.link?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`contact-info-card reveal reveal-delay-${i + 1}`}
                  onClick={card.link ? undefined : (e) => e.preventDefault()}
                >
                  <div className="contact-info-card-icon" style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="contact-info-card-body">
                    <span className="contact-info-card-label">{card.title}</span>
                    <span className="contact-info-card-value">{card.value}</span>
                  </div>
                  {card.link && (
                    <ArrowUpRight size={16} className="contact-info-card-arrow" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Form Section ===== */}
        <div className="contact-main-section">
          <div className="container">
            <div className="contact-main-grid">
              {/* Left: Rich Text */}
              <div className="contact-main-left reveal">
                <h2>
                  {isAr ? 'أرسل لنا رسالتك' : 'Send us a message'}
                </h2>
                <p className="contact-main-desc">
                  {isAr
                    ? 'سواء كان لديك استفسار عن التعبئة المخصصة، أو الطلبات بالجملة، أو مواعيد المواسم الزراعية — فريقنا جاهز للرد خلال ٢٤ ساعة.'
                    : 'Whether you have questions about custom packaging, bulk orders, or crop seasons — our export team is ready to respond within 24 hours.'}
                </p>

                <div className="contact-features-list">
                  {(isAr
                    ? [
                        'رد سريع خلال ٢٤ ساعة',
                        'دعم فني متعدد اللغات',
                        'عروض أسعار تنافسية',
                        'استشارات مجانية للتصدير',
                      ]
                    : [
                        'Fast response within 24 hours',
                        'Multilingual support team',
                        'Competitive export pricing',
                        'Free export consultations',
                      ]
                  ).map((feat, i) => (
                    <div key={i} className="contact-feature-item">
                      <div className="contact-feature-check">✓</div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Form */}
              <div className="contact-main-right reveal reveal-delay-2">
                <div className="contact-form-wrapper">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
