import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../context/AuthContext';
import { Leaf, LogIn, Loader } from 'lucide-react';
import './admin.css';

const AdminLogin = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login — EgyField</title></Helmet>
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <div className="admin-login-logo-icon"><Leaf size={28} /></div>
            <h1>EgyField Admin</h1>
            <p>Sign in to your dashboard</p>
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label>Email Address</label>
              <input type="email" className="admin-form-control" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="admin@egyfield.com" required />
            </div>
            <div className="admin-form-group">
              <label>Password</label>
              <input type="password" className="admin-form-control" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? <Loader size={18} className="spin" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
