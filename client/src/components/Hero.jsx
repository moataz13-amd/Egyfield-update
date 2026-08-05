import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Sprout } from 'lucide-react';
import api from '../services/api';
import './Hero.css';

const Hero = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        setSettings(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const heroImages = settings?.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : [];

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const heroTitleText = loading
    ? ''
    : (settings?.heroTitle?.[language] ?? settings?.heroTitle?.en ?? '');
  const heroSubtitleText = loading
    ? ''
    : (settings?.heroSubtitle?.[language] ?? settings?.heroSubtitle?.en ?? '');

  const titleStyle = settings?.heroTitleColor
    ? {
        color: settings.heroTitleColor,
        background: 'none',
        WebkitBackgroundClip: 'unset',
        WebkitTextFillColor: 'initial',
        backgroundClip: 'unset'
      }
    : {};

  const subtitleStyle = settings?.heroSubtitleColor
    ? { color: settings.heroSubtitleColor }
    : {};

  return (
    <section className="hero" id="hero">
      {/* Full-width background image slider */}
      <div className="hero-image-bg" style={{ overflow: 'hidden', position: 'relative' }}>
        {heroImages.map((img, index) => (
          <img 
            key={img.publicId || index}
            src={img.url} 
            alt="" 
            className="hero-bg-img" 
            fetchPriority={index === 0 ? 'high' : 'low'}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            width="1920"
            height="800"
            style={{
              position: index === 0 ? 'relative' : 'absolute',
              inset: 0,
              width: '100%',
              height: index === 0 ? 'auto' : '100%',
              objectFit: 'cover',
              aspectRatio: '1920/800',
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: index === currentImageIndex ? 1 : 0
            }}
          />
        ))}
      </div>

      {/* Animated decorative elements */}
      <div className="hero-bg">
        <div className="hero-circle hero-circle-1"></div>
        <div className="hero-circle hero-circle-2"></div>
        <div className="hero-circle hero-circle-3"></div>
        <div className="hero-leaf hero-leaf-1"><Sprout size={24} style={{ color: 'rgba(123, 180, 69, 0.4)' }} /></div>
        <div className="hero-leaf hero-leaf-2"><Sprout size={32} style={{ color: 'rgba(79, 146, 0, 0.4)' }} /></div>
        <div className="hero-leaf hero-leaf-3"><Sprout size={20} style={{ color: 'rgba(168, 212, 122, 0.4)' }} /></div>
        <div className="hero-leaf hero-leaf-4"><Sprout size={28} style={{ color: 'rgba(212, 168, 67, 0.4)' }} /></div>
      </div>

      {/* Text content overlay */}
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title" style={titleStyle}>{heroTitleText}</h1>
          <p className="hero-subtitle" style={subtitleStyle}>{heroSubtitleText}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
