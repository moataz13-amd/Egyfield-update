import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import Loader from '../components/Loader';
import { Search, Sparkles, Filter, Leaf, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import './Products.css';

const Products = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const { data: categories } = useCategories();
  const { data, isLoading, isFetching } = useProducts({ category, search, page, limit: 12 });

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (page > 1) params.page = page;
    setSearchParams(params);
  }, [category, search, page]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId || '');
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{isAr ? 'منتجاتنا الزراعية الممتازة — إيجي فيلد' : 'Premium Agricultural Products — EgyField'}</title>
        <meta name="description" content="Browse EgyField's complete range of premium Egyptian agricultural exports: fresh onions, citrus fruit, frozen vegetables, and fine grains." />
      </Helmet>

      <div className="products-page">
        {/* ===== Hero Section ===== */}
        <div className="products-hero">
          <div className="products-hero-bg">
            <div className="products-hero-orb products-hero-orb-1" />
            <div className="products-hero-orb products-hero-orb-2" />
            <div className="products-hero-orb products-hero-orb-3" />
          </div>
          <div className="container products-hero-content">
            <h1>{t('products.title')}</h1>
            <p>{t('products.subtitle')}</p>
          </div>
        </div>

        {/* ===== Main Content Area ===== */}
        <div className="container products-main-container">
          <div className="products-layout-grid">
            
            {/* Left/Top: Sidebar Controls */}
            <div className="products-sidebar">
              <div className="products-sticky-card glass-card">
                <div className="sidebar-title">
                  <Filter size={18} style={{ color: 'var(--primary)' }} />
                  <h4>{isAr ? 'فلترة المنتجات' : 'Search & Filters'}</h4>
                </div>

                {/* Search Bar */}
                <div className="products-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder={t('products.search')}
                    value={search}
                    onChange={handleSearch}
                    className="products-search-input"
                  />
                  {isFetching && <RefreshCw size={14} className="spin search-loading-icon" />}
                </div>

                {/* Category Filter */}
                <div className="sidebar-divider" />
                <CategoryFilter
                  categories={categories}
                  activeCategory={category}
                  onCategoryChange={handleCategoryChange}
                />

                {(search || category) && (
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={handleClearFilters}
                    style={{ width: '100%', marginTop: 16, borderRadius: 'var(--radius-md)', fontSize: 13 }}
                  >
                    {isAr ? 'إعادة ضبط الفلاتر' : 'Clear Filters'}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Products Showcase Grid */}
            <div className="products-showcase">
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
                  <Loader />
                </div>
              ) : data?.products?.length > 0 ? (
                <>
                  <div className="products-grid">
                    {data.products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Gorgeous Modern Pagination */}
                  {data.pages > 1 && (
                    <div className="products-pagination">
                      <button
                        className="pagination-btn"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      {Array.from({ length: data.pages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`pagination-btn ${page === i + 1 ? 'pagination-btn-active' : ''}`}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        className="pagination-btn"
                        disabled={page >= data.pages}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="products-empty-card glass-card">
                  <Leaf size={48} className="empty-icon" />
                  <h3>{t('products.noResults')}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                    {isAr 
                      ? 'جرب البحث بكلمة مختلفة أو تغيير تصنيف المنتجات المعروضة.' 
                      : 'Try adjusting your search terms or filter selections.'}
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={handleClearFilters} style={{ marginTop: 24 }}>
                    {isAr ? 'عرض كل المنتجات' : 'View All Products'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
