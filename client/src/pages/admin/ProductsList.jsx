import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductsList = () => {
  const { t, language } = useContext(LanguageContext);
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { data: categories } = useCategories();
  const { data, isLoading, refetch } = useProducts({ search, category, page, limit: 10, all: true });

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'حذف منتج' : 'Delete Product',
      message: language === 'ar' ? `هل أنت متأكد من حذف المنتج "${name}"؟` : `Are you sure you want to delete product "${name}"?`,
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
      refetch();
    } catch { 
      toast.error(language === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product'); 
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await api.patch(`/products/${id}/featured`);
      refetch();
    } catch { 
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Failed to update'); 
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/products/${id}/active`);
      refetch();
    } catch { 
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Failed to update'); 
    }
  };

  return (
    <>
      <div className="admin-data-table-wrapper">
        <div className="admin-data-table-header">
          <h3>{t('admin.products')} ({data?.total || 0})</h3>
          <div className="admin-data-table-actions">
            <div className="admin-search-wrap">
              <Search size={16} />
              <input className="admin-search-input" placeholder={t('admin.searchProducts')} value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="admin-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">{t('admin.allCategories')}</option>
              {categories?.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name?.[language] || c.name?.en}
                </option>
              ))}
            </select>
            <Link to="/admin/products/new" className="admin-btn admin-btn-primary admin-btn-sm">
              <Plus size={16} /> {t('admin.addProduct')}
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: 20 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.image')}</th>
                <th>{t('admin.name')}</th>
                <th>{t('admin.category')}</th>
                <th>{t('admin.season')}</th>
                <th>{t('admin.featured')}</th>
                <th>{t('admin.active')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map(p => (
                <tr key={p._id} style={{ opacity: p.isActive === false ? 0.75 : 1 }}>
                  <td><img className="table-img" src={p.images?.[0]?.url || 'https://placehold.co/44x44/F4F6F9/64748B?text=...'} alt="" /></td>
                  <td>
                    <div className="table-name-cell">
                      <span className="en">{p.name?.en}</span>
                      <span className="ar">{p.name?.ar}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active" style={{ background: `${p.category?.color}20`, color: p.category?.color }}>
                      {p.category?.name?.[language] || p.category?.name?.en || '—'}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{p.season || '—'}</td>
                  <td><button className={`featured-toggle ${p.featured ? 'on' : ''}`} onClick={() => handleToggleFeatured(p._id)} /></td>
                  <td><button className={`featured-toggle ${p.isActive !== false ? 'on' : ''}`} onClick={() => handleToggleActive(p._id)} /></td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/products/${p._id}/edit`} className="table-action-btn" title={t('admin.edit')}><Edit2 size={14} /></Link>
                      <a href={`/products/${p._id}`} target="_blank" rel="noopener noreferrer" className="table-action-btn" title={t('admin.view')}><Eye size={14} /></a>
                      <button className="table-action-btn danger" title={t('admin.delete')} onClick={() => handleDelete(p._id, p.name?.[language] || p.name?.en)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data?.pages > 1 && (
          <div className="admin-pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: data.pages }, (_, i) => (
              <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button disabled={page >= data.pages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsList;
