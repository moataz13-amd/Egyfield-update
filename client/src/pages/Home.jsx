import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useFeaturedProducts, useCategories } from '../hooks/useProducts';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import AnimatedCounter from '../components/AnimatedCounter';
import TestimonialSlider from '../components/TestimonialSlider';
import Loader from '../components/Loader';
import { Shield, Globe, Package, CalendarCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import './Home.css';

const Home = () => {
  const { t, language, isRTL } = useLanguage();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: categories } = useCategories();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

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
    { value: 15, suffix: '+', label: t('stats.years') },
    { value: 200, suffix: '+', label: t('stats.products') },
    { value: 35, suffix: '+', label: t('stats.countries') },
    { value: 500, suffix: '+', label: t('stats.clients') },
  ];

  const whyCards = [
    { icon: <Shield size={32} />, title: t('why.quality'), desc: t('why.qualityDesc') },
    { icon: <Globe size={32} />, title: t('why.shipping'), desc: t('why.shippingDesc') },
    { icon: <Package size={32} />, title: t('why.packaging'), desc: t('why.packagingDesc') },
    { icon: <CalendarCheck size={32} />, title: t('why.supply'), desc: t('why.supplyDesc') },
  ];

  return (
    <>
      <Helmet>
        <title>EgyField — Premium Egyptian Agricultural Exports</title>
        <meta name="description" content="EgyField specializes in premium Egyptian agricultural exports: pickles, fresh produce, frozen products, and grains & legumes. Worldwide delivery." />
      </Helmet>

      <Hero />

      {/* Stats Bar */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stats-item reveal reveal-delay-${i + 1}">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
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
                style={{ '--cat-color': cat.color }}
              >
                <div className="category-card-icon">{getCategoryIcon(cat.slug, 40)}</div>
                <h3>{cat.name?.[language] || cat.name?.en}</h3>
                <p className="category-card-count">
                  {cat.productCount || 0} {t('nav.products').toLowerCase()}
                </p>
                <div className="category-card-arrow">
                  <Arrow size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>{t('featured.title')}</h2>
            <p>{t('featured.subtitle')}</p>
          </div>
          {productsLoading ? (
            <Loader />
          ) : (
            <>
              <div className="featured-grid">
                {featuredProducts?.map((product, i) => (
                  <div key={product._id} className={`reveal reveal-delay-${(i % 4) + 1}`}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <div className="featured-cta reveal">
                <Link to="/products" className="btn btn-outline btn-lg">
                  {t('featured.viewAll')}
                  <Arrow size={20} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why EgyField */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>{t('why.title')}</h2>
            <p>{t('why.subtitle')}</p>
          </div>
          <div className="why-grid">
            {whyCards.map((card, i) => (
              <div key={i} className={`why-card glass-card reveal reveal-delay-${i + 1}`}>
                <div className="why-card-icon">{card.icon}</div>
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>{t('testimonials.title')}</h2>
            <p>{t('testimonials.subtitle')}</p>
          </div>
          <div className="reveal">
            <TestimonialSlider language={language} />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content reveal">
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.subtitle')}</p>
            <Link to="/contact" className="btn btn-accent btn-lg">
              {t('cta.button')}
              <Arrow size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
