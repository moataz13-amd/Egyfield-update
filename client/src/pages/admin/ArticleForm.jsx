import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { 
  ArrowLeft, Save, Loader, Upload, Trash2, Eye, EyeOff, Globe, Type, 
  AlignLeft, FileText, Image as ImageIcon, Settings2
} from 'lucide-react';
import api from '../../services/api';
import compressImage from '../../utils/imageCompression';
import uploadToCloudinary from '../../utils/directUpload';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor';
import { translateText } from '../../utils/translate';
import { Languages } from 'lucide-react';

const LANGS = [
  { code: 'ar', label: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
];

const empty = () => ({ en: '', ar: '', fr: '', it: '', tr: '' });

const ArticleForm = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('ar');

  const [title, setTitle] = useState(empty());
  const [summary, setSummary] = useState(empty());
  const [content, setContent] = useState(empty());
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/articles/${id}`)
      .then(res => {
        const a = res.data;
        setTitle(a.title || empty());
        setSummary(a.summary || empty());
        setContent(a.content || empty());
        setIsActive(a.isActive !== undefined ? a.isActive : true);
        if (a.image?.url) {
          setExistingImage(a.image);
          setImagePreview(a.image.url);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error(isAr ? 'فشل تحميل المقال' : 'Failed to load article');
        navigate('/admin/articles');
      });
  }, [id, isEdit]);

  const handleImage = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const compressed = await compressImage(f);
    setImageFile(compressed);
    setImagePreview(URL.createObjectURL(compressed));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImage(null);
  };

  const set = (setter) => (code, val) => setter(p => ({ ...p, [code]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.ar.trim() && !title.en.trim()) {
      toast.error(isAr ? 'اكتب العنوان بالعربية أو الإنجليزية على الأقل' : 'Title required in Arabic or English');
      return;
    }
    setSaving(true);
    let imageData = null;
    if (imageFile) {
      imageData = await uploadToCloudinary(imageFile);
    }
    const payload = {
      title: JSON.stringify(title),
      summary: JSON.stringify(summary),
      content: JSON.stringify(content),
      isActive,
    };
    if (imageData) payload.imageData = JSON.stringify(imageData);

    try {
      if (isEdit) {
        await api.put(`/articles/${id}`, payload);
        toast.success(isAr ? 'تم تحديث المقال بنجاح ✓' : 'Article updated ✓');
      } else {
        await api.post('/articles', payload);
        toast.success(isAr ? 'تم نشر المقال بنجاح ✓' : 'Article published ✓');
      }
      navigate('/admin/articles');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Loader size={28} className="spin" style={{ color: 'var(--admin-primary)' }} />
    </div>
  );

  const currentLang = LANGS.find(l => l.code === tab);

  return (
    <>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => navigate('/admin/articles')}>
          <ArrowLeft size={16} /> {isAr ? 'العودة للمقالات' : 'Back to Articles'}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Status toggle pill */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 20, border: '1px solid',
              borderColor: isActive ? 'var(--admin-success)' : 'var(--admin-border)',
              background: isActive ? 'rgba(35,134,54,0.08)' : 'var(--admin-surface-2)',
              color: isActive ? 'var(--admin-success)' : 'var(--admin-text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
            {isActive ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
          </button>

          <button
            type="submit"
            form="article-form"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving
              ? <Loader size={16} className="spin" />
              : <><Save size={16} /> {isEdit ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'نشر المقال' : 'Publish Article')}</>
            }
          </button>
        </div>
      </div>

      <form id="article-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* ========== LEFT: Main Content ========== */}
          <div>
            {/* Language Tabs Card */}
            <div className="admin-data-table-wrapper" style={{ marginBottom: 20 }}>
              {/* Tab Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 0,
                borderBottom: '1px solid var(--admin-border)',
                padding: '0 4px', overflowX: 'auto'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 14px', color: 'var(--admin-text-muted)', fontSize: 12, fontWeight: 600,
                  borderRight: '1px solid var(--admin-border)', flexShrink: 0
                }}>
                  <Globe size={14} />
                  {isAr ? 'اللغة' : 'Language'}
                </div>
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setTab(l.code)}
                    className={`settings-tab ${tab === l.code ? 'active' : ''}`}
                    style={{ whiteSpace: 'nowrap', fontSize: 13 }}
                  >
                    <span style={{ marginRight: 6 }}>{l.flag}</span>
                    {l.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={async () => {
                    const langs = LANGS.filter(l => l.code !== 'en');
                    for (const lang of langs) {
                      if (title.en && !title[lang.code]) {
                        try { set(setTitle)(lang.code, await translateText(title.en, lang.code)); } catch {}
                      }
                      if (summary.en && !summary[lang.code]) {
                        try { set(setSummary)(lang.code, await translateText(summary.en, lang.code)); } catch {}
                      }
                      if (content.en && !content[lang.code]) {
                        try { set(setContent)(lang.code, await translateText(content.en, lang.code)); } catch {}
                      }
                    }
                    toast.success(isAr ? 'تمت الترجمة!' : 'Translation complete!');
                  }}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                >
                  <Languages size={14} /> {isAr ? 'ترجمة من الإنجليزية' : 'Translate from English'}
                </button>
              </div>

              {/* Tab Body */}
              <div style={{ padding: 24 }}>
                {/* Active language indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 20, padding: '8px 14px',
                  background: 'var(--admin-primary-glow)', borderRadius: 8,
                  border: '1px solid rgba(123,180,69,0.15)'
                }}>
                  <span style={{ fontSize: 18 }}>{currentLang.flag}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-primary)' }}>
                    {isAr ? `تحرير المحتوى باللغة: ${currentLang.label}` : `Editing content in: ${currentLang.label}`}
                  </span>
                  {(currentLang.code === 'ar' || currentLang.code === 'en') && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, padding: '2px 8px',
                      background: 'var(--admin-primary)', color: '#fff',
                      borderRadius: 10, fontWeight: 700
                    }}>
                      {isAr ? 'مطلوب' : 'Required'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Type size={14} style={{ color: 'var(--admin-primary)' }} />
                    {isAr ? 'عنوان المقال' : 'Article Title'}
                  </label>
                  <input
                    className="admin-form-control"
                    value={title[tab] || ''}
                    onChange={e => set(setTitle)(tab, e.target.value)}
                    placeholder={isAr ? 'اكتب عنواناً جذاباً للمقال...' : 'Write a compelling article title...'}
                    style={{ direction: currentLang.dir, fontSize: 16, fontWeight: 600, padding: '14px 16px' }}
                  />
                </div>

                {/* Summary */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlignLeft size={14} style={{ color: 'var(--admin-primary)' }} />
                    {isAr ? 'ملخص المقال' : 'Article Summary'}
                    <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 400, marginLeft: 4 }}>
                      ({isAr ? 'يظهر في كارد المقال' : 'shown on article card'})
                    </span>
                  </label>
                  <textarea
                    className="admin-form-control"
                    rows={3}
                    value={summary[tab] || ''}
                    onChange={e => set(setSummary)(tab, e.target.value)}
                    placeholder={isAr ? 'اكتب ملخصاً قصيراً يجذب القارئ...' : 'Write a short excerpt to attract readers...'}
                    style={{ direction: currentLang.dir }}
                  />
                </div>

                {/* Content */}
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FileText size={14} style={{ color: 'var(--admin-primary)' }} />
                    {isAr ? 'المحتوى الكامل للمقال' : 'Full Content'}
                  </label>
                  <RichTextEditor
                    key={tab}
                    value={content[tab] || ''}
                    onChange={val => set(setContent)(tab, val)}
                    placeholder={isAr ? 'اكتب محتوى المقال الكامل هنا...' : 'Write the full article content here...'}
                    dir={currentLang.dir}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========== RIGHT: Sidebar ========== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Featured Image Card */}
            <div className="admin-data-table-wrapper">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 20px', borderBottom: '1px solid var(--admin-border)',
                fontSize: 14, fontWeight: 600, color: 'var(--admin-text)'
              }}>
                <ImageIcon size={16} style={{ color: 'var(--admin-primary)' }} />
                {isAr ? 'صورة المقال' : 'Featured Image'}
              </div>
              <div style={{ padding: 16 }}>
                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                    <img src={imagePreview} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 50%)',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 10
                    }}>
                      <button
                        type="button"
                        onClick={clearImage}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(218,54,51,0.9)', border: 'none',
                          color: '#fff', fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', backdropFilter: 'blur(4px)'
                        }}
                      >
                        <Trash2 size={12} /> {isAr ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: 180, borderRadius: 10,
                    border: '2px dashed var(--admin-border)', cursor: 'pointer',
                    background: 'var(--admin-surface-2)',
                    transition: 'border-color 0.2s, background 0.2s',
                    color: 'var(--admin-text-muted)', textAlign: 'center', gap: 8
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--admin-primary)'; e.currentTarget.style.background = 'var(--admin-primary-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--admin-border)'; e.currentTarget.style.background = 'var(--admin-surface-2)'; }}
                  >
                    <Upload size={28} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{isAr ? 'ارفع صورة المقال' : 'Upload Image'}</span>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>JPG, PNG, WebP — Max 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Publishing Settings Card */}
            <div className="admin-data-table-wrapper">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 20px', borderBottom: '1px solid var(--admin-border)',
                fontSize: 14, fontWeight: 600, color: 'var(--admin-text)'
              }}>
                <Settings2 size={16} style={{ color: 'var(--admin-primary)' }} />
                {isAr ? 'إعدادات النشر' : 'Publish Settings'}
              </div>
              <div style={{ padding: 20 }}>
                {/* Active Toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10,
                  background: isActive ? 'rgba(35,134,54,0.05)' : 'var(--admin-surface-2)',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(35,134,54,0.15)' : 'var(--admin-border)',
                  transition: 'all 0.2s', marginBottom: 16
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 2 }}>
                      {isAr ? 'حالة النشر' : 'Publish Status'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>
                      {isActive
                        ? (isAr ? 'المقال ظاهر للزوار' : 'Visible to visitors')
                        : (isAr ? 'المقال مخفي عن الزوار' : 'Hidden from visitors')}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`featured-toggle ${isActive ? 'on' : ''}`}
                    onClick={() => setIsActive(!isActive)}
                    style={{ flexShrink: 0 }}
                  />
                </div>

                {/* Content Checklist */}
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--admin-text)' }}>
                    {isAr ? 'قائمة المراجعة' : 'Checklist'}
                  </div>
                  {[
                    { check: !!(title.ar || title.en), label: isAr ? 'العنوان (عربي أو إنجليزي)' : 'Title (AR or EN)' },
                    { check: !!(summary.ar || summary.en), label: isAr ? 'الملخص' : 'Summary' },
                    { check: !!(content.ar || content.en), label: isAr ? 'المحتوى' : 'Content' },
                    { check: !!(imagePreview), label: isAr ? 'صورة المقال' : 'Featured Image' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--admin-border)' : 'none'
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: item.check ? 'var(--admin-primary)' : 'var(--admin-surface-2)',
                        border: item.check ? 'none' : '1px solid var(--admin-border)',
                        color: '#fff', fontSize: 10, fontWeight: 800
                      }}>
                        {item.check ? '✓' : ''}
                      </div>
                      <span style={{ color: item.check ? 'var(--admin-text)' : 'var(--admin-text-muted)' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Translation Progress Card */}
            <div className="admin-data-table-wrapper">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 20px', borderBottom: '1px solid var(--admin-border)',
                fontSize: 14, fontWeight: 600, color: 'var(--admin-text)'
              }}>
                <Globe size={16} style={{ color: 'var(--admin-primary)' }} />
                {isAr ? 'حالة الترجمات' : 'Translations'}
              </div>
              <div style={{ padding: 16 }}>
                {LANGS.map(l => {
                  const done = !!(title[l.code]?.trim());
                  return (
                    <div
                      key={l.code}
                      onClick={() => setTab(l.code)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        marginBottom: 4,
                        background: tab === l.code ? 'var(--admin-primary-glow)' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{l.flag}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--admin-text)' }}>{l.label}</span>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: done ? 'var(--admin-success)' : 'var(--admin-border)'
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </form>
    </>
  );
};

export default ArticleForm;
