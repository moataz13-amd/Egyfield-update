import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Eye, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  const readVal = (field) => typeof field === 'object' ? (field[language] || field.en || '') : field || '';
  const name = product.name?.[language] || product.name?.en || 'Product';
  const categoryName = product.category?.name?.[language] || product.category?.name?.en || '';
  const image = product.images?.[0]?.url || `https://placehold.co/400x300/7BB445/FFFFFF?text=${encodeURIComponent(name)}`;
  const originVal = readVal(product.origin);
  const seasonVal = readVal(product.season);

  return (
    <div className="product-card glass-card">
      <div className="product-card-image">
        <img src={image} alt={name} loading="lazy" />
        <div className="product-card-overlay">
          <Link to={`/products/${product._id}`} className="product-card-view-btn">
            <Eye size={18} />
            <span>{t('featured.viewDetails')}</span>
          </Link>
        </div>
      </div>

      <div className="product-card-info">
        <h3 className="product-card-name">
          <Link to={`/products/${product._id}`}>{name}</Link>
        </h3>

        <div className="product-card-meta">
          {originVal && (
            <span className="product-meta-item">
              <MapPin size={14} className="meta-icon" />
              <span>{originVal}</span>
            </span>
          )}
          {seasonVal && (
            <span className="product-meta-item">
              <Calendar size={14} className="meta-icon" />
              <span>{seasonVal}</span>
            </span>
          )}
        </div>

        <div className="product-card-footer">
          <Link to={`/products/${product._id}`} className="product-action-link">
            <span>{t('featured.viewDetails')}</span>
            <ArrowUpRight size={14} className="action-arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
