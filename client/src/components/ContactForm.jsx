import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { createInquiry } from '../services/api';
import { Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './ContactForm.css';

const ContactForm = ({ productInterest = '' }) => {
  const { t } = useLanguage();
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
      <div className="contact-form-success">
        <CheckCircle size={48} />
        <h3>{t('contact.success')}</h3>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-row">
        <div className="form-group">
          <label htmlFor="contact-name">{t('contact.name')} *</label>
          <input
            type="text"
            id="contact-name"
            name="name"
            className="form-control"
            placeholder={t('contact.name')}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">{t('contact.email')} *</label>
          <input
            type="email"
            id="contact-email"
            name="email"
            className="form-control"
            placeholder={t('contact.email')}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="form-group">
          <label htmlFor="contact-company">{t('contact.company')}</label>
          <input
            type="text"
            id="contact-company"
            name="company"
            className="form-control"
            placeholder={t('contact.company')}
            value={formData.company}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-country">{t('contact.country')}</label>
          <input
            type="text"
            id="contact-country"
            name="country"
            className="form-control"
            placeholder={t('contact.country')}
            value={formData.country}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contact-interest">{t('contact.interest')}</label>
        <input
          type="text"
          id="contact-interest"
          name="productInterest"
          className="form-control"
          placeholder={t('contact.interest')}
          value={formData.productInterest}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact-message">{t('contact.message')} *</label>
        <textarea
          id="contact-message"
          name="message"
          className="form-control"
          placeholder={t('contact.message')}
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-lg contact-form-submit" disabled={loading}>
        {loading ? (
          <span>{t('contact.sending')}</span>
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
