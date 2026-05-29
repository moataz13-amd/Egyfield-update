import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { 
  Users, Plus, Edit, Trash2, Shield, ShieldAlert, Key, Mail, User, X, Check, Loader
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ALL_PERMISSIONS = [
  { key: 'products', labelEn: 'Products & Categories', labelAr: 'المنتجات والأقسام' },
  { key: 'articles', labelEn: 'Articles & Blog', labelAr: 'المقالات والمدونة' },
  { key: 'inquiries', labelEn: 'Customer Inquiries', labelAr: 'استفسارات العملاء' },
  { key: 'settings', labelEn: 'Settings & About Page', labelAr: 'الإعدادات ومن نحن' },
  { key: 'admins', labelEn: 'Admins & Permissions', labelAr: 'المسؤولين والصلاحيات' },
];

const AdminAccounts = () => {
  const { admin: currentAdmin } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const isAr = language === 'ar';

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [permissions, setPermissions] = useState(['products', 'articles', 'inquiries', 'settings']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/admin/accounts');
      setAdmins(data);
      setLoading(false);
    } catch (err) {
      toast.error(isAr ? 'فشل تحميل حسابات المسؤولين' : 'Failed to load administrator accounts');
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedAdminId(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('admin');
    setPermissions(['products', 'articles', 'inquiries', 'settings']);
    setModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setModalMode('edit');
    setSelectedAdminId(admin._id);
    setUsername(admin.username);
    setEmail(admin.email);
    setPassword(''); // Leave empty unless resetting
    setRole(admin.role);
    setPermissions(admin.permissions || []);
    setModalOpen(true);
  };

  const handleTogglePermission = (permKey) => {
    if (permissions.includes(permKey)) {
      setPermissions(permissions.filter(p => p !== permKey));
    } else {
      setPermissions([...permissions, permKey]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toast.error(isAr ? 'يرجى ملء الحقول المطلوبة' : 'Please fill in required fields');
      return;
    }
    if (modalMode === 'create' && !password) {
      toast.error(isAr ? 'كلمة المرور مطلوبة للحسابات الجديدة' : 'Password is required for new accounts');
      return;
    }

    setSaving(true);
    const payload = {
      username,
      email,
      role,
      permissions: role === 'superadmin' ? ['products', 'articles', 'inquiries', 'settings', 'admins'] : permissions
    };

    if (password.trim() !== '') {
      payload.password = password;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/admin/accounts', payload);
        toast.success(isAr ? 'تم إنشاء حساب المسؤول بنجاح ✓' : 'Admin account created successfully ✓');
      } else {
        await api.put(`/admin/accounts/${selectedAdminId}`, payload);
        toast.success(isAr ? 'تم تحديث بيانات المسؤول بنجاح ✓' : 'Admin account updated successfully ✓');
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Failed to save account'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, adminUsername) => {
    if (id === currentAdmin?._id) {
      toast.error(isAr ? 'لا يمكنك حذف حسابك الشخصي!' : 'You cannot delete your own admin account!');
      return;
    }

    const conf = window.confirm(
      isAr 
        ? `هل أنت متأكد من رغبتك في حذف حساب المسؤول "${adminUsername}" نهائياً؟`
        : `Are you sure you want to permanently delete the admin account "${adminUsername}"?`
    );
    if (!conf) return;

    try {
      await api.delete(`/admin/accounts/${id}`);
      toast.success(isAr ? 'تم حذف حساب المسؤول بنجاح ✓' : 'Admin account deleted successfully ✓');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل حذف الحساب' : 'Failed to delete account'));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Loader size={28} className="spin" style={{ color: 'var(--admin-primary)' }} />
      </div>
    );
  }

  return (
    <>
      <div className="admin-data-table-wrapper">
        <div className="admin-data-table-header">
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, margin: 0 }}>
              {isAr ? 'إدارة المسؤولين والصلاحيات' : 'Administrator Accounts'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--admin-text-muted)' }}>
              {isAr 
                ? 'أنشئ حسابات الفرعية للموظفين وحدد صلاحيات وصولهم لمختلف أجزاء لوحة التحكم' 
                : 'Create sub-admin accounts and control their access to different dashboard modules'}
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} />
            {isAr ? 'إضافة مسؤول جديد' : 'Create New Admin'}
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>{isAr ? 'المسؤول' : 'Administrator'}</th>
              <th>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
              <th>{isAr ? 'الدور الوظيفي' : 'Role'}</th>
              <th>{isAr ? 'صلاحيات الوصول' : 'Permissions'}</th>
              <th style={{ textAlign: 'center' }}>{isAr ? 'العمليات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(adm => {
              const isSelf = adm._id === currentAdmin?._id;
              const isSuper = adm.role === 'superadmin';

              return (
                <tr key={adm._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: isSuper ? 'rgba(212,168,67,0.1)' : 'var(--admin-primary-glow)',
                        color: isSuper ? 'var(--admin-warning)' : 'var(--admin-primary)',
                        display: 'flex', alignItems: 'center', justify: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        {isSuper ? <ShieldAlert size={16} /> : <Shield size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {adm.username}
                          {isSelf && (
                            <span style={{
                              fontSize: 10, padding: '1px 6px', borderRadius: 4,
                              background: 'rgba(0,0,0,0.05)', color: 'var(--admin-text-muted)', fontWeight: 500
                            }}>
                              {isAr ? 'أنت' : 'You'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--admin-text-muted)' }}>
                      <Mail size={14} />
                      <span style={{ fontSize: 13 }}>{adm.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: isSuper ? 'rgba(212,168,67,0.12)' : 'var(--admin-primary-glow)',
                      color: isSuper ? 'var(--admin-warning)' : 'var(--admin-primary)'
                    }}>
                      {isSuper ? (isAr ? 'مدير عام' : 'Super Admin') : (isAr ? 'مسؤول فرعي' : 'Sub Admin')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 400 }}>
                      {isSuper ? (
                        <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>
                          {isAr ? 'جميع الصلاحيات متاحة بالكامل' : 'Full access permissions granted'}
                        </span>
                      ) : (
                        (adm.permissions || []).map(pKey => {
                          const pObj = ALL_PERMISSIONS.find(ap => ap.key === pKey);
                          return (
                            <span key={pKey} style={{
                              fontSize: 10, padding: '2px 8px', borderRadius: 4,
                              background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)',
                              color: 'var(--admin-text)'
                            }}>
                              {isAr ? pObj?.labelAr : pObj?.labelEn}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button 
                        className="table-action-btn"
                        onClick={() => handleOpenEditModal(adm)}
                        title={isAr ? 'تعديل الحساب والصلاحيات' : 'Edit Account & Permissions'}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="table-action-btn danger"
                        onClick={() => handleDelete(adm._id, adm.username)}
                        disabled={isSelf}
                        style={{ opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                        title={isAr ? 'حذف حساب المسؤول' : 'Delete Admin Account'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <h3>
                {modalMode === 'create' 
                  ? (isAr ? 'إنشاء حساب مسؤول جديد' : 'Create New Admin') 
                  : (isAr ? 'تعديل الصلاحيات والحساب' : 'Edit Admin Account')}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Username */}
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>{isAr ? 'اسم المستخدم' : 'Username'} *</label>
                  <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', [isAr ? 'right' : 'left']: 14, color: 'var(--admin-text-muted)' }} />
                    <input
                      type="text"
                      className="admin-form-control"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={isAr ? 'مثال: ahmed_export' : 'e.g. ahmed_export'}
                      style={{ paddingLeft: isAr ? 14 : 38, paddingRight: isAr ? 38 : 14 }}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>{isAr ? 'البريد الإلكتروني' : 'Email Address'} *</label>
                  <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', [isAr ? 'right' : 'left']: 14, color: 'var(--admin-text-muted)' }} />
                    <input
                      type="email"
                      className="admin-form-control"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      style={{ paddingLeft: isAr ? 14 : 38, paddingRight: isAr ? 38 : 14 }}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>
                    {isAr ? 'كلمة المرور' : 'Password'}{' '}
                    {modalMode === 'create' ? '*' : (isAr ? '(اتركها فارغة لعدم التغيير)' : '(leave blank to keep unchanged)')}
                  </label>
                  <div className="input-with-icon" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Key size={16} style={{ position: 'absolute', [isAr ? 'right' : 'left']: 14, color: 'var(--admin-text-muted)' }} />
                    <input
                      type="password"
                      className="admin-form-control"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={modalMode === 'create' ? '••••••••' : (isAr ? 'كلمة مرور جديدة' : 'New password')}
                      style={{ paddingLeft: isAr ? 14 : 38, paddingRight: isAr ? 38 : 14 }}
                      required={modalMode === 'create'}
                    />
                  </div>
                </div>

                {/* Role select */}
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>{isAr ? 'الدور الوظيفي والنوع' : 'Role Type'}</label>
                  <select
                    className="admin-form-control"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    disabled={selectedAdminId === currentAdmin?._id}
                  >
                    <option value="admin">{isAr ? 'مسؤول فرعي (صلاحيات مخصصة)' : 'Sub Admin (Custom permissions)'}</option>
                    <option value="superadmin">{isAr ? 'مدير عام (صلاحيات كاملة مطلقة)' : 'Super Admin (Full absolute access)'}</option>
                  </select>
                  {selectedAdminId === currentAdmin?._id && (
                    <p style={{ fontSize: 10, color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>
                      {isAr ? 'لا يمكنك تعديل نوع حسابك الشخصي لضمان عدم إغلاق النظام.' : 'You cannot change your own role to prevent system lockout.'}
                    </p>
                  )}
                </div>

                {/* Permissions checklist (only for standard admin) */}
                {role === 'admin' && (
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ marginBottom: 10 }}>{isAr ? 'صلاحيات الوصول المتاحة' : 'Grant Permissions'}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ALL_PERMISSIONS.map(p => {
                        const checked = permissions.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', borderRadius: 8,
                              background: checked ? 'var(--admin-primary-glow)' : 'var(--admin-surface-2)',
                              border: '1px solid',
                              borderColor: checked ? 'rgba(123, 180, 69, 0.2)' : 'var(--admin-border)',
                              cursor: 'pointer', transition: 'all 0.2s', margin: 0
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePermission(p.key)}
                              style={{ width: 16, height: 16, accentColor: 'var(--admin-primary)', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>
                              {isAr ? p.labelAr : p.labelEn}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? <Loader size={16} className="spin" /> : (isAr ? 'حفظ الحساب' : 'Save Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAccounts;
