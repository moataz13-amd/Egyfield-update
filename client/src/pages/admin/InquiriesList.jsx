import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Mail, Eye, Trash2, X, Check, Building, Globe, MessageSquare, Info, Calendar } from 'lucide-react';

const InquiriesList = () => {
  const { t, language } = useContext(LanguageContext);
  const confirm = useConfirm();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inquiries?limit=200');
      let list = data.inquiries || [];
      if (filter !== 'all') {
        list = list.filter(inq => inq.status === filter);
      }
      setInquiries(list);
    } catch {
      toast.error(language === 'ar' ? 'فشل تحميل الاستفسارات' : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const handleOpenDetail = async (inq) => {
    setSelectedInquiry(inq);
    if (inq.status === 'new') {
      try {
        await api.put(`/inquiries/${inq._id}/status`, { status: 'read' });
        setInquiries(prev => prev.map(item => item._id === inq._id ? { ...item, status: 'read' } : item));
      } catch {
        console.error('Failed to update status');
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/inquiries/${id}/status`, { status: newStatus });
      toast.success(language === 'ar' ? `تم تحديدها كـ ${newStatus}` : `Marked as ${newStatus}`);
      setSelectedInquiry(prev => prev && prev._id === id ? { ...prev, status: newStatus } : prev);
      setInquiries(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
    } catch {
      toast.error(language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'حذف الاستفسار' : 'Delete Inquiry',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذا الاستفسار؟' : 'Are you sure you want to delete this inquiry?',
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/inquiries/${id}`);
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch {
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  return (
    <>
      <div className="admin-data-table-wrapper">
        <div className="admin-data-table-header">
          <h3>{language === 'ar' ? 'استفسارات العملاء' : 'Customer Inquiries'} ({inquiries.length})</h3>
          <div className="admin-data-table-actions">
            <select className="admin-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">{language === 'ar' ? 'جميع الاستفسارات' : 'All Inquiries'}</option>
              <option value="new">{language === 'ar' ? 'جديد' : 'New'}</option>
              <option value="read">{language === 'ar' ? 'مقروء' : 'Read'}</option>
              <option value="replied">{language === 'ar' ? 'تم الرد' : 'Replied'}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="admin-empty">
            <Mail size={48} />
            <h3>{language === 'ar' ? 'لا توجد استفسارات' : 'No inquiries found'}</h3>
            <p>{language === 'ar' ? 'ستظهر استفسارات العملاء هنا بمجرد إرسالهم نموذج الاتصال.' : 'Customer inquiries will appear here when they submit contact forms.'}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.name')}</th>
                <th>{t('admin.company')}</th>
                <th>{t('admin.country')}</th>
                <th>{t('admin.interest')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.date')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inq => (
                <tr key={inq._id}>
                  <td style={{ fontWeight: 600 }}>{inq.name}</td>
                  <td>{inq.company || '—'}</td>
                  <td>{inq.country || '—'}</td>
                  <td>{inq.productInterest || 'General'}</td>
                  <td>
                    <span className={`status-badge ${inq.status}`}>{inq.status}</span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="table-action-btn" onClick={() => handleOpenDetail(inq)} title={t('admin.view')}>
                        <Eye size={14} />
                      </button>
                      <button className="table-action-btn danger" onClick={() => handleDelete(inq._id)} title={t('admin.delete')}>
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

      {selectedInquiry && (
        <div className="admin-modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="admin-modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{language === 'ar' ? 'استفسار من' : 'Inquiry from'} {selectedInquiry.name}</h3>
              <button className="table-action-btn" onClick={() => setSelectedInquiry(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="inquiry-detail-grid">
                {/* Meta Panel */}
                <div className="inquiry-meta-card">
                  <div className="inquiry-meta-item">
                    <Building size={16} />
                    <div>
                      <div className="label">{t('admin.company')}</div>
                      <div className="value">{selectedInquiry.company || '—'}</div>
                    </div>
                  </div>
                  <div className="inquiry-meta-item">
                    <Mail size={16} />
                    <div>
                      <div className="label">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                      <div className="value">
                        <a href={`mailto:${selectedInquiry.email}`} style={{ color: 'var(--admin-primary)', textDecoration: 'none' }}>
                          {selectedInquiry.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="inquiry-meta-item">
                    <Globe size={16} />
                    <div>
                      <div className="label">{t('admin.country')}</div>
                      <div className="value">{selectedInquiry.country || '—'}</div>
                    </div>
                  </div>
                  <div className="inquiry-meta-item">
                    <MessageSquare size={16} />
                    <div>
                      <div className="label">{t('admin.interest')}</div>
                      <div className="value">{selectedInquiry.productInterest || 'General'}</div>
                    </div>
                  </div>
                  <div className="inquiry-meta-item">
                    <Calendar size={16} />
                    <div>
                      <div className="label">{t('admin.date')}</div>
                      <div className="value">{new Date(selectedInquiry.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="inquiry-meta-item">
                    <Info size={16} />
                    <div>
                      <div className="label">{t('admin.status')}</div>
                      <div className="value" style={{ marginTop: 4 }}>
                        <span className={`status-badge ${selectedInquiry.status}`}>{selectedInquiry.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Panel */}
                <div className="inquiry-message-card">
                  <h3>{language === 'ar' ? 'رسالة العميل' : 'Customer Message'}</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>"{selectedInquiry.message}"</p>
                  <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                    {selectedInquiry.status !== 'replied' && (
                      <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleUpdateStatus(selectedInquiry._id, 'replied')}>
                        <Check size={14} /> {language === 'ar' ? 'تحديد كمقروء ومجاب' : 'Mark as Replied'}
                      </button>
                    )}
                    <a href={`mailto:${selectedInquiry.email}?subject=Inquiry Reply - EgyField&body=Dear ${selectedInquiry.name},`} className="admin-btn admin-btn-secondary admin-btn-sm">
                      {language === 'ar' ? 'الرد عبر البريد الإلكتروني' : 'Reply via Email'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InquiriesList;
