import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { Save, Globe, Search, Share2, BarChart3, Building, Code } from 'lucide-react';

const SeoGlobal = () => {
  const { t, language } = useContext(LanguageContext);
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState('basic');
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
      toast.success(isAr ? 'تم حفظ الإعدادات العامة' : 'Global SEO settings saved');
    } catch {
      toast.error(isAr ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">{isAr ? 'جار التحميل...' : 'Loading...'}</div>;

  const Input = ({ label, value, field, type = 'text', multiline = false, placeholder = '' }) => (
    <div className="admin-form-group">
      <label>{label}</label>
      {multiline ? (
        <textarea className="admin-form-control" value={value} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} rows={4} />
      ) : (
        <input className="admin-form-control" type={type} value={value} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} />
      )}
    </div>
  );

  return (
    <>
      <Helmet><title>{isAr ? 'الإعدادات العامة لتحسين محركات البحث' : 'Global SEO'} — Delta Harvest Admin</title></Helmet>

      <div className="settings-tabs">
        <button className={`settings-tab ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}><Search size={14} /> {isAr ? 'أساسي' : 'Basic Meta'}</button>
        <button className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}><Share2 size={14} /> {isAr ? 'تواصل اجتماعي' : 'Social Meta'}</button>
        <button className={`settings-tab ${activeTab === 'org' ? 'active' : ''}`} onClick={() => setActiveTab('org')}><Building size={14} /> {isAr ? 'المنظمة' : 'Organization'}</button>
        <button className={`settings-tab ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}><BarChart3 size={14} /> {isAr ? 'تتبع' : 'Tracking'}</button>
        <button className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}><Code size={14} /> {isAr ? 'متقدم' : 'Advanced'}</button>
      </div>

      <div className="admin-data-table-wrapper" style={{ padding: 28 }}>
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {activeTab === 'basic' && (
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                <Search size={18} /> {isAr ? 'البيانات الوصفية الأساسية' : 'Basic Meta Tags'}
              </h4>
              <div className="admin-form-group">
                <label>{isAr ? 'عنوان الموقع (Meta Title)' : 'Website Meta Title'}</label>
                <input className="admin-form-control" value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'الوصف (Meta Description)' : 'Meta Description'}</label>
                <textarea className="admin-form-control" value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} rows={3} />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'الكلمات المفتاحية (مفصولة بفواصل)' : 'Keywords (comma-separated)'}</label>
                <input className="admin-form-control" value={form.keywords.join(', ')} onChange={e => setForm({ ...form, keywords: e.target.value.split(',').map(k => k.trim()) })} placeholder="egyptian exports, fresh crops" />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                <Share2 size={18} /> {isAr ? 'تحسين محركات البحث لوسائل التواصل الاجتماعي' : 'Social Media SEO'}
              </h4>
              <div className="admin-form-row">
                <Input label={isAr ? 'عنوان Open Graph' : 'OG Title'} value={form.ogTitle} field="ogTitle" />
                <Input label={isAr ? 'وصف Open Graph' : 'OG Description'} value={form.ogDescription} field="ogDescription" multiline />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'صورة Open Graph (رابط URL)' : 'OG Image URL'}</label>
                <input className="admin-form-control" value={form.ogImage} onChange={e => setForm({ ...form, ogImage: e.target.value })} placeholder="https://deltaharvest.com/src/assets/Delta%20Harvest-8.png" />
              </div>
              <div className="admin-form-row">
                <Input label={isAr ? 'عنوان Twitter' : 'Twitter Title'} value={form.twitterTitle} field="twitterTitle" />
                <Input label={isAr ? 'وصف Twitter' : 'Twitter Description'} value={form.twitterDescription} field="twitterDescription" multiline />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'صورة Twitter (رابط URL)' : 'Twitter Image URL'}</label>
                <input className="admin-form-control" value={form.twitterImage} onChange={e => setForm({ ...form, twitterImage: e.target.value })} placeholder="https://deltaharvest.com/src/assets/Delta%20Harvest-8.png" />
              </div>
            </div>
          )}

          {activeTab === 'org' && (
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                <Building size={18} /> {isAr ? 'بيانات المنظمة (Schema.org)' : 'Organization Data (Schema.org)'}
              </h4>
              <div className="admin-form-row">
                <Input label={isAr ? 'اسم المنظمة' : 'Organization Name'} value={form.organizationName} field="organizationName" />
                <Input label={isAr ? 'شعار المنظمة (رابط URL)' : 'Logo URL'} value={form.logo} field="logo" />
              </div>
              <div className="admin-form-row">
                <Input label={isAr ? 'أيقونة الموقع (Favicon URL)' : 'Favicon URL'} value={form.favicon} field="favicon" />
                <Input label={isAr ? 'عنوان الشركة' : 'Business Address'} value={form.businessAddress} field="businessAddress" />
              </div>
              <div className="admin-form-row">
                <Input label={isAr ? 'رقم الهاتف' : 'Phone'} value={form.phone} field="phone" />
                <Input label={isAr ? 'البريد الإلكتروني' : 'Email'} value={form.email} field="email" type="email" />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'روابط التواصل الاجتماعي (سطر لكل رابط)' : 'Social Links (one per line)'}</label>
                <textarea className="admin-form-control" value={form.socialLinks} onChange={e => setForm({ ...form, socialLinks: e.target.value })} rows={4} placeholder="https://facebook.com/deltaharvest\nhttps://instagram.com/deltaharvest" />
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                <BarChart3 size={18} /> {isAr ? 'أكواد التتبع والتحليلات' : 'Tracking & Analytics Codes'}
              </h4>
              <div className="admin-form-row">
                <Input label="Google Analytics ID" value={form.googleAnalyticsId} field="googleAnalyticsId" placeholder="G-XXXXXXXXXX" />
                <Input label="Google Tag Manager ID" value={form.googleTagManagerId} field="googleTagManagerId" placeholder="GTM-XXXXXXX" />
              </div>
              <div className="admin-form-row">
                <Input label="Google Search Console Verification" value={form.googleSearchConsoleVerification} field="googleSearchConsoleVerification" placeholder="XXXXXXXX" />
                <Input label="Facebook Pixel ID" value={form.facebookPixel} field="facebookPixel" placeholder="XXXXXXXXXXXXXXX" />
              </div>
              <div className="admin-form-group" style={{ maxWidth: 400 }}>
                <label>Microsoft Clarity ID</label>
                <input className="admin-form-control" value={form.microsoftClarity} onChange={e => setForm({ ...form, microsoftClarity: e.target.value })} placeholder="XXXXXXXXXX" />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                <Code size={18} /> {isAr ? 'الإعدادات المتقدمة' : 'Advanced Settings'}
              </h4>
              <div className="admin-form-group">
                <label>{isAr ? 'نص robots.txt المخصص' : 'Custom robots.txt'}</label>
                <textarea className="admin-form-control" value={form.robotsTxt} onChange={e => setForm({ ...form, robotsTxt: e.target.value })} rows={6} placeholder={isAr ? 'اترك فارغاً لاستخدام الافتراضي' : 'Leave empty to use default'} style={{ fontFamily: 'monospace', fontSize: 12 }} />
              </div>
              <hr style={{ border: '0', height: '1px', background: 'var(--admin-border)', margin: '24px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'rgba(123, 180, 69, 0.04)', borderRadius: 10, border: '1px solid var(--admin-border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--admin-text)', marginBottom: 4 }}>
                    {isAr ? 'تفعيل hreflang' : 'Enable hreflang'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                    {isAr ? 'إضافة روابط hreflang للغات المتعددة في رأس الصفحة' : 'Add hreflang links for all supported languages in page head'}
                  </div>
                </div>
                <label className="admin-toggle">
                  <input type="checkbox" checked={form.hreflangEnabled} onChange={e => setForm({ ...form, hreflangEnabled: e.target.checked })} />
                  <span className="admin-toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          <hr style={{ border: '0', height: '1px', background: 'var(--admin-border)', margin: '24px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? (isAr ? 'جار الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SeoGlobal;
