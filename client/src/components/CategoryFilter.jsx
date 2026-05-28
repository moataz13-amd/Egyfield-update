import { useLanguage } from '../hooks/useLanguage';
import { getCategoryIcon } from '../utils/categoryIcons';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  const { language, t } = useLanguage();

  return (
    <div className="category-filter">
      <button
        className={`category-filter-btn ${!activeCategory ? 'category-filter-btn-active' : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        {t('products.all')}
      </button>
      {categories?.map((cat) => (
        <button
          key={cat._id}
          className={`category-filter-btn ${activeCategory === cat._id ? 'category-filter-btn-active' : ''}`}
          onClick={() => onCategoryChange(cat._id)}
          style={activeCategory === cat._id ? { '--active-color': cat.color || 'var(--primary)' } : {}}
        >
          <span className="category-filter-icon">{getCategoryIcon(cat.slug, 18)}</span>
          <span>{cat.name?.[language] || cat.name?.en}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
