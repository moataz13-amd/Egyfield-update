import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { LogIn, Loader, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import deltaHarvestLogo from '../../assets/Delta Harvest-8.png';
import './admin.css';

const AdminLogin = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const isAr = language === 'ar';

  return (
    <>
      <Helmet><title>{isAr ? 'تسجيل الدخول — Delta Harvest' : 'Admin Login — Delta Harvest'}</title></Helmet>
      <div className="admin-login-page">
        {/* Decorative background elements */}
        <div className="admin-login-bg-shape admin-login-bg-shape-1" />
        <div className="admin-login-bg-shape admin-login-bg-shape-2" />
        <div className="admin-login-bg-shape admin-login-bg-shape-3" />

        <div className="admin-login-card">
          <div className="admin-login-logo">
            <img src={deltaHarvestLogo} alt="Delta Harvest" className="admin-login-logo-img" />
            <h1>{isAr ? 'لوحة التحكم' : 'Admin Panel'}</h1>
            <p>{isAr ? 'سجل الدخول للمتابعة' : 'Sign in to your dashboard'}</p>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="admin-login-field">
              <label htmlFor="admin-email">
                <Mail size={14} />
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="admin-login-input-wrap">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isAr ? 'admin@deltaharvest.com' : 'admin@deltaharvest.com'}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                <Lock size={14} />
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="admin-login-input-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? (
                <Loader size={18} className="spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <span>{isAr ? 'مدعوم بواسطة' : 'Powered by'}</span>
            <strong> Delta Harvest</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
