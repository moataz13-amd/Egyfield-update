import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Globe, Award, TrendingUp, Sprout } from 'lucide-react';

const COLORS = ['#7BB445', '#4F9200', '#388BFD', '#D4A843', '#DA3633', '#8B949E'];

const Analytics = () => {
  const { t, language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [inquiriesChart, setInquiriesChart] = useState([]);
  const [productsChart, setProductsChart] = useState(null);
  const [countriesChart, setCountriesChart] = useState([]);
  const [period, setPeriod] = useState('year'); // 'year', '3months', 'month'

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [ovRes, inqRes, prodRes, countRes] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/analytics/inquiries'),
          api.get('/admin/analytics/products'),
          api.get('/admin/analytics/countries'),
        ]);
        setOverview(ovRes.data);
        setInquiriesChart(inqRes.data.monthly || []);
        setProductsChart(prodRes.data);
        setCountriesChart(countRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="skeleton" style={{ height: 260 }} />
        <div className="skeleton" style={{ height: 260 }} />
        <div className="skeleton" style={{ height: 260, gridColumn: 'span 2' }} />
      </div>
    );
  }

  const filteredInquiries = (() => {
    if (period === 'month') return inquiriesChart.slice(-1);
    if (period === '3months') return inquiriesChart.slice(-3);
    return inquiriesChart;
  })();

  const localizedInquiries = filteredInquiries.map(item => {
    const date = new Date(item.year, item.month - 1, 1);
    const label = date.toLocaleString(language === 'ar' ? 'ar' : 'en', { month: 'short', year: '2-digit' });
    return { ...item, label };
  });

  const pieData = (productsChart?.byCategory || []).map(c => {
    const nameMap = {
      'Pickles': 'مخللات',
      'Fresh Produce': 'منتجات طازجة',
      'Frozen': 'منتجات مجمدة',
      'Grains & Legumes': 'حبوب'
    };
    const localName = language === 'ar' 
      ? (c.nameAr || nameMap[c.nameEn] || c.nameEn)
      : (c.nameEn || c.nameAr);
    return {
      ...c,
      name: localName
    };
  });

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, color: '#1E293B', fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: '2px 0 0', color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet><title>{t('admin.analytics')} — Delta Harvest Admin</title></Helmet>

      {/* Filter Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <div style={{ display: 'flex', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 3 }}>
          <button className={`settings-tab ${period === 'year' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12, borderBottom: 'none' }} onClick={() => setPeriod('year')}>
            {language === 'ar' ? 'آخر 12 شهر' : 'Last 12 Months'}
          </button>
          <button className={`settings-tab ${period === '3months' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12, borderBottom: 'none' }} onClick={() => setPeriod('3months')}>
            {language === 'ar' ? 'آخر 3 أشهر' : 'Last 3 Months'}
          </button>
          <button className={`settings-tab ${period === 'month' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12, borderBottom: 'none' }} onClick={() => setPeriod('month')}>
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </button>
        </div>
      </div>

      {/* Advanced Overview Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(123, 180, 69, 0.15)', color: '#7BB445' }}>
              <MessageSquare size={20} />
            </div>
          </div>
          <p className="stat-card-value">{overview?.totalInquiries || 0}</p>
          <p className="stat-card-label">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Submissions'}</p>
          <span className="stat-card-trend up">
            {language === 'ar' ? 'على مدار الوقت' : 'All-time inquiries'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(56, 139, 253, 0.15)', color: '#388BFD' }}>
              <Globe size={20} />
            </div>
          </div>
          <p className="stat-card-value">{countriesChart.length}</p>
          <p className="stat-card-label">{t('admin.activeMarkets')}</p>
          <span className="stat-card-trend up">
            {language === 'ar' ? 'دولة تصدير فريدة' : 'Unique Countries'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(212, 168, 67, 0.15)', color: '#D4A843' }}>
              <Sprout size={20} />
            </div>
          </div>
          <p className="stat-card-value">{overview?.totalProducts || 0}</p>
          <p className="stat-card-label">{language === 'ar' ? 'إجمالي منتجات الكتالوج' : 'Total Catalog Products'}</p>
          <span className="stat-card-trend up">
            {language === 'ar' ? 'نشط في الموقع' : 'Live crop categories'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'rgba(218, 54, 51, 0.15)', color: '#DA3633' }}>
              <Award size={20} />
            </div>
          </div>
          <p className="stat-card-value">HACCP / ISO</p>
          <p className="stat-card-label">{language === 'ar' ? 'شهادات الجودة والسلامة' : 'Certifications Standards'}</p>
          <span className="stat-card-trend up">
            {language === 'ar' ? 'متوافق بالكامل' : 'Fully Compliant'}
          </span>
        </div>
      </div>

      {/* Main Charts Breakdown */}
      <div className="charts-row">
        {/* Inquiry Growth */}
        <div className="chart-card chart-card-full">
          <div className="chart-card-header">
            <h3>{language === 'ar' ? 'حجم الاستفسارات ونسبة الردود' : 'Inquiry Volume & Reply Rate'}</h3>
          </div>
          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={localizedInquiries}>
                <defs>
                  <linearGradient id="glowInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7BB445" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7BB445" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="glowReplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#388BFD" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#388BFD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="count" name={language === 'ar' ? 'إجمالي الاستفسارات' : 'Total Inquiries'} stroke="#7BB445" fill="url(#glowInquiries)" strokeWidth={2} />
                <Area type="monotone" dataKey="repliedCount" name={language === 'ar' ? 'تم الرد عليها' : 'Replied/Done'} stroke="#388BFD" fill="url(#glowReplied)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-row">
        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>{language === 'ar' ? 'توزيع المحاصيل حسب الأقسام' : 'Crops Distribution by Category'}</h3>
          </div>
          <div className="analytics-pie-wrap">
            <div className="analytics-pie-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="analytics-pie-legend-box">
              {pieData.map((c, i) => (
                <div key={i} className="analytics-pie-legend-item">
                  <span className="legend-item-name">
                    <span className="legend-item-color" style={{ background: c.color || COLORS[i % COLORS.length] }} />
                    {c.name}
                  </span>
                  <span className="legend-item-count">
                    {c.count} {language === 'ar' ? 'عنصر' : 'items'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Countries Table List */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>{language === 'ar' ? 'الاهتمام الجغرافي' : 'Geographical Interest'}</h3>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', overflowX: 'auto', maxWidth: '100%' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.country')}</th>
                  <th style={{ textAlign: 'right' }}>{t('admin.inquiries')}</th>
                </tr>
              </thead>
              <tbody>
                {countriesChart.map((c, i) => (
                  <tr key={i}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                      <span style={{ fontSize: 16 }}>🌍</span>
                      {c.country}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-primary)' }}>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
