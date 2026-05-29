import { useLanguage } from '../hooks/useLanguage';
import { getCategoryIcon } from '../utils/categoryIcons';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  const { language, t } = useLanguage();

  return (
    <div className="category-filter-list">
      <button
        className={`category-filter-item ${!activeCategory ? 'active' : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        <span className="category-filter-item-text">{t('products.all')}</span>
      </button>
      {categories?.map((cat) => {
        const isActive = activeCategory === cat._id;
        return (
          <button
            key={cat._id}
            className={`category-filter-item ${isActive ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat._id)}
            style={isActive ? { '--active-color': cat.color || 'var(--primary)' } : {}}
          >
            <span className="category-filter-item-icon">
              {getCategoryIcon(cat.slug, 16)}
            </span>
            <span className="category-filter-item-text">{cat.name?.[language] || cat.name?.en}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
