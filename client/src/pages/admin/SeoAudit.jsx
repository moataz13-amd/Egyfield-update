import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Info, FileText, ExternalLink } from 'lucide-react';

const SeoAudit = () => {
  const { t, language } = useContext(LanguageContext);
  const isAr = language === 'ar';
  const [audit, setAudit] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const [auditRes, analysisRes] = await Promise.all([
        api.get('/seo/audit'),
        api.get('/seo/analysis'),
      ]);
      setAudit(auditRes.data);
      setAnalysis(analysisRes.data);
    } catch (err) {
      setError(err.response?.data?.message || (isAr ? 'فشل تدقيق تحسين محركات البحث' : 'SEO audit failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runAudit(); }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return '#D4A843';
    return 'var(--error)';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle size={16} style={{ color: 'var(--error)' }} />;
      case 'medium': return <AlertTriangle size={16} style={{ color: '#D4A843' }} />;
      case 'low': return <Info size={16} style={{ color: 'var(--info)' }} />;
      default: return <Info size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const ScoreCard = ({ label, score }) => (
    <div className="admin-stat-card" style={{ textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: getScoreColor(score) }}>{score}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      <div style={{ marginTop: 12, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: getScoreColor(score), borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
    </div>
  );

  if (loading && !audit) return <div className="admin-loading">{isAr ? 'جار التدقيق...' : 'Running audit...'}</div>;

  return (
    <>
      <Helmet><title>{isAr ? 'تدقيق تحسين محركات البحث — إيجي فيلد' : 'SEO Audit — EgyField'}</title></Helmet>
      <div className="admin-seo-audit">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>{isAr ? 'تدقيق تحسين محركات البحث' : 'SEO Audit'}</h2>
          <button className="btn btn-primary" onClick={runAudit} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? (isAr ? 'جاري التدقيق...' : 'Auditing...') : (isAr ? 'تشغيل التدقيق' : 'Run Audit')}
          </button>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" style={{ padding: 16, borderRadius: 8, marginBottom: 16, background: 'rgba(224, 82, 82, 0.1)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        {audit && (
          <>
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 24 }}>
              <ScoreCard label={isAr ? 'النتيجة الإجمالية' : 'Overall Score'} score={audit.score} />
              <ScoreCard label={isAr ? 'تقنية' : 'Technical'} score={audit.technicalScore} />
              <ScoreCard label={isAr ? 'المحتوى' : 'Content'} score={audit.contentScore} />
              <ScoreCard label={isAr ? 'إمكانية الوصول' : 'Accessibility'} score={audit.accessibilityScore} />
              <ScoreCard label={isAr ? 'الأداء' : 'Performance'} score={audit.performanceScore} />
            </div>

            {audit.summary && (
              <div className="admin-card" style={{ marginBottom: 24 }}>
                <div className="admin-card-header"><Info size={18} /><span>{isAr ? 'ملخص المشكلات' : 'Issues Summary'}</span></div>
                <div className="admin-card-body">
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><XCircle size={16} style={{ color: 'var(--error)' }} /> <strong>{audit.summary.highSeverity}</strong> {isAr ? 'عالية' : 'High'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} style={{ color: '#D4A843' }} /> <strong>{audit.summary.mediumSeverity}</strong> {isAr ? 'متوسطة' : 'Medium'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Info size={16} style={{ color: 'var(--info)' }} /> <strong>{audit.summary.lowSeverity}</strong> {isAr ? 'منخفضة' : 'Low'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} style={{ color: 'var(--text-muted)' }} /> <strong>{audit.summary.totalIssues}</strong> {isAr ? 'إجمالي' : 'Total'}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-card">
              <div className="admin-card-header">
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('overview')}>{isAr ? 'جميع المشكلات' : 'All Issues'}</button>
                  <button className={`btn btn-sm ${activeTab === 'high' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('high')}>{isAr ? 'عالية' : 'High'}</button>
                  <button className={`btn btn-sm ${activeTab === 'medium' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('medium')}>{isAr ? 'متوسطة' : 'Medium'}</button>
                  <button className={`btn btn-sm ${activeTab === 'analysis' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('analysis')}>{isAr ? 'تحليل' : 'Analysis'}</button>
                </div>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
                {activeTab === 'analysis' && analysis ? (
                  <div style={{ padding: 24 }}>
                    <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                      <div className="admin-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.totalProducts}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isAr ? 'المنتجات' : 'Products'}</div>
                        <div style={{ fontSize: 11, color: analysis.productsWithSeo === analysis.totalProducts ? 'var(--success)' : 'var(--error)' }}>{analysis.productsWithSeo}/{analysis.totalProducts} {isAr ? 'مع SEO' : 'with SEO'}</div>
                      </div>
                      <div className="admin-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.totalArticles}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isAr ? 'المقالات' : 'Articles'}</div>
                        <div style={{ fontSize: 11, color: analysis.articlesWithSeo === analysis.totalArticles ? 'var(--success)' : 'var(--error)' }}>{analysis.articlesWithSeo}/{analysis.totalArticles} {isAr ? 'مع SEO' : 'with SEO'}</div>
                      </div>
                      <div className="admin-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.totalCategories}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isAr ? 'التصنيفات' : 'Categories'}</div>
                        <div style={{ fontSize: 11, color: analysis.categoriesWithSeo === analysis.totalCategories ? 'var(--success)' : 'var(--error)' }}>{analysis.categoriesWithSeo}/{analysis.totalCategories} {isAr ? 'مع SEO' : 'with SEO'}</div>
                      </div>
                      <div className="admin-stat-card" style={{ textAlign: 'center', padding: 16 }}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{analysis.missingTitles}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isAr ? 'عناوين مفقودة' : 'Missing Titles'}</div>
                      </div>
                    </div>
                    {Object.keys(analysis.duplicateTitles || {}).length > 0 && (
                      <div className="admin-alert admin-alert-warning" style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(212, 168, 67, 0.1)' }}>
                        <strong>{isAr ? 'عناوين SEO مكررة:' : 'Duplicate SEO Titles:'}</strong>
                        <ul style={{ margin: '8px 0 0', fontSize: 12 }}>
                          {Object.entries(analysis.duplicateTitles).map(([title, count]) => (
                            <li key={title}>&ldquo;{title}&rdquo; ({count}x)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Object.keys(analysis.duplicateDescriptions || {}).length > 0 && (
                      <div className="admin-alert admin-alert-warning" style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(212, 168, 67, 0.1)' }}>
                        <strong>{isAr ? 'أوصاف SEO مكررة:' : 'Duplicate Meta Descriptions:'}</strong>
                        <ul style={{ margin: '8px 0 0', fontSize: 12 }}>
                          {Object.entries(analysis.duplicateDescriptions).map(([desc, count]) => (
                            <li key={desc}>&ldquo;{desc.substring(0, 60)}...&rdquo; ({count}x)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: 30 }}></th>
                          <th>{isAr ? 'المشكلة' : 'Issue'}</th>
                          <th>{isAr ? 'الصفحة' : 'Page'}</th>
                          <th>{isAr ? 'النوع' : 'Type'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audit.issues
                          .filter(i => activeTab === 'overview' || i.severity === activeTab)
                          .map((issue, idx) => (
                            <tr key={idx}>
                              <td>{getSeverityIcon(issue.severity)}</td>
                              <td>{issue.message}</td>
                              <td><code style={{ fontSize: 12 }}>{issue.page}</code></td>
                              <td><span className={`badge badge-${issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}`}>{issue.type}</span></td>
                            </tr>
                          ))}
                        {audit.issues.filter(i => activeTab === 'overview' || i.severity === activeTab).length === 0 && (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                            <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: 8 }} /><br />{isAr ? 'لا توجد مشكلات في هذه الفئة' : 'No issues in this category'}
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SeoAudit;
