import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Eye, MapPin, Calendar } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();

  const name = product.name?.[language] || product.name?.en || 'Product';
  const categoryName = product.category?.name?.[language] || product.category?.name?.en || '';
  const image = product.images?.[0]?.url || `https://placehold.co/400x300/7BB445/FFFFFF?text=${encodeURIComponent(name)}`;

  return (
    <div className="product-card glass-card">
      <div className="product-card-image">
        <img src={image} alt={name} loading="lazy" />
        <div className="product-card-overlay">
          <Link to={`/products/${product._id}`} className="product-card-view">
            <Eye size={20} />
            <span>{t('featured.viewDetails')}</span>
          </Link>
        </div>
        {product.category && (
          <span className="product-card-badge" style={{ background: product.category.color || 'var(--primary)' }}>
            <span className="product-card-badge-icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}>
              {getCategoryIcon(product.category.slug, 12)}
            </span>
            <span>{categoryName}</span>
          </span>
        )}
      </div>
      <div className="product-card-info">
        <h3 className="product-card-name">{name}</h3>
        <div className="product-card-meta">
          {product.origin && (
            <span className="product-meta-item">
              <MapPin size={14} style={{ color: 'var(--primary)', marginRight: '4px' }} />
              <span>{product.origin}</span>
            </span>
          )}
          {product.season && (
            <span className="product-meta-item">
              <Calendar size={14} style={{ color: 'var(--primary)', marginRight: '4px' }} />
              <span>{product.season}</span>
            </span>
          )}
        </div>
        <Link to={`/products/${product._id}`} className="btn btn-outline btn-sm product-card-btn">
          {t('featured.viewDetails')}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
