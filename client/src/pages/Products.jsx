import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import PageCover from '../components/PageCover';
import Loader from '../components/Loader';
import SeoMeta from '../components/SeoMeta';
import { Search, Sparkles, Filter, Leaf, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import './Products.css';

const Products = () => {
  const { t, language } = useLanguage();
  const seo = useSEO('/products');
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
      <SeoMeta
        title={seo.metaTitle || (isAr ? 'منتجاتنا الزراعية الممتازة' : 'Premium Agricultural Products')}
        description={seo.metaDescription}
        keywords={seo.keywords}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
        ogImage={seo.ogImage}
        twitterTitle={seo.twitterTitle}
        twitterDescription={seo.twitterDescription}
        twitterImage={seo.twitterImage}
        canonicalUrl={seo.canonicalUrl}
        robots={seo.robots}
        language={language}
        jsonld={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: isAr ? 'المنتجات' : 'Products',
          description: seo.metaDescription || "Browse Delta Harvest's premium Egyptian agricultural exports",
          isPartOf: { '@type': 'WebSite', name: 'Delta Harvest', url: 'https://deltaharvest.com' },
        }}
      />

      <div className="products-page">
        {/* ===== Page Cover ===== */}
        <PageCover
          pageKey="products"
          fallbackTitle={t('products.title')}
          fallbackSubtitle={t('products.subtitle')}
        >
          {/* Controls inside PageCover (Desktop only) */}
          <div className="cover-controls desktop-controls">
            {/* Search Bar */}
            <div className="cover-search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                id="search-input-desktop"
                type="text"
                placeholder={t('products.search')}
                value={search}
                onChange={handleSearch}
                className="cover-search-input"
              />
              {isFetching && <RefreshCw size={14} className="spin search-loading-icon" />}
            </div>

            {/* Horizontal Category Filter */}
            <div className="cover-filter-wrapper">
              <CategoryFilter
                categories={categories}
                activeCategory={category}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Clear Filters Button */}
            {(search || category) && (
              <button
                className="cover-clear-btn"
                onClick={handleClearFilters}
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Clear Filters'}
              </button>
            )}
          </div>
        </PageCover>

        {/* ===== Main Content Area ===== */}
        <div className="container products-main-container">
          {/* Controls below PageCover (Mobile only) */}
          <div className="mobile-controls">
            {/* Search Bar */}
            <div className="mobile-search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                id="search-input-mobile"
                type="text"
                placeholder={t('products.search')}
                value={search}
                onChange={handleSearch}
                className="mobile-search-input"
              />
              {isFetching && <RefreshCw size={14} className="spin search-loading-icon" />}
            </div>

            {/* Horizontal Category Filter */}
            <div className="mobile-filter-wrapper">
              <CategoryFilter
                categories={categories}
                activeCategory={category}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Clear Filters Button */}
            {(search || category) && (
              <button
                className="btn btn-outline btn-sm mobile-clear-btn"
                onClick={handleClearFilters}
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Clear Filters'}
              </button>
            )}
          </div>

          <div className="products-layout-grid">
            {/* Showcase Grid */}
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
