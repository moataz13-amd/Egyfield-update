import { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  Handshake, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Loader, X, Save, Upload, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import compressImage from '../../utils/imageCompression';

const PartnersManager = () => {
  const { language } = useContext(LanguageContext);
  const confirm = useConfirm();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    website: '',
    order: 0,
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const fetchPartners = () => {
    setLoading(true);
    api.get('/partners?admin=true')
      .then(res => {
        setPartners(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error(language === 'ar' ? 'فشل تحميل الشركاء' : 'Failed to load partners');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm({ nameEn: '', nameAr: '', website: '', order: 0, isActive: true });
    setLogoFile(null);
    setLogoPreview('');
    setShowModal(true);
  };

  const openEditModal = (partner) => {
    setEditing(partner);
    setForm({
      nameEn: partner.name?.en || '',
      nameAr: partner.name?.ar || '',
      website: partner.website || '',
      order: partner.order || 0,
      isActive: partner.isActive,
    });
    setLogoFile(null);
    setLogoPreview(partner.logo?.url || '');
    setShowModal(true);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setLogoFile(compressed);
    setLogoPreview(URL.createObjectURL(compressed));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nameEn || !form.nameAr) {
      toast.error(language === 'ar' ? 'يرجى إدخال الاسم بالعربية والإنجليزية' : 'Please enter name in both English and Arabic');
      return;
    }

    if (!editing && !logoFile) {
      toast.error(language === 'ar' ? 'يرجى رفع شعار الشريك' : 'Please upload partner logo');
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append('name', JSON.stringify({ en: form.nameEn, ar: form.nameAr }));
    formData.append('website', form.website);
    formData.append('order', form.order);
    formData.append('isActive', form.isActive);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      if (editing) {
        const { data } = await api.put(`/partners/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPartners(prev => prev.map(p => p._id === editing._id ? data : p));
        toast.success(language === 'ar' ? 'تم تحديث الشريك بنجاح!' : 'Partner updated successfully!');
      } else {
        const { data } = await api.post('/partners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPartners(prev => [...prev, data]);
        toast.success(language === 'ar' ? 'تم إضافة الشريك بنجاح!' : 'Partner added successfully!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setToggling(id);
    try {
      const partner = partners.find(p => p._id === id);
      const formData = new FormData();
      formData.append('name', JSON.stringify(partner.name));
      formData.append('isActive', !currentStatus);

      await api.put(`/partners/${id}`, formData);
      setPartners(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
      toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
    } catch {
      toast.error(language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'حذف الشريك' : 'Delete Partner',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذا الشريك نهائياً؟' : 'Are you sure you want to permanently delete this partner?',
      type: 'danger'
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/partners/${id}`);
      setPartners(prev => prev.filter(p => p._id !== id));
      toast.success(language === 'ar' ? 'تم حذف الشريك' : 'Partner deleted');
    } catch {
      toast.error(language === 'ar' ? 'فشل حذف الشريك' : 'Failed to delete partner');
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Handshake size={20} style={{ color: 'var(--primary)' }} />
            {language === 'ar' ? 'إدارة الشركاء والموزعين' : 'Partners & Distributors Manager'}
          </h3>
          <p className="admin-text-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
            {language === 'ar' ? 'أضف وعدّل وتحكم في شركاء شركتك المعروضين على الموقع.' : 'Add, edit, and manage your company partners displayed on the website.'}
          </p>
        </div>
        <button onClick={openAddModal} className="admin-btn admin-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          {language === 'ar' ? 'إضافة شريك جديد' : 'Add New Partner'}
        </button>
      </div>

      {/* Partners Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading && partners.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <Loader className="spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        ) : partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--admin-text-muted)' }}>
            <Handshake size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>{language === 'ar' ? 'لم يتم إضافة أي شركاء بعد.' : 'No partners added yet.'}</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>{language === 'ar' ? 'الشعار' : 'Logo'}</th>
                <th>{language === 'ar' ? 'اسم الشريك' : 'Partner Name'}</th>
                <th style={{ width: 200 }}>{language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}</th>
                <th style={{ width: 80 }}>{language === 'ar' ? 'الترتيب' : 'Order'}</th>
                <th style={{ width: 100 }}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th style={{ width: 120, textAlign: 'center' }}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(partner => (
                <tr key={partner._id}>
                  <td>
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--admin-border)', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                      {partner.logo?.url ? (
                        <img src={partner.logo.url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Handshake size={20} style={{ opacity: 0.3 }} />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>
                      {partner.name?.[language] || partner.name?.en || '—'}
                    </div>
                    {partner.name?.en && partner.name?.ar && (
                      <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginTop: 2 }}>
                        {language === 'ar' ? partner.name.en : partner.name.ar}
                      </span>
                    )}
                  </td>
                  <td>
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, textDecoration: 'none' }}
                      >
                        <ExternalLink size={12} />
                        {partner.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').substring(0, 30)}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>{partner.order || 0}</span>
                  </td>
                  <td>
                    {toggling === partner._id ? (
                      <Loader className="spin" size={16} />
                    ) : (
                      <button
                        onClick={() => handleToggleActive(partner._id, partner.isActive)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: partner.isActive ? 'var(--primary)' : 'var(--admin-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0
                        }}
                      >
                        {partner.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(partner)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: 6 }}
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(partner._id)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: 6, color: 'var(--admin-danger)', borderColor: 'rgba(220, 53, 69, 0.2)' }}
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Partner Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'var(--admin-card-bg, #fff)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid var(--admin-border)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid var(--admin-border)'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                <Handshake size={18} style={{ color: 'var(--primary)' }} />
                {editing
                  ? (language === 'ar' ? 'تعديل الشريك' : 'Edit Partner')
                  : (language === 'ar' ? 'إضافة شريك جديد' : 'Add New Partner')
                }
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--admin-text-muted)', padding: 4
              }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {/* Logo Upload */}
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <label style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                  cursor: 'pointer', gap: 10,
                }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: 12,
                    border: '2px dashed var(--admin-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', background: '#f9f9f9',
                    transition: 'border-color 0.2s'
                  }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 8 }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--admin-text-muted)' }}>
                        <Upload size={24} />
                        <span style={{ fontSize: 11 }}>{language === 'ar' ? 'رفع الشعار' : 'Upload Logo'}</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                    {language === 'ar' ? 'اضغط لاختيار صورة (PNG أفضل)' : 'Click to select image (PNG preferred)'}
                  </span>
                </label>
              </div>

              {/* Partner Name */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
                  <input
                    className="admin-form-control"
                    value={form.nameEn}
                    onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))}
                    required
                    placeholder="e.g. Al-Rasheed Trading"
                  />
                </div>
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
                  <input
                    className="admin-form-control"
                    value={form.nameAr}
                    onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                    required
                    style={{ direction: 'rtl' }}
                    placeholder="مثال: شركة الرشيد للتجارة"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="admin-form-group">
                <label>{language === 'ar' ? 'الموقع الإلكتروني (اختياري)' : 'Website URL (optional)'}</label>
                <input
                  className="admin-form-control"
                  value={form.website}
                  onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </div>

              {/* Order + Active */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'ترتيب العرض' : 'Display Order'}</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={form.order}
                    onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>
                <div className="admin-form-group">
                  <label>{language === 'ar' ? 'الحالة' : 'Status'}</label>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                    style={{
                      border: 'none', background: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                      color: form.isActive ? 'var(--primary)' : 'var(--admin-text-muted)',
                      fontSize: 14, fontWeight: 600
                    }}
                  >
                    {form.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    {form.isActive
                      ? (language === 'ar' ? 'مفعّل' : 'Active')
                      : (language === 'ar' ? 'معطّل' : 'Inactive')
                    }
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
              >
                {saving ? (
                  <Loader size={16} className="spin" />
                ) : (
                  <>
                    <Save size={16} />
                    {editing
                      ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                      : (language === 'ar' ? 'إضافة الشريك' : 'Add Partner')
                    }
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersManager;
