import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useProduct, useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ContactForm from '../components/ContactForm';
import Loader from '../components/Loader';
import { MapPin, Package, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { data: product, isLoading } = useProduct(id);
  const [activeImage, setActiveImage] = useState(0);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Get related products (same category)
  const { data: relatedData } = useProducts({
    category: product?.category?._id,
    limit: 4,
  });

  const relatedProducts = relatedData?.products?.filter((p) => p._id !== id)?.slice(0, 3) || [];

  if (isLoading) return <Loader fullPage />;
  if (!product) return <div className="products-empty"><h3>{t('products.noResults')}</h3></div>;

  const name = product.name?.[language] || product.name?.en;
  const description = product.description?.[language] || product.description?.en;
  const categoryName = product.category?.name?.[language] || product.category?.name?.en;
  const images = product.images?.length > 0
    ? product.images
    : [{ url: `https://placehold.co/800x600/7BB445/FFFFFF?text=${encodeURIComponent(name)}` }];

  return (
    <>
      <Helmet>
        <title>{name} — EgyField Products</title>
        <meta name="description" content={description?.substring(0, 160)} />
      </Helmet>

      <div className="product-detail">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="product-breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/products">{t('nav.products')}</Link>
            <span>/</span>
            <span className="product-breadcrumb-current">{name}</span>
          </nav>

          <div className="product-detail-grid">
            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="product-gallery-main">
                <img src={images[activeImage]?.url} alt={name} />
                {images.length > 1 && (
                  <>
                    <button
                      className="gallery-arrow gallery-arrow-left"
                      onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="gallery-arrow gallery-arrow-right"
                      onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="product-gallery-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`gallery-thumb ${i === activeImage ? 'gallery-thumb-active' : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <img src={img.url} alt={`${name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              {product.category && (
                <span className="badge badge-primary" style={{ background: `${product.category.color}20`, color: product.category.color, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {getCategoryIcon(product.category.slug, 12)}
                  <span>{categoryName}</span>
                </span>
              )}

              <h1>{name}</h1>
              <p className="product-description">{description}</p>

              <div className="product-specs">
                {product.origin && (
                  <div className="product-spec">
                    <MapPin size={18} />
                    <div>
                      <span className="product-spec-label">{t('products.origin')}</span>
                      <span className="product-spec-value">{product.origin}</span>
                    </div>
                  </div>
                )}
                {product.packaging && (
                  <div className="product-spec">
                    <Package size={18} />
                    <div>
                      <span className="product-spec-label">{t('products.packaging')}</span>
                      <span className="product-spec-value">{product.packaging}</span>
                    </div>
                  </div>
                )}
                {product.season && (
                  <div className="product-spec">
                    <Calendar size={18} />
                    <div>
                      <span className="product-spec-label">{t('products.season')}</span>
                      <span className="product-spec-value">{product.season}</span>
                    </div>
                  </div>
                )}
              </div>

              {product.certifications?.length > 0 && (
                <div className="product-certifications">
                  <h4><Award size={18} /> {t('products.certifications')}</h4>
                  <div className="product-cert-list">
                    {product.certifications.map((cert, i) => (
                      <span key={i} className="badge badge-accent">{cert}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg product-quote-btn"
                onClick={() => setShowQuoteForm(!showQuoteForm)}
              >
                {t('products.requestQuote')}
              </button>

              {showQuoteForm && (
                <div className="product-quote-form animate-fadeInUp">
                  <ContactForm productInterest={name} />
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="section related-section">
              <h2>{t('products.relatedProducts')}</h2>
              <div className="related-grid">
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
