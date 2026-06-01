import { useState, useContext, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import {
  LayoutDashboard, Package, Tags, MessageSquare, BarChart3, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, X, User, Users, Languages, BookOpen, FileText, Handshake
} from 'lucide-react';
import egyFieldLogo from '../../assets/egyfield.svg';
import api from '../../services/api';
import './admin.css';

const AdminLayout = () => {
  const { admin, logout, isAuthenticated, loading } = useContext(AuthContext);
  const { t, language, setLanguage, languages } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/inquiries?limit=1').then(res => {
      api.get('/inquiries?limit=200').then(r => {
        const inqs = r.data.inquiries || [];
        setNewCount(inqs.filter(i => i.status === 'new').length);
      }).catch(() => { });
    }).catch(() => { });
  }, [isAuthenticated, location.pathname]);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  if (loading || !isAuthenticated) return null;

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), keyName: 'dashboard', end: true },
    { path: '/admin/products', icon: Package, label: t('admin.products'), keyName: 'products', permission: 'products' },
    { path: '/admin/categories', icon: Tags, label: t('admin.categories'), keyName: 'categories', permission: 'products' },
    { path: '/admin/inquiries', icon: MessageSquare, label: t('admin.inquiries'), keyName: 'inquiries', badge: newCount, permission: 'inquiries' },
    { path: '/admin/articles', icon: FileText, label: language === 'ar' ? 'المقالات والمدونة' : 'Articles & Blog', keyName: 'articles', permission: 'articles' },
    { path: '/admin/analytics', icon: BarChart3, label: t('admin.analytics'), keyName: 'analytics' },
    { path: '/admin/about', icon: BookOpen, label: language === 'ar' ? 'صفحة من نحن' : 'About Page', keyName: 'about', permission: 'settings' },
    { path: '/admin/partners', icon: Handshake, label: language === 'ar' ? 'الشركاء' : 'Partners', keyName: 'partners', permission: 'settings' },
    { path: '/admin/settings', icon: Settings, label: t('admin.settings'), keyName: 'settings', permission: 'settings' },
    { path: '/admin/accounts', icon: Users, label: language === 'ar' ? 'الحسابات والصلاحيات' : 'Admin Accounts', keyName: 'accounts', permission: 'admins' },
  ].filter(item => {
    if (!item.permission) return true;
    if (admin?.role === 'superadmin') return true;
    return admin?.permissions?.includes(item.permission);
  });

  const currentNav = navItems.find(n =>
    n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
  );
  const pageTitle = currentNav ? currentNav.label : t('admin.dashboard');

  return (
    <div className="admin-layout">
      {mobileOpen && <div className="mobile-overlay show" onClick={() => setMobileOpen(false)} />}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {language === 'ar' ? (
            collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
          ) : (
            collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
          )}
        </button>

        <div className="sidebar-header">
          <Link to="/" title={language === 'ar' ? 'الذهاب للموقع الرئيسي' : 'Go to main website'}>
            <img src={egyFieldLogo} alt="EgyField" className="sidebar-header-logo-img" />
          </Link>
          <button className="mobile-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={20} className="sidebar-nav-icon" />
              <span className="sidebar-text">{item.label}</span>
              {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar"><User size={18} /></div>
          <div className="sidebar-profile-info">
            <p>{admin?.username || 'Admin'}</p>
            <span>{admin?.email}</span>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title={t('admin.signOut')}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="admin-topbar-title">
              <h1>{pageTitle}</h1>
            </div>
          </div>

        </header>
        <div className="admin-page">
          <Outlet />
        </div>
      </div>

      {/* Floating Language Dropdown */}
      <div className="admin-lang-float-container" ref={langRef}>
        {langOpen && (
          <div className="admin-lang-dropdown-menu">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`admin-lang-dropdown-item ${language === lang.code ? 'active' : ''}`}
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
        <button
          className="admin-lang-float-btn"
          onClick={() => setLangOpen(!langOpen)}
          title="Select Language / اختر اللغة"
        >
          <Languages size={16} />
          <span>{currentLang.name}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
