import { useState, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { createInquiry } from '../services/api';
import { Send, CheckCircle, User, Mail, Building, Globe, Tag, MessageSquare, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import countries from '../utils/countries';
import './ContactForm.css';

const ContactForm = ({ productInterest = '' }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    productInterest,
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createInquiry(formData);
      setSuccess(true);
      toast.success(t('contact.success'));
      setFormData({
        name: '',
        email: '',
        company: '',
        country: '',
        productInterest: '',
        message: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      toast.error(t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="contact-form-success" style={{ padding: '40px 20px' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(123, 180, 69, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          margin: '0 auto 20px',
          animation: 'pulse 2s infinite'
        }}>
          <CheckCircle size={44} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--dark)', marginBottom: 12 }}>
          {t('contact.success')}
        </h3>
        <p style={{ color: 'var(--text-gray)', maxWidth: 300, margin: '0 auto' }}>
          {isAr 
            ? 'نشكرك على تواصلك معنا. سيقوم فريق التصدير بمراجعة طلبك والرد عليك في أقرب وقت.' 
            : 'Thank you for reaching out. Our export team will review your inquiry and get back to you shortly.'}
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3 className="contact-form-title" style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--dark)', marginBottom: 24 }}>
        {isAr ? 'بيانات الاستفسار' : 'Inquiry Details'}
      </h3>

      <div className="contact-form-row">
        <div className="form-group">
          <label htmlFor="contact-name">{t('contact.name')} *</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              type="text"
              id="contact-name"
              name="name"
              className="form-control"
              placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">{t('contact.email')} *</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              id="contact-email"
              name="email"
              className="form-control"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="contact-form-row">
        <div className="form-group">
          <label htmlFor="contact-company">{t('contact.company')}</label>
          <div className="input-with-icon">
            <Building size={18} className="input-icon" />
            <input
              type="text"
              id="contact-company"
              name="company"
              className="form-control"
              placeholder={isAr ? 'اسم الشركة' : 'Company Name'}
              value={formData.company}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="contact-country">{t('contact.country')}</label>
          <div className="input-with-icon">
            <Globe size={18} className="input-icon" />
            <select
              id="contact-country"
              name="country"
              className="form-control"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="">{isAr ? '— اختر الدولة —' : '— Select Country —'}</option>
              {countries.map((c) => (
                <option key={c.en} value={c.en}>
                  {isAr ? c.ar : c.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contact-interest">{t('contact.interest')}</label>
        <div className="input-with-icon">
          <Tag size={18} className="input-icon" />
          <input
            type="text"
            id="contact-interest"
            name="productInterest"
            className="form-control"
            placeholder={isAr ? 'مثال: البصل الذهبي، البرتقال أبو صرة...' : 'e.g. Yellow Onions, Navel Oranges...'}
            value={formData.productInterest}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label htmlFor="contact-message">{t('contact.message')} *</label>
        <div className="input-with-icon" style={{ alignItems: 'flex-start' }}>
          <MessageSquare size={18} className="input-icon" style={{ marginTop: 16 }} />
          <textarea
            id="contact-message"
            name="message"
            className="form-control"
            placeholder={isAr ? 'اكتب تفاصيل طلبك أو استفسارك هنا...' : 'Write details of your order or inquiries here...'}
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            style={{ paddingLeft: isAr ? 18 : 46, paddingRight: isAr ? 46 : 18 }}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg contact-form-submit" disabled={loading} style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer'
      }}>
        {loading ? (
          <>
            <Loader size={18} className="spin" />
            <span>{t('contact.sending')}</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>{t('contact.submit')}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
