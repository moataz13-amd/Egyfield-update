import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api, { getSeoPages, createSeoPage, updateSeoPage, deleteSeoPage } from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, Save, X, Globe, FileText, Package, Folder, ChevronDown } from 'lucide-react';

const PAGE_TYPES = [
  { value: 'page', labelEn: 'Page', labelAr: 'صفحة' },
  { value: 'product', labelEn: 'Product', labelAr: 'منتج' },
  { value: 'article', labelEn: 'Article', labelAr: 'مقال' },
  { value: 'category', labelEn: 'Category', labelAr: 'تصنيف' },
];

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

  const getReferenceLabel = (item) => {
    if (!item) return '';
    if (item.name) return item.name?.en || item.name?.ar || '';
    if (item.title) return item.title?.en || item.title?.ar || '';
    return item.slug || item.id?.slice(0, 8) || '';
  };

  const getPageLabel = (sp) => {
    if (sp.referenceType === 'product') {
      const p = products.find(pr => pr.id === sp.referenceId || pr._id === sp.referenceId);
      return `${isAr ? 'منتج' : 'Product'}: ${getReferenceLabel(p)}`;
    }
    if (sp.referenceType === 'article') {
      const a = articles.find(ar => ar.id === sp.referenceId || ar._id === sp.referenceId);
      return `${isAr ? 'مقال' : 'Article'}: ${getReferenceLabel(a)}`;
    }
    if (sp.referenceType === 'category') {
      const c = categories.find(ca => ca.id === sp.referenceId || ca._id === sp.referenceId);
      return `${isAr ? 'تصنيف' : 'Category'}: ${getReferenceLabel(c)}`;
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

  const cancelEdit = () => {
    setEditingId(null);
    setCreating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (creating) {
        await createSeoPage(form);
        toast.success(isAr ? 'تم إنشاء إعدادات تحسين محركات البحث' : 'SEO settings created');
      } else {
        await updateSeoPage(editingId, form);
        toast.success(isAr ? 'تم تحديث إعدادات تحسين محركات البحث' : 'SEO settings updated');
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
      title: isAr ? 'حذف إعدادات تحسين محركات البحث' : 'Delete SEO Settings',
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
    if (filterType !== 'all' && sp.referenceType !== filterType && !(filterType === 'page' && !sp.referenceType)) return false;
    if (searchTerm) {
      const label = getPageLabel(sp).toLowerCase();
      if (!label.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  if (loading) return <div className="admin-loading">{isAr ? 'جار التحميل...' : 'Loading...'}</div>;

  const renderForm = () => (
    <div className="admin-card" style={{ marginBottom: 24 }}>
      <div className="admin-card-header">
        {creating ? <><Plus size={18} /> <span>{isAr ? 'إضافة جديدة' : 'New SEO Settings'}</span></> : <><Edit2 size={18} /> <span>{isAr ? 'تعديل' : 'Edit'}</span></>}
      </div>
      <div className="admin-card-body">
        <div className="settings-grid">
          {creating && !form.referenceType && (
            <div className="admin-form-group">
              <label className="admin-form-label">{isAr ? 'المسار (مثال: /about)' : 'Page Path (e.g. /about)'}</label>
              <input className="admin-form-control" value={form.page} onChange={e => setForm({ ...form, page: e.target.value })} placeholder="/about" />
            </div>
          )}
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'عنوان SEO (Meta Title)' : 'SEO Title'}</label>
            <input className="admin-form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'وصف SEO (Meta Description)' : 'Meta Description'}</label>
            <textarea className="admin-form-control admin-form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'الكلمات المفتاحية (مفصولة بفواصل)' : 'Keywords (comma-separated)'}</label>
            <input className="admin-form-control" value={form.keywords.join(', ')} onChange={e => setForm({ ...form, keywords: e.target.value.split(',').map(k => k.trim()) })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'عنوان Open Graph' : 'OG Title'}</label>
            <input className="admin-form-control" value={form.ogTitle} onChange={e => setForm({ ...form, ogTitle: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'وصف Open Graph' : 'OG Description'}</label>
            <textarea className="admin-form-control admin-form-textarea" value={form.ogDescription} onChange={e => setForm({ ...form, ogDescription: e.target.value })} rows={2} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'صورة Open Graph (URL)' : 'OG Image URL'}</label>
            <input className="admin-form-control" value={form.ogImage} onChange={e => setForm({ ...form, ogImage: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'عنوان Twitter' : 'Twitter Title'}</label>
            <input className="admin-form-control" value={form.twitterTitle} onChange={e => setForm({ ...form, twitterTitle: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'وصف Twitter' : 'Twitter Description'}</label>
            <textarea className="admin-form-control admin-form-textarea" value={form.twitterDescription} onChange={e => setForm({ ...form, twitterDescription: e.target.value })} rows={2} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'صورة Twitter (URL)' : 'Twitter Image URL'}</label>
            <input className="admin-form-control" value={form.twitterImage} onChange={e => setForm({ ...form, twitterImage: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'الرابط الأساسي (Canonical URL)' : 'Canonical URL'}</label>
            <input className="admin-form-control" value={form.canonicalUrl} onChange={e => setForm({ ...form, canonicalUrl: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'عنوان مسار التنقل (Breadcrumb)' : 'Breadcrumb Title'}</label>
            <input className="admin-form-control" value={form.breadcrumbTitle} onChange={e => setForm({ ...form, breadcrumbTitle: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'نوع Schema' : 'Schema Type'}</label>
            <input className="admin-form-control" value={form.schemaType} onChange={e => setForm({ ...form, schemaType: e.target.value })} placeholder="WebPage, Product, Article, FAQPage" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{isAr ? 'إعدادات الزحف' : 'Crawl Settings'}</label>
            <div style={{ display: 'flex', gap: 16 }}>
              <label><input type="radio" name="robots" value="index" checked={form.robots === 'index'} onChange={e => setForm({ ...form, robots: e.target.value })} /> index</label>
              <label><input type="radio" name="robots" value="noindex" checked={form.robots === 'noindex'} onChange={e => setForm({ ...form, robots: e.target.value })} /> noindex</label>
              <label><input type="radio" name="follow" value="follow" checked={form.follow === 'follow'} onChange={e => setForm({ ...form, follow: e.target.value })} /> follow</label>
              <label><input type="radio" name="follow" value="nofollow" checked={form.follow === 'nofollow'} onChange={e => setForm({ ...form, follow: e.target.value })} /> nofollow</label>
            </div>
          </div>
        </div>
      </div>
      <div className="admin-card-footer" style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? (isAr ? 'جار الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}</button>
        <button className="btn btn-outline" onClick={cancelEdit}><X size={16} /> {isAr ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  );

  const renderQuickCreate = () => (
    <div className="admin-card" style={{ marginBottom: 24 }}>
      <div className="admin-card-header"><Plus size={18} /><span>{isAr ? 'إضافة سريعة' : 'Quick Add'}</span></div>
      <div className="admin-card-body">
        <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {STATIC_PAGES.map(sp => {
            const exists = seoPages.some(se => se.page === sp.page && !se.referenceType);
            return (
              <button key={sp.page} className="btn btn-outline btn-sm" onClick={() => startCreate('', '', sp.page)} disabled={exists} style={{ justifyContent: 'flex-start', opacity: exists ? 0.5 : 1 }}>
                <Globe size={14} /> {isAr ? sp.labelAr : sp.labelEn} {exists ? ` (${isAr ? 'موجود' : 'exists'})` : ''}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>{isAr ? 'مدير تحسين محركات البحث — إيجي فيلد' : 'SEO Manager — EgyField'}</title></Helmet>
      <div className="admin-seo-manager">
        {editingId && renderForm()}

        {!editingId && renderQuickCreate()}

        {!editingId && (
          <div className="admin-card">
            <div className="admin-card-header">
              <Search size={18} /><span>{isAr ? 'جميع إعدادات تحسين محركات البحث' : 'All SEO Settings'}</span>
            </div>
            <div className="admin-card-body">
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
                      <th>{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSeoPages.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>{isAr ? 'لا توجد نتائج' : 'No results'}</td></tr>
                    ) : filteredSeoPages.map(sp => (
                      <tr key={sp.id || sp._id}>
                        <td><strong>{getPageLabel(sp)}</strong><br /><small style={{ color: 'var(--text-muted)' }}>{sp.page}</small></td>
                        <td>{sp.title || <em style={{ color: 'var(--text-muted)' }}>{isAr ? 'بدون' : 'None'}</em>}</td>
                        <td><span className={`badge ${sp.robots === 'noindex' ? 'badge-error' : 'badge-success'}`}>{sp.robots}/{sp.follow}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => startEdit(sp)} style={{ marginRight: 8 }}><Edit2 size={14} /></button>
                          <button className="btn btn-sm btn-outline" style={{ color: 'var(--error)' }} onClick={() => handleDelete(sp)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SeoManager;
