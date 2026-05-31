import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useFeaturedProducts, useCategories } from '../hooks/useProducts';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import AnimatedCounter from '../components/AnimatedCounter';
import Loader from '../components/Loader';
import { Shield, Globe, Package, CalendarCheck, ArrowRight, ArrowLeft, Leaf, CheckCircle2 } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import './Home.css';

const Home = () => {
  const { t, language, isRTL } = useLanguage();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: categories } = useCategories();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const isAr = language === 'ar';

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [featuredProducts, categories]);

  const stats = [
    { value: 11, suffix: '+', label: t('stats.years') },
    { value: 40, suffix: '+', label: t('stats.products') },
    { value: 10, suffix: '+', label: t('stats.countries') },
    { value: 75, suffix: '+', label: t('stats.clients') },
  ];

  const whyCards = [
    { icon: <Shield size={28} />, title: t('why.quality'), desc: t('why.qualityDesc'), color: '#7BB445', bg: 'rgba(123, 180, 69, 0.08)' },
    { icon: <Globe size={28} />, title: t('why.shipping'), desc: t('why.shippingDesc'), color: '#5BA8C8', bg: 'rgba(91, 168, 200, 0.08)' },
    { icon: <Package size={28} />, title: t('why.packaging'), desc: t('why.packagingDesc'), color: '#D4A843', bg: 'rgba(212, 168, 67, 0.08)' },
    { icon: <CalendarCheck size={28} />, title: t('why.supply'), desc: t('why.supplyDesc'), color: '#9B6DD7', bg: 'rgba(155, 109, 215, 0.08)' },
  ];

  return (
    <>
      <Helmet>
        <title>EgyField — Agricultural Exports</title>
        <meta name="description" content="EgyField specializes in premium Egyptian agricultural exports: pickles, fresh produce, frozen products, and grains & legumes. Worldwide delivery." />
      </Helmet>

      <Hero />

      {/* ===== Stats Section ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className={`stats-item reveal reveal-delay-${i + 1}`}>
                <div className="stats-counter-wrapper">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>{t('categories.title')}</h2>
            <p>{t('categories.subtitle')}</p>
          </div>
          
          <div className="categories-grid">
            {categories?.map((cat, i) => (
              <Link
                to={`/products?category=${cat._id}`}
                key={cat._id}
                className={`category-card glass-card reveal reveal-delay-${i + 1}`}
                style={{ '--cat-color': cat.color || 'var(--primary)' }}
              >
                <div className="category-card-icon" style={{ background: cat.color ? `${cat.color}15` : 'rgba(123, 180, 69, 0.15)', color: cat.color || 'var(--primary-dark)' }}>
                  {getCategoryIcon(cat.slug, 34)}
                </div>
                <h3>{cat.name?.[language] || cat.name?.en}</h3>
                <p className="category-card-count">
                  {cat.productCount || 0} {t('nav.products').toLowerCase()}
                </p>
                <div className="category-card-arrow">
                  <Arrow size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured Products ===== */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>{t('featured.title')}</h2>
            <p>{t('featured.subtitle')}</p>
          </div>
          {productsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader />
            </div>
          ) : (
            <>
              <div className="featured-grid">
                {featuredProducts?.slice(0, 6).map((product, i) => (
                  <div key={product._id} className={`reveal reveal-delay-${(i % 3) + 1}`}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <div className="featured-cta reveal" style={{ marginTop: 50 }}>
                <Link to="/products" className="btn btn-outline btn-lg" style={{ borderRadius: 'var(--radius-full)' }}>
                  {t('featured.viewAll')}
                  <Arrow size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== Why EgyField ===== */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>{t('why.title')}</h2>
            <p>{t('why.subtitle')}</p>
          </div>
          <div className="why-grid">
            {whyCards.map((card, i) => (
              <div key={i} className={`why-card glass-card reveal reveal-delay-${i + 1}`}>
                <div className="why-card-icon" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="cta-section">
        <div className="cta-section-bg">
          <div className="cta-section-orb cta-section-orb-1" />
          <div className="cta-section-orb cta-section-orb-2" />
        </div>
        <div className="container">
          <div className="cta-content reveal">
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.subtitle')}</p>
            <Link to="/contact" className="btn btn-accent btn-lg" style={{ borderRadius: 'var(--radius-full)', padding: '16px 36px' }}>
              {t('cta.button')}
              <Arrow size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
