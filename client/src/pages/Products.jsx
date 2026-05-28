import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import Loader from '../components/Loader';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './Products.css';

const Products = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({ category, search, page, limit: 12 });

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

  return (
    <>
      <Helmet>
        <title>Products — EgyField Agricultural Exports</title>
        <meta name="description" content="Browse EgyField's complete range of premium Egyptian agricultural products: pickles, fresh produce, frozen goods, and grains." />
      </Helmet>

      <div className="products-page">
        {/* Page Header */}
        <div className="products-hero">
          <div className="container">
            <h1>{t('products.title')}</h1>
            <p>{t('products.subtitle')}</p>
          </div>
        </div>

        <div className="container products-content">
          {/* Search & Filters */}
          <div className="products-toolbar">
            <div className="products-search">
              <Search size={20} />
              <input
                type="text"
                placeholder={t('products.search')}
                value={search}
                onChange={handleSearch}
                className="products-search-input"
              />
            </div>
          </div>

          <CategoryFilter
            categories={categories}
            activeCategory={category}
            onCategoryChange={handleCategoryChange}
          />

          {/* Product Grid */}
          {isLoading ? (
            <Loader />
          ) : data?.products?.length > 0 ? (
            <>
              <div className="products-grid">
                {data.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="products-pagination">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={18} />
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
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="products-empty">
              <Search size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h3>{t('products.noResults')}</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
