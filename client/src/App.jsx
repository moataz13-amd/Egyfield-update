import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Contexts
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Partners from './pages/Partners';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsList from './pages/admin/ProductsList';
import ProductForm from './pages/admin/ProductForm';
import CategoriesList from './pages/admin/CategoriesList';
import InquiriesList from './pages/admin/InquiriesList';
import ArticlesList from './pages/admin/Articles';
import ArticleForm from './pages/admin/ArticleForm';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import AboutManager from './pages/admin/AboutManager';
import PartnersManager from './pages/admin/PartnersManager';
import AdminAccounts from './pages/admin/AdminAccounts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// ===== Global Error Boundary =====
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error, info);
    this.setState({ componentStack: info?.componentStack });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: 24 }}>
          <h1 style={{ color: '#7BB445', fontSize: 48, margin: 0 }}>EgyField</h1>
          <p style={{ color: '#555', marginTop: 16, fontSize: 18 }}>Something went wrong. Please refresh the page.</p>
          <pre style={{ background: '#1e1e1e', color: '#f8f8f2', padding: 16, borderRadius: 8, fontSize: 12, maxWidth: '90vw', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 16 }}>
            {this.state.componentStack}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ marginTop: 24, padding: '12px 32px', background: '#7BB445', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LanguageProvider>
          <ConfirmProvider>
            <AuthProvider>
              <Router>
                <ScrollToTop />
                <div className="app-wrapper">
                  <NavbarWrapper />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/articles" element={<Articles />} />
                    <Route path="/articles/:slug" element={<ArticleDetail />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Admin login */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Admin panel routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="products" element={<ProductsList />} />
                      <Route path="products/new" element={<ProductForm />} />
                      <Route path="products/:id/edit" element={<ProductForm />} />
                      <Route path="categories" element={<CategoriesList />} />
                      <Route path="inquiries" element={<InquiriesList />} />
                      <Route path="articles" element={<ArticlesList />} />
                      <Route path="articles/new" element={<ArticleForm />} />
                      <Route path="articles/:id/edit" element={<ArticleForm />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="about" element={<AboutManager />} />
                      <Route path="partners" element={<PartnersManager />} />
                      <Route path="accounts" element={<AdminAccounts />} />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <FooterWrapper />
                  <PublicLangFloat />
                </div>
              </Router>
              <Toaster position="top-right" reverseOrder={false} />
            </AuthProvider>
          </ConfirmProvider>
        </LanguageProvider>
      </HelmetProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Helper components to conditional hide Navbar/Footer on Admin panels
const NavbarWrapper = () => {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  return !isAdminPath ? <Navbar /> : null;
};

const FooterWrapper = () => {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  return !isAdminPath ? <Footer /> : null;
};

// Floating language switcher for public pages
import { useState as useStateImport, useRef as useRefImport, useEffect as useEffectImport } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { Globe } from 'lucide-react';

const PublicLangFloat = () => {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useStateImport(false);
  const ref = useRefImport(null);

  useEffectImport(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isAdminPath) return null;

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="public-lang-float-container" ref={ref}>
      {open && (
        <div className="public-lang-dropdown-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`public-lang-dropdown-item ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
      <button
        className="public-lang-float-btn"
        onClick={() => setOpen(!open)}
        title="Select Language"
      >
        <Globe size={16} />
        <span>{currentLang.name}</span>
      </button>
    </div>
  );
};

export default App;
