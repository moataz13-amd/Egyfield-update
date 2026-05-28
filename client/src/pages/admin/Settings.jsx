import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { Save, Lock, Settings as SettingsIcon, Share2, Info, Search, Loader } from 'lucide-react';

const Settings = () => {
  const { t, language } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: { en: 'EgyField', ar: 'إيجي فيلد' },
    tagline: { en: '', ar: '' },
    foundedYear: 2015,
    email: '',
    phone: '',
    whatsapp: '',
    address: { en: '', ar: '' },
    social: { facebook: '', instagram: '', linkedin: '', youtube: '' },
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/admin/settings');
        if (data) setSettings(data);
      } catch {
        toast.error(language === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [language]);

  const handleChange = (tab, field, value, nestedField = null) => {
    setSettings(prev => {
      const updated = { ...prev };
      if (nestedField) {
        updated[tab] = { ...updated[tab], [field]: { ...updated[tab][field], [nestedField]: value } };
      } else if (typeof updated[tab] === 'object' && !Array.isArray(updated[tab])) {
        updated[tab] = { ...updated[tab], [field]: value };
      } else {
        updated[field] = value;
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings updated successfully!');
    } catch {
      toast.error(language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || (language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 400 }} /></div>;

  return (
    <>
      <Helmet><title>{t('admin.settings')} — EgyField Admin</title></Helmet>

      {/* Tabs list */}
      <div className="settings-tabs">
        <button className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
          {language === 'ar' ? 'بيانات ملف الشركة' : 'General'}
        </button>
        <button className={`settings-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
          {language === 'ar' ? 'بيانات الاتصال' : 'Contact Info'}
        </button>
        <button className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
          {language === 'ar' ? 'روابط التواصل' : 'Social Links'}
        </button>
        <button className={`settings-tab ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>
          {language === 'ar' ? 'إعدادات SEO' : 'SEO Config'}
        </button>
        <button className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
          {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
        </button>
      </div>

      <div className="admin-data-table-wrapper" style={{ padding: 28 }}>
        {activeTab !== 'password' ? (
          <form onSubmit={handleSave}>
            {/* General Tab */}
            {activeTab === 'general' && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                  <Info size={18} /> {language === 'ar' ? 'إعدادات ملف الشركة التعريفية' : 'Company Profile Settings'}
                </h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'اسم الشركة (بالإنجليزية)' : 'Company Name (English)'}</label>
                    <input className="admin-form-control" value={settings.companyName?.en || ''} onChange={e => handleChange('companyName', 'en', e.target.value)} required />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'اسم الشركة (بالعربية)' : 'Company Name (Arabic)'}</label>
                    <input className="admin-form-control" value={settings.companyName?.ar || ''} onChange={e => handleChange('companyName', 'ar', e.target.value)} required style={{ direction: 'rtl' }} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'الشعار اللفظي (بالإنجليزية)' : 'Tagline (English)'}</label>
                    <input className="admin-form-control" value={settings.tagline?.en || ''} onChange={e => handleChange('tagline', 'en', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'الشعار اللفظي (بالعربية)' : 'Tagline (Arabic)'}</label>
                    <input className="admin-form-control" value={settings.tagline?.ar || ''} onChange={e => handleChange('tagline', 'ar', e.target.value)} style={{ direction: 'rtl' }} />
                  </div>
                </div>
                <div className="admin-form-group" style={{ maxWidth: 200 }}>
                  <label>{language === 'ar' ? 'سنة التأسيس' : 'Founded Year'}</label>
                  <input type="number" className="admin-form-control" value={settings.foundedYear || 2015} onChange={e => setSettings(p => ({ ...p, foundedYear: parseInt(e.target.value) }))} />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                  <SettingsIcon size={18} /> {language === 'ar' ? 'تفاصيل قنوات الاتصال' : 'Communication Details'}
                </h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'البريد الإلكتروني الرئيسي' : 'Primary Email Address'}</label>
                    <input type="email" className="admin-form-control" value={settings.email || ''} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                    <input className="admin-form-control" value={settings.phone || ''} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'رقم واتساب (استفسارات التصدير)' : 'WhatsApp Number (Export Inquiries)'}</label>
                    <input className="admin-form-control" value={settings.whatsapp || ''} onChange={e => setSettings(p => ({ ...p, whatsapp: e.target.value }))} />
                  </div>
                  <div className="admin-form-group" />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'عنوان المكتب (بالإنجليزية)' : 'Office Address (English)'}</label>
                    <input className="admin-form-control" value={settings.address?.en || ''} onChange={e => handleChange('address', 'en', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'عنوان المكتب (بالعربية)' : 'Office Address (Arabic)'}</label>
                    <input className="admin-form-control" value={settings.address?.ar || ''} onChange={e => handleChange('address', 'ar', e.target.value)} style={{ direction: 'rtl' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                  <Share2 size={18} /> {language === 'ar' ? 'روابط صفحات التواصل الاجتماعي' : 'Social Media Accounts'}
                </h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'رابط صفحة فيسبوك' : 'Facebook Page Link'}</label>
                    <input className="admin-form-control" value={settings.social?.facebook || ''} onChange={e => handleChange('social', 'facebook', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'رابط حساب إنستجرام' : 'Instagram Handle / Link'}</label>
                    <input className="admin-form-control" value={settings.social?.instagram || ''} onChange={e => handleChange('social', 'instagram', e.target.value)} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'رابط حساب لينكد إن' : 'LinkedIn Corporate Link'}</label>
                    <input className="admin-form-control" value={settings.social?.linkedin || ''} onChange={e => handleChange('social', 'linkedin', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'رابط قناة يوتيوب' : 'YouTube Channel Link'}</label>
                    <input className="admin-form-control" value={settings.social?.youtube || ''} onChange={e => handleChange('social', 'youtube', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Config */}
            {activeTab === 'seo' && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                  <Search size={18} /> {language === 'ar' ? 'تهيئة محركات البحث (SEO)' : 'Search Engine Optimization (SEO)'}
                </h4>
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'عنوان الصفحة الرئيسي (Meta Title)' : 'Meta Header Title'}</label>
                  <input className="admin-form-control" value={settings.seo?.metaTitle || ''} onChange={e => handleChange('seo', 'metaTitle', e.target.value)} required />
                </div>
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'وصف الصفحة (Meta Description)' : 'Meta Page Description'}</label>
                  <textarea className="admin-form-control" value={settings.seo?.metaDescription || ''} onChange={e => handleChange('seo', 'metaDescription', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'الكلمات الدلالية المفتاحية (مفصولة بفاصلة)' : 'Meta Keywords (comma-separated)'}</label>
                  <input className="admin-form-control" value={settings.seo?.keywords?.join(', ') || ''} onChange={e => handleChange('seo', 'keywords', e.target.value.split(',').map(k => k.trim()))} placeholder="egyptian exports, fresh crops, frozen green peas" />
                </div>
              </div>
            )}

            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving} style={{ marginTop: 16 }}>
              {saving ? <Loader size={16} className="spin" /> : <><Save size={16} /> {t('admin.saveChanges')}</>}
            </button>
          </form>
        ) : (
          /* Change Password Form */
          <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 440 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
              <Lock size={18} /> {language === 'ar' ? 'تعديل بيانات تسجيل الدخول للادمن' : 'Modify Admin Credentials'}
            </h4>
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
              <input type="password" className="admin-form-control" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
              <input type="password" className="admin-form-control" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} required />
            </div>
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
              <input type="password" className="admin-form-control" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving} style={{ marginTop: 16 }}>
              {saving ? <Loader size={16} className="spin" /> : <><Save size={16} /> {language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}</>}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default Settings;
