import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowRight, ArrowLeft, Sparkles, Globe, Factory, Star, Sprout } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import './Hero.css';

const Hero = () => {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="hero" id="hero">
      {/* Animated Background Elements */}
      <div className="hero-bg">
        <div className="hero-circle hero-circle-1"></div>
        <div className="hero-circle hero-circle-2"></div>
        <div className="hero-circle hero-circle-3"></div>
        {/* Replacing background decorative emojis with clean vectors */}
        <div className="hero-leaf hero-leaf-1"><Sprout size={24} style={{ color: 'rgba(123, 180, 69, 0.4)' }} /></div>
        <div className="hero-leaf hero-leaf-2"><Sprout size={32} style={{ color: 'rgba(79, 146, 0, 0.4)' }} /></div>
        <div className="hero-leaf hero-leaf-3"><Sprout size={20} style={{ color: 'rgba(168, 212, 122, 0.4)' }} /></div>
        <div className="hero-leaf hero-leaf-4"><Sprout size={28} style={{ color: 'rgba(212, 168, 67, 0.4)' }} /></div>
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Premium Egyptian Exports</span>
          </div>
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary btn-lg">
              {t('hero.cta_products')}
              <Arrow size={20} />
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              {t('hero.cta_contact')}
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-avatars">
              {/* Replacing Trust emojis with beautiful vector icons */}
              <div className="hero-trust-avatar" style={{background: '#7BB445', color: '#fff'}}><Globe size={16} /></div>
              <div className="hero-trust-avatar" style={{background: '#4F9200', color: '#fff'}}><Factory size={16} /></div>
              <div className="hero-trust-avatar" style={{background: '#D4A843', color: '#fff'}}><Star size={16} /></div>
            </div>
            <p>Trusted by <strong>500+</strong> importers worldwide</p>
          </div>
        </div>

        <div className="hero-visual">
          {/* Replacing Visual card emojis with matching vector category icons */}
          <div className="hero-visual-card hero-visual-card-1">
            <span className="hero-visual-emoji">{getCategoryIcon('pickles', 28)}</span>
            <span>Pickles</span>
          </div>
          <div className="hero-visual-card hero-visual-card-2">
            <span className="hero-visual-emoji">{getCategoryIcon('fresh', 28)}</span>
            <span>Fresh</span>
          </div>
          <div className="hero-visual-card hero-visual-card-3">
            <span className="hero-visual-emoji">{getCategoryIcon('frozen', 28)}</span>
            <span>Frozen</span>
          </div>
          <div className="hero-visual-card hero-visual-card-4">
            <span className="hero-visual-emoji">{getCategoryIcon('grains', 28)}</span>
            <span>Grains</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
