import { lazy, Suspense } from 'react';
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
import Loader from './components/Loader';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Partners = lazy(() => import('./pages/Partners'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy loaded admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const CategoriesList = lazy(() => import('./pages/admin/CategoriesList'));
const InquiriesList = lazy(() => import('./pages/admin/InquiriesList'));
const ArticlesList = lazy(() => import('./pages/admin/Articles'));
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AboutManager = lazy(() => import('./pages/admin/AboutManager'));
const PartnersManager = lazy(() => import('./pages/admin/PartnersManager'));
const AdminAccounts = lazy(() => import('./pages/admin/AdminAccounts'));

const PageLoader = () => <Loader fullPage />;

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
                    <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
                    <Route path="/products" element={<Suspense fallback={<PageLoader />}><Products /></Suspense>} />
                    <Route path="/products/:id" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
                    <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
                    <Route path="/articles" element={<Suspense fallback={<PageLoader />}><Articles /></Suspense>} />
                    <Route path="/articles/:slug" element={<Suspense fallback={<PageLoader />}><ArticleDetail /></Suspense>} />
                    <Route path="/partners" element={<Suspense fallback={<PageLoader />}><Partners /></Suspense>} />
                    <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />

                    {/* Admin login */}
                    <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />

                    {/* Admin panel routes */}
                    <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>}>
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
                    <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
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
