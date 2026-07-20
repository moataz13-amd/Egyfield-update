import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api, { getSeoPages, createSeoPage, updateSeoPage, deleteSeoPage } from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import SeoAnalyzer from '../../components/SeoAnalyzer';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, Save, X, Globe, FileText, Package, Folder, ChevronDown } from 'lucide-react';

const STATIC_PAGES = [
  { page: '/', labelEn: 'Home', labelAr: 'الرئيسية' },
  { page: '/products', labelEn: 'Products', labelAr: 'المنتجات' },
  { page: '/about', labelEn: 'About', labelAr: 'من نحن' },
  { page: '/contact', labelEn: 'Contact', labelAr: 'اتصل بنا' },
  { page: '/articles', labelEn: 'Articles', labelAr: 'المقالات' },
  { page: '/partners', labelEn: 'Partners', labelAr: 'الشركاء' },
];

const SeoManager = () => {
  const { t, language } = useContext(LanguageContext);
  const confirm = useConfirm();
  const isAr = language === 'ar';
  const [seoPages, setSeoPages] = useState([]);
  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    page: '', title: '', description: '', keywords: [],
    ogTitle: '', ogDescription: '', ogImage: '',
    twitterTitle: '', twitterDescription: '', twitterImage: '',
    robots: 'index', follow: 'follow',
    canonicalUrl: '', schemaType: '', breadcrumbTitle: '',
    referenceType: '', referenceId: '',
  });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getSeoPages(),
      api.get('/products?all=true&limit=200'),
      api.get('/articles?admin=true&limit=200'),
      api.get('/categories?admin=true'),
    ]).then(([seoRes, prodRes, artRes, catRes]) => {
      setSeoPages(seoRes.data || []);
      setProducts(prodRes.data?.products || []);
      setArticles(artRes.data?.articles || []);
      setCategories(catRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getRefLabel = (item) => {
    if (!item) return '';
    if (item.name) return item.name?.en || item.name?.ar || '';
    if (item.title) return item.title?.en || item.title?.ar || '';
    return item.slug || '';
  };

  const getPageLabel = (sp) => {
    if (sp.referenceType === 'product') {
      const p = products.find(pr => pr.id === sp.referenceId || pr._id === sp.referenceId);
      return `${isAr ? 'منتج' : 'Product'}: ${getRefLabel(p)}`;
    }
    if (sp.referenceType === 'article') {
      const a = articles.find(ar => ar.id === sp.referenceId || ar._id === sp.referenceId);
      return `${isAr ? 'مقال' : 'Article'}: ${getRefLabel(a)}`;
    }
    if (sp.referenceType === 'category') {
      const c = categories.find(ca => ca.id === sp.referenceId || ca._id === sp.referenceId);
      return `${isAr ? 'تصنيف' : 'Category'}: ${getRefLabel(c)}`;
    }
    const staticPage = STATIC_PAGES.find(p => p.page === sp.page);
    return staticPage ? (isAr ? staticPage.labelAr : staticPage.labelEn) : sp.page;
  };

  const startEdit = (sp) => {
    setEditingId(sp.id || sp._id);
    setForm({
      page: sp.page || '', title: sp.title || '', description: sp.description || '', keywords: sp.keywords || [],
      ogTitle: sp.ogTitle || '', ogDescription: sp.ogDescription || '', ogImage: sp.ogImage || '',
      twitterTitle: sp.twitterTitle || '', twitterDescription: sp.twitterDescription || '', twitterImage: sp.twitterImage || '',
      robots: sp.robots || 'index', follow: sp.follow || 'follow',
      canonicalUrl: sp.canonicalUrl || '', schemaType: sp.schemaType || '', breadcrumbTitle: sp.breadcrumbTitle || '',
      referenceType: sp.referenceType || '', referenceId: sp.referenceId || '',
    });
    setCreating(false);
  };

  const startCreate = (type, refId, page) => {
    setEditingId('new');
    setCreating(true);
    setForm({
      page: page || '', title: '', description: '', keywords: [],
      ogTitle: '', ogDescription: '', ogImage: '',
      twitterTitle: '', twitterDescription: '', twitterImage: '',
      robots: 'index', follow: 'follow',
      canonicalUrl: '', schemaType: '', breadcrumbTitle: '',
      referenceType: type, referenceId: refId || '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setCreating(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (creating) {
        await createSeoPage(form);
        toast.success(isAr ? 'تم إنشاء إعدادات SEO' : 'SEO settings created');
      } else {
        await updateSeoPage(editingId, form);
        toast.success(isAr ? 'تم تحديث إعدادات SEO' : 'SEO settings updated');
      }
      const res = await getSeoPages();
      setSeoPages(res.data || []);
      cancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sp) => {
    const confirmed = await confirm({
      title: isAr ? 'حذف إعدادات SEO' : 'Delete SEO Settings',
      message: isAr ? 'هل أنت متأكد؟' : 'Are you sure?',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await deleteSeoPage(sp.id || sp._id);
      setSeoPages(prev => prev.filter(p => (p.id || p._id) !== (sp.id || sp._id)));
      toast.success(isAr ? 'تم الحذف' : 'Deleted');
      if (editingId === (sp.id || sp._id)) cancelEdit();
    } catch {
      toast.error(isAr ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const filteredSeoPages = seoPages.filter(sp => {
    if (filterType !== 'all') {
      if (filterType === 'page' && sp.referenceType) return false;
      if (filterType !== 'page' && sp.referenceType !== filterType) return false;
    }
    if (searchTerm) {
      const label = getPageLabel(sp).toLowerCase();
      if (!label.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  if (loading) return <div className="admin-loading">{isAr ? 'جار التحميل...' : 'Loading...'}</div>;

  return (
    <>
      <Helmet><title>{isAr ? 'مدير تحسين محركات البحث' : 'SEO Manager'} — EgyField Admin</title></Helmet>

      {editingId && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>
          {/* Form */}
          <div className="admin-data-table-wrapper" style={{ padding: 28 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
              {creating ? <><Plus size={18} /> {isAr ? 'إضافة جديدة' : 'New SEO Settings'}</> : <><Edit2 size={18} /> {isAr ? 'تعديل' : 'Edit SEO'}</>}
            </h4>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{isAr ? 'عنوان SEO' : 'SEO Title'}</label>
                <input className="admin-form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'الوصف' : 'Meta Description'}</label>
                <textarea className="admin-form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>{isAr ? 'الكلمات المفتاحية (مفصولة بفواصل)' : 'Keywords (comma-separated)'}</label>
              <input className="admin-form-control" value={form.keywords.join(', ')} onChange={e => setForm({ ...form, keywords: e.target.value.split(',').map(k => k.trim()) })} />
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{isAr ? 'عنوان OG' : 'OG Title'}</label>
                <input className="admin-form-control" value={form.ogTitle} onChange={e => setForm({ ...form, ogTitle: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'وصف OG' : 'OG Description'}</label>
                <textarea className="admin-form-control" value={form.ogDescription} onChange={e => setForm({ ...form, ogDescription: e.target.value })} rows={2} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{isAr ? 'صورة OG (URL)' : 'OG Image URL'}</label>
                <input className="admin-form-control" value={form.ogImage} onChange={e => setForm({ ...form, ogImage: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'عنوان Twitter' : 'Twitter Title'}</label>
                <input className="admin-form-control" value={form.twitterTitle} onChange={e => setForm({ ...form, twitterTitle: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{isAr ? 'وصف Twitter' : 'Twitter Description'}</label>
                <textarea className="admin-form-control" value={form.twitterDescription} onChange={e => setForm({ ...form, twitterDescription: e.target.value })} rows={2} />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'صورة Twitter (URL)' : 'Twitter Image URL'}</label>
                <input className="admin-form-control" value={form.twitterImage} onChange={e => setForm({ ...form, twitterImage: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{isAr ? 'الرابط الأساسي (Canonical)' : 'Canonical URL'}</label>
                <input className="admin-form-control" value={form.canonicalUrl} onChange={e => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://egyfield.com/about" />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'عنوان مسار التنقل' : 'Breadcrumb Title'}</label>
                <input className="admin-form-control" value={form.breadcrumbTitle} onChange={e => setForm({ ...form, breadcrumbTitle: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{isAr ? 'نوع Schema' : 'Schema Type'}</label>
                <input className="admin-form-control" value={form.schemaType} onChange={e => setForm({ ...form, schemaType: e.target.value })} placeholder="WebPage, Product, Article, FAQPage" />
              </div>
              <div className="admin-form-group">
                <label>{isAr ? 'إعدادات الزحف' : 'Crawl Settings'}</label>
                <div style={{ display: 'flex', gap: 12, paddingTop: 4, flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="robots" value="index" checked={form.robots === 'index'} onChange={e => setForm({ ...form, robots: e.target.value })} /> index
                  </label>
                  <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="robots" value="noindex" checked={form.robots === 'noindex'} onChange={e => setForm({ ...form, robots: e.target.value })} /> noindex
                  </label>
                  <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="follow" value="follow" checked={form.follow === 'follow'} onChange={e => setForm({ ...form, follow: e.target.value })} /> follow
                  </label>
                  <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="radio" name="follow" value="nofollow" checked={form.follow === 'nofollow'} onChange={e => setForm({ ...form, follow: e.target.value })} /> nofollow
                  </label>
                </div>
              </div>
            </div>
            <hr style={{ border: '0', height: '1px', background: 'var(--admin-border)', margin: '20px 0' }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? (isAr ? 'جار الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
              </button>
              <button className="btn btn-outline" onClick={cancelEdit}><X size={16} /> {isAr ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>

          {/* SEO Analyzer Panel */}
          <SeoAnalyzer form={form} language={language} />
        </div>
      )}

      {!editingId && (
        <>
          <div className="admin-data-table-wrapper" style={{ padding: 28, marginBottom: 24 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
              <Plus size={18} /> {isAr ? 'إضافة سريعة للصفحات الثابتة' : 'Quick Add — Static Pages'}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATIC_PAGES.map(sp => {
                const exists = seoPages.some(se => se.page === sp.page && !se.referenceType);
                return (
                  <button key={sp.page} className="btn btn-outline btn-sm" onClick={() => startCreate('', '', sp.page)} disabled={exists} style={{ opacity: exists ? 0.4 : 1 }}>
                    <Globe size={14} /> {isAr ? sp.labelAr : sp.labelEn} {exists ? `✓` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-data-table-wrapper" style={{ padding: 28 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
              <Search size={18} /> {isAr ? 'جميع إعدادات SEO' : 'All SEO Settings'}
            </h4>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <input className="admin-form-control" style={{ maxWidth: 300 }} placeholder={isAr ? 'بحث...' : 'Search...'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <select className="admin-form-control" style={{ maxWidth: 180 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">{isAr ? 'الكل' : 'All'}</option>
                <option value="page">{isAr ? 'صفحات' : 'Pages'}</option>
                <option value="product">{isAr ? 'منتجات' : 'Products'}</option>
                <option value="article">{isAr ? 'مقالات' : 'Articles'}</option>
                <option value="category">{isAr ? 'تصنيفات' : 'Categories'}</option>
              </select>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{isAr ? 'الصفحة' : 'Page'}</th>
                    <th>{isAr ? 'عنوان SEO' : 'SEO Title'}</th>
                    <th>{isAr ? 'روبوتات' : 'Robots'}</th>
                    <th style={{ width: 100 }}>{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeoPages.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--admin-text-muted)' }}>{isAr ? 'لا توجد نتائج' : 'No results'}</td></tr>
                  ) : filteredSeoPages.map(sp => (
                    <tr key={sp.id || sp._id}>
                      <td>
                        <strong>{getPageLabel(sp)}</strong>
                        <br /><small style={{ color: 'var(--admin-text-muted)', fontSize: 11 }}>{sp.page}</small>
                      </td>
                      <td>{sp.title || <em style={{ color: 'var(--admin-text-muted)' }}>{isAr ? 'بدون' : 'None'}</em>}</td>
                      <td><span className={`status-badge ${sp.robots === 'noindex' ? 'replied' : 'new'}`} style={{ fontSize: 11 }}>{sp.robots}/{sp.follow}</span></td>
                      <td>
                        <button className="table-action-btn" onClick={() => startEdit(sp)} title={isAr ? 'تعديل' : 'Edit'}><Edit2 size={14} /></button>
                        <button className="table-action-btn" onClick={() => handleDelete(sp)} title={isAr ? 'حذف' : 'Delete'} style={{ color: 'var(--admin-danger)' }}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SeoManager;
