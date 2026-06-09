import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';
import { Save, Lock, Settings as SettingsIcon, Share2, Info, Search, Loader, Image as ImageIcon, Upload, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const SUPPORTED_LANGS = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'tr', name: 'Türkçe' },
];

const Settings = () => {
  const { t, language } = useContext(LanguageContext);
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(null);
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
    heroTitle: { en: '', ar: '', fr: '', it: '', tr: '' },
    heroSubtitle: { en: '', ar: '', fr: '', it: '', tr: '' },
    heroImage: { url: '', publicId: '' },
    heroImages: [],
    heroTitleColor: '#ffffff',
    heroSubtitleColor: '#ffffff',
    pageCovers: {
      products: { title: { en: 'Our Products', ar: 'منتجاتنا' }, subtitle: { en: '', ar: '' }, image: { url: '', publicId: '' }, enabled: false },
      about: { title: { en: 'About Us', ar: 'من نحن' }, subtitle: { en: '', ar: '' }, image: { url: '', publicId: '' }, enabled: false },
      contact: { title: { en: 'Contact Us', ar: 'تواصل معنا' }, subtitle: { en: '', ar: '' }, image: { url: '', publicId: '' }, enabled: false },
      articles: { title: { en: 'Articles & Insights', ar: 'المقالات والأخبار' }, subtitle: { en: '', ar: '' }, image: { url: '', publicId: '' }, enabled: false },
      partners: { title: { en: 'Our Partners', ar: 'شركاؤنا' }, subtitle: { en: '', ar: '' }, image: { url: '', publicId: '' }, enabled: false },
    },
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
        const targetTab = updated[tab] || {};
        const targetField = targetTab[field] || {};
        updated[tab] = {
          ...targetTab,
          [field]: {
            ...targetField,
            [nestedField]: value
          }
        };
      } else {
        const nestedFields = ['companyName', 'tagline', 'address', 'social', 'seo', 'heroTitle', 'heroSubtitle'];
        if (nestedFields.includes(tab) || (updated[tab] && typeof updated[tab] === 'object' && !Array.isArray(updated[tab]))) {
          updated[tab] = {
            ...(updated[tab] || {}),
            [field]: value
          };
        } else {
          updated[field] = value;
        }
      }
      return updated;
    });
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageUploading(true);
    const formData = new FormData();
    formData.append('heroImage', file);
    
    try {
      const { data } = await api.put('/admin/settings/hero-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data) {
        setSettings(data);
        toast.success(language === 'ar' ? 'تم رفع صورة الهيرو بنجاح!' : 'Hero image uploaded successfully!');
      }
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل رفع صورة الهيرو' : 'Failed to upload hero image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleHeroImageDelete = async () => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'حذف صورة الهيرو' : 'Delete Hero Image',
      message: language === 'ar' ? 'هل أنت متأكد من حذف صورة الهيرو؟' : 'Are you sure you want to delete the hero image?',
      type: 'danger'
    });
    if (!isConfirmed) return;
    
    setImageUploading(true);
    try {
      const { data } = await api.delete('/admin/settings/hero-image');
      if (data) {
        setSettings(data);
        toast.success(language === 'ar' ? 'تم حذف صورة الهيرو واستعادة الصورة الافتراضية' : 'Hero image deleted. Default restored.');
      }
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل حذف صورة الهيرو' : 'Failed to delete hero image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSliderImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageUploading(true);
    const formData = new FormData();
    formData.append('heroImage', file);
    
    try {
      const { data } = await api.post('/admin/settings/hero-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data) {
        setSettings(data);
        toast.success(language === 'ar' ? 'تم رفع صورة المعرض بنجاح!' : 'Slider image uploaded successfully!');
      }
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل رفع صورة المعرض' : 'Failed to upload slider image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSliderImageDelete = async (publicId) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'حذف الصورة' : 'Delete Image',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Are you sure you want to delete this image?',
      type: 'danger'
    });
    if (!isConfirmed) return;
    
    setImageUploading(true);
    try {
      const { data } = await api.delete('/admin/settings/hero-images', { data: { publicId } });
      if (data) {
        setSettings(data);
        toast.success(language === 'ar' ? 'تم حذف الصورة بنجاح!' : 'Image deleted successfully!');
      }
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل حذف الصورة' : 'Failed to delete image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', settings);
      if (data) setSettings(data);
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
        <button className={`settings-tab ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>
          {language === 'ar' ? 'قسم الهيرو' : 'Hero Section'}
        </button>
        <button className={`settings-tab ${activeTab === 'covers' ? 'active' : ''}`} onClick={() => setActiveTab('covers')}>
          {language === 'ar' ? 'أغلفة الصفحات' : 'Page Covers'}
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

                <hr style={{ border: '0', height: '1px', background: 'var(--admin-border)', margin: '24px 0' }} />

                {/* Partners Page Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'rgba(123, 180, 69, 0.04)', borderRadius: 10, border: '1px solid var(--admin-border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--admin-text)', marginBottom: 4 }}>
                      {language === 'ar' ? 'صفحة الشركاء' : 'Partners Page'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                      {language === 'ar' ? 'تفعيل أو إلغاء تفعيل صفحة الشركاء من الموقع والقوائم' : 'Enable or disable the Partners page from the website and navigation'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings(p => ({ ...p, isPartnersActive: !p.isPartnersActive }))}
                    style={{
                      border: 'none', background: 'none', cursor: 'pointer',
                      color: settings.isPartnersActive !== false ? 'var(--primary)' : 'var(--admin-text-muted)',
                      display: 'flex', alignItems: 'center', padding: 0
                    }}
                  >
                    {settings.isPartnersActive !== false ? <ToggleRight size={34} /> : <ToggleLeft size={34} />}
                  </button>
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

            {/* Hero Tab */}
            {activeTab === 'hero' && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                  <ImageIcon size={18} /> {language === 'ar' ? 'إعدادات قسم الهيرو التعريفي' : 'Hero Section Settings'}
                </h4>
                
                {/* Text Colors Management */}
                <div style={{ marginBottom: 32 }}>
                  <h5 style={{ marginBottom: 16, fontWeight: '600' }}>
                    {language === 'ar' ? 'ألوان النصوص' : 'Text Colors'}
                  </h5>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>{language === 'ar' ? 'لون العنوان الرئيسي' : 'Title Text Color'}</label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={settings.heroTitleColor || '#ffffff'} 
                          onChange={e => setSettings(p => ({ ...p, heroTitleColor: e.target.value }))}
                          style={{ width: 44, height: 38, padding: 0, border: '1px solid var(--admin-border)', borderRadius: 6, cursor: 'pointer' }}
                        />
                        <input 
                          type="text" 
                          className="admin-form-control" 
                          value={settings.heroTitleColor || '#ffffff'} 
                          onChange={e => setSettings(p => ({ ...p, heroTitleColor: e.target.value }))}
                          placeholder="#ffffff"
                          style={{ textTransform: 'uppercase', maxWidth: 120 }}
                        />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label>{language === 'ar' ? 'لون العنوان الفرعي' : 'Subtitle Text Color'}</label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={settings.heroSubtitleColor || '#ffffff'} 
                          onChange={e => setSettings(p => ({ ...p, heroSubtitleColor: e.target.value }))}
                          style={{ width: 44, height: 38, padding: 0, border: '1px solid var(--admin-border)', borderRadius: 6, cursor: 'pointer' }}
                        />
                        <input 
                          type="text" 
                          className="admin-form-control" 
                          value={settings.heroSubtitleColor || '#ffffff'} 
                          onChange={e => setSettings(p => ({ ...p, heroSubtitleColor: e.target.value }))}
                          placeholder="#ffffff"
                          style={{ textTransform: 'uppercase', maxWidth: 120 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr style={{ border: '0', height: '1px', background: 'var(--admin-border)', margin: '24px 0' }} />

                {/* Hero Slider Images Management */}
                <div className="admin-form-group" style={{ marginBottom: 32 }}>
                  <label style={{ fontWeight: '600', marginBottom: 16, display: 'block' }}>
                    {language === 'ar' ? 'معرض صور الخلفية للهيرو (سلايدر)' : 'Hero Background Slider Images'}
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {/* Render existing slider images */}
                    {settings.heroImages?.map((img, index) => (
                      <div key={img._id || index} style={{
                        height: 140,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid var(--admin-border)',
                        background: 'rgba(255,255,255,0.05)',
                        position: 'relative',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <img 
                          src={img.url} 
                          alt={`Slider ${index}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <button
                          type="button"
                          onClick={() => handleSliderImageDelete(img.publicId)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgba(220, 53, 69, 0.9)',
                            border: 'none',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#dc3545'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {/* Upload new image card */}
                    <label style={{
                      height: 140,
                      borderRadius: 12,
                      border: '2px dashed var(--admin-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.01)',
                      color: 'var(--admin-text-muted)',
                      transition: 'border-color 0.2s, background 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(123, 180, 69, 0.02)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--admin-border)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                    }}
                    >
                      {imageUploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <Loader size={24} className="spin" />
                          <span style={{ fontSize: 12 }}>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, textAlign: 'center' }}>
                          <Upload size={24} />
                          <span style={{ fontSize: 13, fontWeight: '600' }}>{language === 'ar' ? 'إضافة صورة جديدة' : 'Add New Image'}</span>
                          <span style={{ fontSize: 10, opacity: 0.7 }}>{language === 'ar' ? 'بأبعاد 1920×1080' : '1920x1080 Recommended'}</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSliderImageUpload} 
                        style={{ display: 'none' }} 
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </div>

                <hr style={{ border: '0', height: '1px', background: 'var(--admin-border)', margin: '24px 0' }} />

                {/* Hero Title and Subtitle inputs for all languages */}
                <h5 style={{ marginBottom: 16, fontWeight: '600' }}>
                  {language === 'ar' ? 'العناوين والنصوص التعريفية' : 'Title & Subtitle Translations'}
                </h5>

                {SUPPORTED_LANGS.map(lang => (
                  <div key={lang.code} style={{ 
                    padding: 16, 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--admin-border)', 
                    borderRadius: 8, 
                    marginBottom: 16 
                  }}>
                    <div style={{ fontWeight: '600', fontSize: 13, marginBottom: 12, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ padding: '2px 6px', background: 'rgba(123, 180, 69, 0.15)', borderRadius: 4, fontSize: 11 }}>{lang.code.toUpperCase()}</span>
                      {lang.name}
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12 }}>{language === 'ar' ? 'العنوان الرئيسي' : 'Main Title'}</label>
                      <input 
                        className="admin-form-control" 
                        value={settings.heroTitle?.[lang.code] || ''} 
                        onChange={e => handleChange('heroTitle', lang.code, e.target.value)} 
                        style={{ direction: lang.code === 'ar' ? 'rtl' : 'ltr' }}
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>{language === 'ar' ? 'العنوان الفرعي (الوصف)' : 'Subtitle'}</label>
                      <textarea 
                        className="admin-form-control" 
                        rows={2}
                        value={settings.heroSubtitle?.[lang.code] || ''} 
                        onChange={e => handleChange('heroSubtitle', lang.code, e.target.value)} 
                        style={{ direction: lang.code === 'ar' ? 'rtl' : 'ltr' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Page Covers Tab */}
            {activeTab === 'covers' && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px' }}>
                  <ImageIcon size={18} /> {language === 'ar' ? 'إدارة أغلفة الصفحات الداخلية' : 'Subpage Cover Banners'}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 24 }}>
                  {language === 'ar'
                    ? 'تحكم في العنوان والوصف وصورة الغلاف لكل صفحة داخلية. الصورة اختيارية — في حال عدم رفع صورة سيتم عرض تدرج لوني تلقائي.'
                    : 'Manage the title, subtitle, and cover image for each subpage. The image is optional — a gradient fallback is used when no image is uploaded.'}
                </p>

                {[
                  { key: 'products', labelEn: 'Products', labelAr: 'المنتجات' },
                  { key: 'about', labelEn: 'About Us', labelAr: 'من نحن' },
                  { key: 'contact', labelEn: 'Contact', labelAr: 'تواصل معنا' },
                  { key: 'articles', labelEn: 'Articles', labelAr: 'المقالات' },
                  { key: 'partners', labelEn: 'Partners', labelAr: 'الشركاء' },
                ].map(pg => {
                  const cover = settings.pageCovers?.[pg.key] || {};
                  return (
                    <div key={pg.key} style={{ border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20, marginBottom: 20, background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h5 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{language === 'ar' ? pg.labelAr : pg.labelEn}</h5>
                        <button type="button" onClick={() => {
                          setSettings(prev => {
                            const updated = { ...prev };
                            if (!updated.pageCovers) updated.pageCovers = {};
                            if (!updated.pageCovers[pg.key]) updated.pageCovers[pg.key] = {};
                            updated.pageCovers[pg.key] = { ...updated.pageCovers[pg.key], enabled: !cover.enabled };
                            return updated;
                          });
                        }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: cover.enabled ? 'var(--primary)' : 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontSize: 13, fontWeight: 600 }}>
                          {cover.enabled ? <><ToggleRight size={30} /> {language === 'ar' ? 'صورة مفعّلة' : 'Image Active'}</> : <><ToggleLeft size={30} /> {language === 'ar' ? 'صورة معطلة' : 'Image Disabled'}</>}
                        </button>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label style={{ fontSize: 12 }}>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                          <input className="admin-form-control" value={cover.title?.en || ''} onChange={e => { setSettings(prev => { const u = { ...prev }; if (!u.pageCovers) u.pageCovers = {}; if (!u.pageCovers[pg.key]) u.pageCovers[pg.key] = {}; u.pageCovers[pg.key].title = { ...(u.pageCovers[pg.key].title || {}), en: e.target.value }; return u; }); }} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontSize: 12 }}>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                          <input className="admin-form-control" style={{ direction: 'rtl' }} value={cover.title?.ar || ''} onChange={e => { setSettings(prev => { const u = { ...prev }; if (!u.pageCovers) u.pageCovers = {}; if (!u.pageCovers[pg.key]) u.pageCovers[pg.key] = {}; u.pageCovers[pg.key].title = { ...(u.pageCovers[pg.key].title || {}), ar: e.target.value }; return u; }); }} />
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label style={{ fontSize: 12 }}>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Subtitle (English)'}</label>
                          <input className="admin-form-control" value={cover.subtitle?.en || ''} onChange={e => { setSettings(prev => { const u = { ...prev }; if (!u.pageCovers) u.pageCovers = {}; if (!u.pageCovers[pg.key]) u.pageCovers[pg.key] = {}; u.pageCovers[pg.key].subtitle = { ...(u.pageCovers[pg.key].subtitle || {}), en: e.target.value }; return u; }); }} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontSize: 12 }}>{language === 'ar' ? 'الوصف (عربي)' : 'Subtitle (Arabic)'}</label>
                          <input className="admin-form-control" style={{ direction: 'rtl' }} value={cover.subtitle?.ar || ''} onChange={e => { setSettings(prev => { const u = { ...prev }; if (!u.pageCovers) u.pageCovers = {}; if (!u.pageCovers[pg.key]) u.pageCovers[pg.key] = {}; u.pageCovers[pg.key].subtitle = { ...(u.pageCovers[pg.key].subtitle || {}), ar: e.target.value }; return u; }); }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>{language === 'ar' ? 'صورة الغلاف (اختياري)' : 'Cover Image (Optional)'}</label>
                        {cover.image?.url ? (
                          <div style={{ position: 'relative', display: 'inline-block', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                            <img src={cover.image.url} alt="Cover" style={{ width: 260, height: 120, objectFit: 'cover', display: 'block' }} />
                            <button type="button" onClick={async () => {
                              const ok = await confirm({ title: language === 'ar' ? 'حذف صورة الغلاف' : 'Delete Cover Image', message: language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?', type: 'danger' });
                              if (!ok) return;
                              setCoverUploading(pg.key);
                              try { const { data } = await api.delete('/admin/settings/page-cover-image', { data: { pageKey: pg.key } }); if (data) setSettings(data); toast.success(language === 'ar' ? 'تم حذف الصورة' : 'Image deleted'); } catch { toast.error(language === 'ar' ? 'فشل الحذف' : 'Delete failed'); } finally { setCoverUploading(null); }
                            }} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%', background: 'rgba(220,53,69,0.9)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label style={{ width: 260, height: 120, borderRadius: 10, border: '2px dashed var(--admin-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: 13, gap: 6 }}>
                            {coverUploading === pg.key ? <><Loader size={20} className="spin" /> {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</> : <><Upload size={20} /> {language === 'ar' ? 'رفع صورة غلاف' : 'Upload Cover Image'}</>}
                            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={coverUploading === pg.key} onChange={async (e) => {
                              const file = e.target.files[0]; if (!file) return;
                              setCoverUploading(pg.key);
                              const fd = new FormData(); fd.append('coverImage', file); fd.append('pageKey', pg.key);
                              try { const { data } = await api.put('/admin/settings/page-cover-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); if (data) setSettings(data); toast.success(language === 'ar' ? 'تم رفع الصورة!' : 'Image uploaded!'); } catch { toast.error(language === 'ar' ? 'فشل الرفع' : 'Upload failed'); } finally { setCoverUploading(null); }
                            }} />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
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
