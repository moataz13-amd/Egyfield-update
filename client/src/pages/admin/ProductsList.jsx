import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { LanguageContext } from '../../context/LanguageContext';
import { useConfirm } from '../../context/ConfirmContext';
import api, { resolveField } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Package, Star, CheckCircle, XCircle, Filter } from 'lucide-react';

const ProductsList = () => {
  const { t, language } = useContext(LanguageContext);
  const confirm = useConfirm();
  const isAr = language === 'ar';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { data: categories } = useCategories();
  const { data, isLoading, refetch } = useProducts({ search, category, page, limit: 10, all: true });

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirm({
      title: isAr ? 'حذف منتج' : 'Delete Product',
      message: isAr ? `هل أنت متأكد من حذف المنتج "${name}"؟` : `Are you sure you want to delete product "${name}"?`,
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(isAr ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
      refetch();
    } catch { 
      toast.error(isAr ? 'فشل حذف المنتج' : 'Failed to delete product'); 
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await api.patch(`/products/${id}/featured`);
      refetch();
    } catch { 
      toast.error(isAr ? 'فشل التحديث' : 'Failed to update'); 
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/products/${id}/active`);
      refetch();
    } catch { 
      toast.error(isAr ? 'فشل التحديث' : 'Failed to update'); 
    }
  };

  const totalProducts = data?.total || 0;
  const activeProducts = data?.products?.filter(p => p.isActive !== false).length || 0;
  const featuredProducts = data?.products?.filter(p => p.featured).length || 0;

  return (
    <>
      {/* ===== Page Header with Stats ===== */}
      <div className="pl-page-header">
        <div className="pl-header-top">
          <div className="pl-header-title-area">
            <div className="pl-header-icon">
              <Package size={22} />
            </div>
            <div>
              <h2 className="pl-page-title">{t('admin.products')}</h2>
              <p className="pl-page-subtitle">
                {isAr ? 'إدارة جميع المنتجات والأقسام' : 'Manage all products & categories'}
              </p>
            </div>
          </div>
          <Link to="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus size={18} /> {t('admin.addProduct')}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="pl-stats-row">
          <div className="pl-stat-card">
            <div className="pl-stat-icon" style={{ background: 'rgba(123, 180, 69, 0.12)', color: '#7BB445' }}>
              <Package size={18} />
            </div>
            <div className="pl-stat-info">
              <span className="pl-stat-value">{totalProducts}</span>
              <span className="pl-stat-label">{isAr ? 'إجمالي المنتجات' : 'Total Products'}</span>
            </div>
          </div>
          <div className="pl-stat-card">
            <div className="pl-stat-icon" style={{ background: 'rgba(35, 134, 54, 0.12)', color: '#238636' }}>
              <CheckCircle size={18} />
            </div>
            <div className="pl-stat-info">
              <span className="pl-stat-value">{activeProducts}</span>
              <span className="pl-stat-label">{isAr ? 'منتجات نشطة' : 'Active'}</span>
            </div>
          </div>
          <div className="pl-stat-card">
            <div className="pl-stat-icon" style={{ background: 'rgba(212, 168, 67, 0.12)', color: '#D4A843' }}>
              <Star size={18} />
            </div>
            <div className="pl-stat-info">
              <span className="pl-stat-value">{featuredProducts}</span>
              <span className="pl-stat-label">{isAr ? 'منتجات مميزة' : 'Featured'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Filters Bar ===== */}
      <div className="pl-filters-bar">
        <div className="pl-filters-left">
          <div className="admin-search-wrap pl-search">
            <Search size={16} />
            <input
              className="admin-search-input"
              placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="pl-filter-select-wrap">
            <Filter size={14} className="pl-filter-icon" />
            <select
              className="admin-select pl-category-select"
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">{t('admin.allCategories')}</option>
              {categories?.map(c => (
                <option key={c._id} value={c._id}>
                    {resolveField(c.name, language) || '—'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="pl-filters-right">
          <span className="pl-results-count">
            {isAr ? `${totalProducts} نتيجة` : `${totalProducts} result${totalProducts !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* ===== Products Table ===== */}
      <div className="admin-data-table-wrapper pl-table-wrapper">
        {isLoading ? (
          <div className="pl-loading-state">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton pl-skeleton-row" />
            ))}
          </div>
        ) : data?.products?.length > 0 ? (
          <table className="admin-table pl-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>{t('admin.image')}</th>
                <th>{t('admin.name')}</th>
                <th>{t('admin.category')}</th>
                <th>{t('admin.season')}</th>
                <th style={{ width: 80, textAlign: 'center' }}>{t('admin.featured')}</th>
                <th style={{ width: 80, textAlign: 'center' }}>{t('admin.active')}</th>
                <th style={{ width: 120, textAlign: 'center' }}>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map(p => (
                <tr key={p._id} className={p.isActive === false ? 'pl-row-inactive' : ''}>
                  <td>
                    <div className="pl-product-img-wrap">
                      <img
                        className="pl-product-img"
                        src={p.images?.[0]?.url || 'https://placehold.co/56x56/F4F6F9/94a3b8?text=No+img'}
                        alt={resolveField(p.name, 'en') || ''}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="pl-name-cell">
                      <span className="pl-name-en">{resolveField(p.name, 'en') || '—'}</span>
                      <span className="pl-name-ar">{resolveField(p.name, 'ar') || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="pl-category-badge"
                      style={{
                        '--badge-color': p.category?.color || '#7BB445',
                      }}
                    >
                      <span className="pl-badge-dot" />
                      {resolveField(p.category?.name, language) || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="pl-season">{resolveField(p.season, language) || '—'}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={`featured-toggle ${p.featured ? 'on' : ''}`}
                      onClick={() => handleToggleFeatured(p._id)}
                      title={p.featured ? (isAr ? 'إلغاء التمييز' : 'Unfeature') : (isAr ? 'تمييز' : 'Feature')}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={`featured-toggle ${p.isActive !== false ? 'on' : ''}`}
                      onClick={() => handleToggleActive(p._id)}
                      title={p.isActive !== false ? (isAr ? 'تعطيل' : 'Deactivate') : (isAr ? 'تفعيل' : 'Activate')}
                    />
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <Link to={`/admin/products/${p._id}/edit`} className="table-action-btn pl-action-edit" title={t('admin.edit')}>
                        <Edit2 size={14} />
                      </Link>
                      <a href={`/products/${p._id}`} target="_blank" rel="noopener noreferrer" className="table-action-btn pl-action-view" title={t('admin.view')}>
                        <Eye size={14} />
                      </a>
                      <button className="table-action-btn danger" title={t('admin.delete')} onClick={() => handleDelete(p._id, resolveField(p.name, language))}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="pl-empty-state">
            <Package size={48} strokeWidth={1} />
            <h4>{isAr ? 'لا توجد منتجات' : 'No Products Found'}</h4>
            <p>{isAr ? 'جرب تغيير كلمات البحث أو الفلاتر.' : 'Try adjusting your search or filters.'}</p>
          </div>
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
