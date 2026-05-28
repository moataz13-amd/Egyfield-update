import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { Save, Loader, Plus, Trash2, BookOpen, Target, Eye, Clock, Award, Globe } from 'lucide-react';

const AboutManager = () => {
  const { language } = useContext(LanguageContext);
  const isAr = language === 'ar';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  
  // Local active tab to manage editing of 5 languages
  const [activeEditTab, setActiveEditTab] = useState('en');

  const editTabs = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇪🇬' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get('/about');
        setData(res);
      } catch {
        toast.error(isAr ? 'فشل تحميل بيانات صفحة من نحن' : 'Failed to load About content');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: res } = await api.put('/about', data);
      setData(res);
      toast.success(isAr ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!');
    } catch {
      toast.error(isAr ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Helper for nested bilingual field updates
  const updateField = (field, lang, value) => {
    setData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [lang]: value
      }
    }));
  };

  const updateTimelineItem = (index, key, lang, value) => {
    setData(prev => {
      const timeline = [...prev.timeline];
      if (lang) {
        timeline[index] = {
          ...timeline[index],
          [key]: {
            ...(timeline[index][key] || {}),
            [lang]: value
          }
        };
      } else {
        timeline[index] = { ...timeline[index], [key]: value };
      }
      return { ...prev, timeline };
    });
  };

  const addTimelineItem = () => {
    setData(prev => ({
      ...prev,
      timeline: [
        ...(prev.timeline || []),
        {
          year: '',
          title: { en: '', ar: '', fr: '', it: '', tr: '' },
          description: { en: '', ar: '', fr: '', it: '', tr: '' }
        }
      ],
    }));
  };

  const removeTimelineItem = (index) => {
    setData(prev => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== index) }));
  };

  const updateCertItem = (index, key, lang, value) => {
    setData(prev => {
      const certifications = [...prev.certifications];
      if (lang) {
        certifications[index] = {
          ...certifications[index],
          [key]: {
            ...(certifications[index][key] || {}),
            [lang]: value
          }
        };
      } else {
        certifications[index] = { ...certifications[index], [key]: value };
      }
      return { ...prev, certifications };
    });
  };

  const addCertItem = () => {
    setData(prev => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          name: '',
          description: { en: '', ar: '', fr: '', it: '', tr: '' }
        }
      ],
    }));
  };

  const removeCertItem = (index) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  if (loading || !data) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 400 }} /></div>;

  return (
    <>
      <Helmet><title>{isAr ? 'إدارة صفحة من نحن' : 'About Page Manager'} — EgyField Admin</title></Helmet>

      <div className="admin-data-table-wrapper" style={{ padding: 28 }}>
        
        {/* Language Tabs Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--admin-border)', paddingBottom: 16 }}>
          {editTabs.map(tab => (
            <button
              key={tab.code}
              type="button"
              className={`admin-btn ${activeEditTab === tab.code ? 'admin-btn-primary' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8 }}
              onClick={() => setActiveEditTab(tab.code)}
            >
              <span>{tab.flag}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* ─── Story Section ─── */}
        <div className="about-mgr-section">
          <h3 className="about-mgr-heading"><BookOpen size={18} /> {isAr ? 'قسم القصة' : 'Story Section'}</h3>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>
                {isAr ? 'نص القصة الأول' : 'Story Text 1'} ({editTabs.find(t => t.code === activeEditTab)?.name})
              </label>
              <textarea
                className="admin-form-control"
                rows={3}
                style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                value={data.storyText1?.[activeEditTab] || ''}
                onChange={e => updateField('storyText1', activeEditTab, e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>
                {isAr ? 'نص القصة الثاني' : 'Story Text 2'} ({editTabs.find(t => t.code === activeEditTab)?.name})
              </label>
              <textarea
                className="admin-form-control"
                rows={3}
                style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                value={data.storyText2?.[activeEditTab] || ''}
                onChange={e => updateField('storyText2', activeEditTab, e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>{isAr ? 'رابط صورة القصة' : 'Story Image URL'}</label>
              <input
                className="admin-form-control"
                value={data.storyImage || ''}
                onChange={e => setData(prev => ({ ...prev, storyImage: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="admin-form-group">
              <label>
                {isAr ? 'شارة الصورة' : 'Image Badge'} ({editTabs.find(t => t.code === activeEditTab)?.name})
              </label>
              <input
                className="admin-form-control"
                style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                value={data.storyBadge?.[activeEditTab] || ''}
                onChange={e => updateField('storyBadge', activeEditTab, e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ─── Mission & Vision ─── */}
        <div className="about-mgr-section">
          <h3 className="about-mgr-heading"><Target size={18} /> {isAr ? 'المهمة والرؤية' : 'Mission & Vision'}</h3>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>
                <Target size={14} /> {isAr ? 'نص المهمة' : 'Mission'} ({editTabs.find(t => t.code === activeEditTab)?.name})
              </label>
              <textarea
                className="admin-form-control"
                rows={3}
                style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                value={data.missionText?.[activeEditTab] || ''}
                onChange={e => updateField('missionText', activeEditTab, e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label>
                <Eye size={14} /> {isAr ? 'نص الرؤية' : 'Vision'} ({editTabs.find(t => t.code === activeEditTab)?.name})
              </label>
              <textarea
                className="admin-form-control"
                rows={3}
                style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                value={data.visionText?.[activeEditTab] || ''}
                onChange={e => updateField('visionText', activeEditTab, e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ─── Timeline ─── */}
        <div className="about-mgr-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="about-mgr-heading" style={{ margin: 0 }}><Clock size={18} /> {isAr ? 'الجدول الزمني' : 'Timeline'}</h3>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={addTimelineItem}>
              <Plus size={14} /> {isAr ? 'إضافة حدث' : 'Add Event'}
            </button>
          </div>

          {(data.timeline || []).map((item, i) => (
            <div key={i} className="about-mgr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="about-mgr-card-label">{isAr ? `حدث ${i + 1}` : `Event ${i + 1}`}</span>
                <button className="admin-btn admin-btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => removeTimelineItem(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ maxWidth: 120 }}>
                  <label>{isAr ? 'السنة' : 'Year'}</label>
                  <input
                    className="admin-form-control"
                    value={item.year || ''}
                    onChange={e => updateTimelineItem(i, 'year', null, e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>
                    {isAr ? 'العنوان' : 'Title'} ({editTabs.find(t => t.code === activeEditTab)?.name})
                  </label>
                  <input
                    className="admin-form-control"
                    style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                    value={item.title?.[activeEditTab] || ''}
                    onChange={e => updateTimelineItem(i, 'title', activeEditTab, e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>
                  {isAr ? 'الوصف' : 'Description'} ({editTabs.find(t => t.code === activeEditTab)?.name})
                </label>
                <textarea
                  className="admin-form-control"
                  rows={2}
                  style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                  value={item.description?.[activeEditTab] || ''}
                  onChange={e => updateTimelineItem(i, 'description', activeEditTab, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ─── Certifications ─── */}
        <div className="about-mgr-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="about-mgr-heading" style={{ margin: 0 }}><Award size={18} /> {isAr ? 'الشهادات' : 'Certifications'}</h3>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={addCertItem}>
              <Plus size={14} /> {isAr ? 'إضافة شهادة' : 'Add Certification'}
            </button>
          </div>

          {(data.certifications || []).map((item, i) => (
            <div key={i} className="about-mgr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="about-mgr-card-label">{isAr ? `شهادة ${i + 1}` : `Certification ${i + 1}`}</span>
                <button className="admin-btn admin-btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => removeCertItem(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'اسم الشهادة' : 'Certificate Name'}</label>
                <input
                  className="admin-form-control"
                  value={item.name || ''}
                  onChange={e => updateCertItem(i, 'name', null, e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>
                  {isAr ? 'الوصف' : 'Description'} ({editTabs.find(t => t.code === activeEditTab)?.name})
                </label>
                <textarea
                  className="admin-form-control"
                  rows={2}
                  style={{ direction: activeEditTab === 'ar' ? 'rtl' : 'ltr' }}
                  value={item.description?.[activeEditTab] || ''}
                  onChange={e => updateCertItem(i, 'description', activeEditTab, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
          {saving ? <Loader size={16} className="spin" /> : <><Save size={16} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>}
        </button>
      </div>
    </>
  );
};

export default AboutManager;
