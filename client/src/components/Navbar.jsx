import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
  const { t, language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/about', label: t('nav.about') },
    { path: '/articles', label: language === 'ar' ? 'المقالات' : 'Articles' },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isOpen ? 'navbar-open' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <Logo className="navbar-logo-img" variant={(scrolled || isOpen) ? 'dark' : 'light'} />
        </Link>

        <div className={`navbar-menu ${isOpen ? 'navbar-menu-open' : ''}`}>
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

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{ color: (scrolled || isOpen) ? 'var(--dark)' : 'var(--white)' }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
