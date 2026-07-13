import { useState, useContext } from 'react';
import { useCategories } from '../../hooks/useProducts';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, Loader } from 'lucide-react';

const CategoriesList = () => {
  const { t, language } = useContext(LanguageContext);
  const confirm = useConfirm();
  const { data: categories, isLoading, refetch } = useCategories({ admin: true });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [form, setForm] = useState({ nameEn: '', nameAr: '', slug: '', icon: '', color: '#7BB445' });

  const openAdd = () => { setEditing(null); setForm({ nameEn: '', nameAr: '', slug: '', icon: '', color: '#7BB445' }); setModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ nameEn: c.name?.en || '', nameAr: c.name?.ar || '', slug: c.slug || '', icon: c.icon || '', color: c.color || '#7BB445' });
    setModal(true);
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'حذف قسم' : 'Delete Category',
      message: language === 'ar' ? `هل أنت متأكد من حذف القسم "${name}"؟` : `Are you sure you want to delete category "${name}"?`,
      type: 'danger'
    });
    if (!isConfirmed) return;
    try { 
      await api.delete(`/categories/${id}`); 
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully'); 
      refetch(); 
    } catch { 
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete'); 
    }
  };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      await api.patch(`/categories/${id}/toggle`);
      toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
      refetch();
    } catch {
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    } finally {
      setToggling(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { name: { en: form.nameEn, ar: form.nameAr }, slug: form.slug || form.nameEn.toLowerCase().replace(/\s+/g, '-'), icon: form.icon, color: form.color };
    try {
      if (editing) { 
        await api.put(`/categories/${editing._id}`, body); 
        toast.success(language === 'ar' ? 'تم التعديل بنجاح' : 'Updated successfully'); 
      } else { 
        await api.post('/categories', body); 
        toast.success(language === 'ar' ? 'تم الإنشاء بنجاح' : 'Created successfully'); 
      }
      setModal(false); 
      refetch();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed'); 
    }
  };

  return (
    <>
      <div className="admin-data-table-wrapper">
        <div className="admin-data-table-header">
          <h3>{t('admin.categories')} ({categories?.length || 0})</h3>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openAdd}>
            <Plus size={16} /> {language === 'ar' ? 'إضافة قسم' : 'Add Category'}
          </button>
        </div>
        {isLoading ? (
          <div style={{ padding: 20 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{language === 'ar' ? 'اللون' : 'Color'}</th>
                <th>{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (EN)'}</th>
                <th>{language === 'ar' ? 'الاسم بالعربية' : 'Name (AR)'}</th>
                <th>{language === 'ar' ? 'الرابط الفرعي' : 'Slug'}</th>
                <th style={{ width: 80 }}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map(c => (
                <tr key={c._id}>
                  <td><div style={{ width: 28, height: 28, borderRadius: 8, background: c.color || '#7BB445' }} /></td>
                  <td style={{ fontWeight: 600 }}>{c.name?.en}</td>
                  <td style={{ direction: 'rtl', color: '#64748B' }}>{c.name?.ar}</td>
                  <td><code style={{ fontSize: 12, color: '#64748B', background: 'var(--admin-surface-2)', padding: '2px 8px', borderRadius: 4 }}>{c.slug}</code></td>
                  <td>
                    {toggling === c._id ? (
                      <Loader className="spin" size={16} />
                    ) : (
                      <button onClick={() => handleToggle(c._id)} style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: c.isActive !== false ? 'var(--primary)' : 'var(--admin-text-muted)',
                        display: 'flex', alignItems: 'center', padding: 0
                      }}>
                        {c.isActive !== false ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-action-btn" title={t('admin.edit')} onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                      <button className="table-action-btn danger" title={t('admin.delete')} onClick={() => handleDelete(c._id, c.name?.[language] || c.name?.en)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? (language === 'ar' ? 'تعديل قسم' : 'Edit Category') : (language === 'ar' ? 'إضافة قسم' : 'Add Category')}</h3>
              <button className="table-action-btn" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (EN)'}</label>
                    <input className="admin-form-control" value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'الاسم بالعربية' : 'Name (AR)'}</label>
                    <input className="admin-form-control" value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} required style={{ direction: 'rtl' }} />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'الرابط الفرعي (Slug)' : 'Slug'}</label>
                    <input className="admin-form-control" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" />
                  </div>
                  <div className="admin-form-group">
                    <label>{language === 'ar' ? 'اللون' : 'Color'}</label>
                    <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Save size={16} /> {editing ? (language === 'ar' ? 'حفظ التعديلات' : 'Update') : (language === 'ar' ? 'إنشاء' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesList;
