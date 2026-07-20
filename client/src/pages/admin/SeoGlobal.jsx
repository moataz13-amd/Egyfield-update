import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { Save, Globe, AlertTriangle } from 'lucide-react';

const SeoGlobal = () => {
  const { t, language } = useContext(LanguageContext);
  const isAr = language === 'ar';
  const [form, setForm] = useState({
    metaTitle: '', metaDescription: '', keywords: [],
    ogTitle: '', ogDescription: '', ogImage: '',
    twitterTitle: '', twitterDescription: '', twitterImage: '',
    googleAnalyticsId: '', googleTagManagerId: '', googleSearchConsoleVerification: '',
    facebookPixel: '', microsoftClarity: '',
    organizationName: '', logo: '', favicon: '',
    businessAddress: '', phone: '', email: '',
    socialLinks: '',
    robotsTxt: '',
    hreflangEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/seo/global').then(res => {
      if (res.data) {
        const s = res.data;
        setForm({
          metaTitle: s.metaTitle || '', metaDescription: s.metaDescription || '', keywords: s.keywords || [],
          ogTitle: s.ogTitle || '', ogDescription: s.ogDescription || '', ogImage: s.ogImage || '',
          twitterTitle: s.twitterTitle || '', twitterDescription: s.twitterDescription || '', twitterImage: s.twitterImage || '',
          googleAnalyticsId: s.googleAnalyticsId || '', googleTagManagerId: s.googleTagManagerId || '', googleSearchConsoleVerification: s.googleSearchConsoleVerification || '',
          facebookPixel: s.facebookPixel || '', microsoftClarity: s.microsoftClarity || '',
          organizationName: s.organizationName || '', logo: s.logo || '', favicon: s.favicon || '',
          businessAddress: s.businessAddress || '', phone: s.phone || '', email: s.email || '',
          socialLinks: s.socialLinks || '',
          robotsTxt: s.robotsTxt || '',
          hreflangEnabled: s.hreflangEnabled || false,
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/seo/global', form);
      toast.success(isAr ? 'تم حفظ الإعدادات العامة لتحسين محركات البحث' : 'Global SEO settings saved');
    } catch {
      toast.error(isAr ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">{isAr ? 'جار التحميل...' : 'Loading...'}</div>;

  const Input = ({ label, value, field, type = 'text', multiline = false, placeholder = '' }) => (
    <div className="admin-form-group">
      <label className="admin-form-label">{label}</label>
      {multiline ? (
        <textarea className="admin-form-control admin-form-textarea" value={value} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} rows={4} />
      ) : (
        <input className="admin-form-control" type={type} value={value} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} />
      )}
    </div>
  );

  return (
    <>
      <Helmet><title>{isAr ? 'الإعدادات العامة لتحسين محركات البحث — إيجي فيلد' : 'Global SEO Settings — EgyField'}</title></Helmet>
      <div className="admin-settings-page">
        <div className="admin-card">
          <div className="admin-card-header"><Globe size={20} /><h2>{isAr ? 'الإعدادات العامة لتحسين محركات البحث' : 'Global SEO Settings'}</h2></div>
          <div className="admin-card-body">
            <div className="settings-section">
              <h3>{isAr ? 'البيانات الوصفية الأساسية' : 'Basic Meta Tags'}</h3>
              <div className="settings-grid">
                <Input label={isAr ? 'عنوان الموقع (Meta Title)' : 'Website Meta Title'} value={form.metaTitle} field="metaTitle" />
                <Input label={isAr ? 'الوصف (Meta Description)' : 'Meta Description'} value={form.metaDescription} field="metaDescription" multiline />
                <Input label={isAr ? 'الكلمات المفتاحية (مفصولة بفواصل)' : 'Keywords (comma-separated)'} value={form.keywords.join(', ')} field="keywords" placeholder={isAr ? 'مثال: صادرات مصرية, محاصيل طازجة' : 'egyptian exports, fresh crops'} onChange={(e) => setForm({ ...form, keywords: e.target.value.split(',').map(k => k.trim()) })} />
              </div>
            </div>

            <div className="settings-section">
              <h3>{isAr ? 'تحسين محركات البحث لوسائل التواصل الاجتماعي' : 'Social Media SEO'}</h3>
              <div className="settings-grid">
                <Input label={isAr ? 'عنوان Open Graph' : 'OG Title'} value={form.ogTitle} field="ogTitle" />
                <Input label={isAr ? 'وصف Open Graph' : 'OG Description'} value={form.ogDescription} field="ogDescription" multiline />
                <Input label={isAr ? 'صورة Open Graph (رابط URL)' : 'OG Image URL'} value={form.ogImage} field="ogImage" />
                <Input label={isAr ? 'عنوان Twitter' : 'Twitter Title'} value={form.twitterTitle} field="twitterTitle" />
                <Input label={isAr ? 'وصف Twitter' : 'Twitter Description'} value={form.twitterDescription} field="twitterDescription" multiline />
                <Input label={isAr ? 'صورة Twitter (رابط URL)' : 'Twitter Image URL'} value={form.twitterImage} field="twitterImage" />
              </div>
            </div>

            <div className="settings-section">
              <h3>{isAr ? 'بيانات المنظمة (Schema.org)' : 'Organization Data (Schema.org)'}</h3>
              <div className="settings-grid">
                <Input label={isAr ? 'اسم المنظمة' : 'Organization Name'} value={form.organizationName} field="organizationName" />
                <Input label={isAr ? 'شعار المنظمة (رابط URL)' : 'Logo URL'} value={form.logo} field="logo" />
                <Input label={isAr ? 'رمز الموقع المفضل (Favicon URL)' : 'Favicon URL'} value={form.favicon} field="favicon" />
                <Input label={isAr ? 'عنوان الشركة' : 'Business Address'} value={form.businessAddress} field="businessAddress" />
                <Input label={isAr ? 'رقم الهاتف' : 'Phone'} value={form.phone} field="phone" />
                <Input label={isAr ? 'البريد الإلكتروني' : 'Email'} value={form.email} field="email" type="email" />
                <Input label={isAr ? 'روابط التواصل الاجتماعي (سطر واحد لكل رابط)' : 'Social Links (one per line)'} value={form.socialLinks} field="socialLinks" multiline placeholder={isAr ? 'https://facebook.com/egyfield\nhttps://instagram.com/egyfield' : 'https://facebook.com/egyfield\nhttps://instagram.com/egyfield'} />
              </div>
            </div>

            <div className="settings-section">
              <h3>{isAr ? 'أكواد التتبع والتحليلات' : 'Tracking & Analytics Codes'}</h3>
              <div className="settings-grid">
                <Input label="Google Analytics ID" value={form.googleAnalyticsId} field="googleAnalyticsId" placeholder="G-XXXXXXXXXX" />
                <Input label="Google Tag Manager ID" value={form.googleTagManagerId} field="googleTagManagerId" placeholder="GTM-XXXXXXX" />
                <Input label="Google Search Console Verification" value={form.googleSearchConsoleVerification} field="googleSearchConsoleVerification" placeholder="XXXXXXXX" />
                <Input label="Facebook Pixel ID" value={form.facebookPixel} field="facebookPixel" placeholder="XXXXXXXXXXXXXXX" />
                <Input label="Microsoft Clarity ID" value={form.microsoftClarity} field="microsoftClarity" placeholder="XXXXXXXXXX" />
              </div>
            </div>

            <div className="settings-section">
              <h3>{isAr ? 'الإعدادات المتقدمة' : 'Advanced Settings'}</h3>
              <div className="settings-grid">
                <Input label={isAr ? 'نص robots.txt المخصص' : 'Custom robots.txt'} value={form.robotsTxt} field="robotsTxt" multiline placeholder={isAr ? 'اترك فارغاً لاستخدام الافتراضي' : 'Leave empty to use default'} />
                <div className="admin-form-group">
                  <label className="admin-form-label">{isAr ? 'تفعيل hreflang' : 'Enable hreflang'}</label>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={form.hreflangEnabled} onChange={e => setForm({ ...form, hreflangEnabled: e.target.checked })} />
                    <span className="admin-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="admin-card-footer">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? (isAr ? 'جار الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeoGlobal;
