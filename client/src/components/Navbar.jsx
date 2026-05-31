import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Home, ShoppingBag, Users, FileText, Mail, Globe } from 'lucide-react';
import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
  const { t, language, setLanguage, languages } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const langRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const navLinks = [
    { path: '/products', label: t('nav.products'), icon: ShoppingBag },
    { path: '/about', label: t('nav.about'), icon: Users },
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/articles', label: t('nav.articles'), icon: FileText },
    { path: '/contact', label: t('nav.contact'), icon: Mail },
  ];

  return (
    <>
      {/* ===== Top Navbar (Desktop + Mobile header) ===== */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-container">
          <Link to="/" className="navbar-brand">
            <Logo className="navbar-logo-img" variant={scrolled ? 'dark' : 'light'} />
          </Link>

          {/* Desktop Links */}
          <div className="navbar-menu-desktop">
            <ul className="navbar-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`navbar-link ${location.pathname === link.path ? 'navbar-link-active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Language Toggle (visible only on mobile) */}
          <div className="navbar-mobile-lang" ref={langRef}>
            <button
              className="navbar-mobile-lang-btn"
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Change language"
            >
              <Globe size={18} />
              <span>{currentLang.name}</span>
            </button>
            {langOpen && (
              <div className="navbar-mobile-lang-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`navbar-mobile-lang-item ${language === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ===== Bottom Nav Bar (Mobile only) ===== */}
      <nav className="bottom-nav">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
