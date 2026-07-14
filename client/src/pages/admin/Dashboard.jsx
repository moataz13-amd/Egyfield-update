import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import { Package, Tags, MessageSquare, Globe, Star, CalendarDays, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { ar as arLocale, enUS as enLocale } from 'date-fns/locale';

const COLORS = ['#7BB445', '#4F9200', '#5BA8C8', '#D4A843', '#DA3633', '#388BFD'];

const Dashboard = () => {
  const { t, language } = useContext(LanguageContext);
  const [overview, setOverview] = useState(null);
  const [inquiriesChart, setInquiriesChart] = useState([]);
  const [productsChart, setProductsChart] = useState(null);
  const [countriesChart, setCountriesChart] = useState([]);
  const [activity, setActivity] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ovRes, inqRes, prodRes, countRes, actRes, latestInqRes] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/analytics/inquiries'),
          api.get('/admin/analytics/products'),
          api.get('/admin/analytics/countries'),
          api.get('/admin/analytics/activity'),
          api.get('/inquiries?limit=5'),
        ]);
        setOverview(ovRes.data);
        setInquiriesChart(inqRes.data.monthly || []);
        setProductsChart(prodRes.data);
        setCountriesChart(countRes.data);
        setActivity(actRes.data);
        setRecentInquiries(latestInqRes.data.inquiries || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="stats-row">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
    );
  }

  const stats = [
    { icon: <Package size={20} />, label: t('admin.totalProducts'), value: overview?.totalProducts || 0, trend: `+${overview?.thisWeekProducts || 0} ${t('admin.thisWeek')}`, up: true, color: '#7BB445' },
    { icon: <Tags size={20} />, label: t('admin.totalCategories'), value: overview?.totalCategories || 0, trend: t('admin.activeAll'), up: true, color: '#4F9200' },
    { icon: <MessageSquare size={20} />, label: t('admin.totalInquiries'), value: overview?.totalInquiries || 0, trend: `${overview?.newInquiries || 0} ${t('admin.unread')}`, up: true, color: '#388BFD' },
    { icon: <Globe size={20} />, label: t('admin.activeMarkets'), value: `${overview?.totalCountries || 0}+`, trend: t('admin.exportDest'), up: true, color: '#5BA8C8' },
    { icon: <Star size={20} />, label: t('admin.featuredProducts'), value: overview?.featuredProducts || 0, trend: t('admin.productsLabel'), up: true, color: '#D4A843' },
    { icon: <CalendarDays size={20} />, label: t('admin.thisMonthInquiries'), value: overview?.thisMonthInquiries || 0, trend: `${overview?.monthChange > 0 ? '+' : ''}${overview?.monthChange || 0}%`, up: (overview?.monthChange || 0) >= 0, color: '#7BB445' },
  ];

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, color: '#1E293B', fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ margin: '2px 0 0', color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  };

  const getLocalizedTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: language === 'ar' ? arLocale : enLocale 
      });
    } catch {
      return timeStr;
    }
  };

  // Helper to get localized category name from product chart data
  const getLocalizedCategoryName = (c) => {
    if (c.nameEn && c.nameAr) {
      return language === 'ar' ? c.nameAr : c.nameEn;
    }
    const raw = c.name;
    if (raw && typeof raw === 'object') return raw[language] || raw.en || '';
    const nameMap = {
      'Pickles': 'مخللات',
      'Fresh Produce': 'منتجات طازجة',
      'Frozen': 'منتجات مجمدة',
      'Grains & Legumes': 'حبوب'
    };
    if (language === 'ar') return nameMap[raw] || raw || '';
    return raw || '';
  };

  return (
    <>
      <Helmet><title>{t('admin.dashboard')} — EgyField Admin</title></Helmet>

      {/* Stats */}
      <div className="stats-row">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-glow" style={{ background: s.color }} />
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            </div>
            <p className="stat-card-value">{s.value}</p>
            <p className="stat-card-label">{s.label}</p>
            <span className={`stat-card-trend ${s.up ? 'up' : 'down'}`}>
              {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header"><h3>{t('admin.inquiriesOverTime')}</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={inquiriesChart}>
              <defs>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7BB445" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7BB445" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="count" name={t('admin.inquiries')} stroke="#7BB445" fill="url(#gArea)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header"><h3>{t('admin.productsByCategory')}</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={productsChart?.byCategory || []} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} strokeWidth={0}>
                {(productsChart?.byCategory || []).map((entry, i) => (
                  <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
            {(productsChart?.byCategory || []).map((c, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color || COLORS[i] }} />
                {getLocalizedCategoryName(c)} ({c.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header"><h3>{t('admin.topCountries')}</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={countriesChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="country" type="category" tick={{ fill: '#64748B', fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name={t('admin.inquiries')} fill="#388BFD" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header"><h3>{t('admin.recentActivity')}</h3></div>
          <div className="activity-feed" style={{ maxHeight: 280, overflowY: 'auto' }}>
            {activity.length === 0 && <p style={{ color: '#64748B', fontSize: 13, padding: 20 }}>No recent activity</p>}
            {activity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-dot ${a.type}`} />
                <div className="activity-info">
                  <p>{typeof a.title === 'object' ? (a.title[language] || a.title.en || '') : a.title}</p>
                  <span>{getLocalizedTime(a.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Inquiries */}
      <div className="admin-data-table-wrapper">
        <div className="admin-data-table-header">
          <h3>{t('admin.latestInquiries')}</h3>
          <Link to="/admin/inquiries" className="admin-btn admin-btn-secondary admin-btn-sm">
            {t('admin.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.name')}</th>
              <th>{t('admin.company')}</th>
              <th>{t('admin.country')}</th>
              <th>{t('admin.interest')}</th>
              <th>{t('admin.status')}</th>
              <th>{t('admin.date')}</th>
            </tr>
          </thead>
          <tbody>
            {recentInquiries.map(inq => (
              <tr key={inq._id}>
                <td style={{ fontWeight: 600 }}>{inq.name}</td>
                <td>{inq.company || '—'}</td>
                <td>{inq.country || '—'}</td>
                <td>{inq.productInterest || 'General'}</td>
                <td><span className={`status-badge ${inq.status}`}>{inq.status}</span></td>
                <td style={{ color: '#64748B', fontSize: 12 }}>{new Date(inq.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Dashboard;
