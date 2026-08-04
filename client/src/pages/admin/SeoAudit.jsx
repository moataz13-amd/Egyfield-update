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
      setError(err.response?.data?.message || (isAr ? 'فشل تدقيق SEO' : 'SEO audit failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runAudit(); }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--admin-success)';
    if (score >= 70) return 'var(--admin-warning)';
    return 'var(--admin-danger)';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle size={16} style={{ color: 'var(--admin-danger)' }} />;
      case 'medium': return <AlertTriangle size={16} style={{ color: 'var(--admin-warning)' }} />;
      case 'low': return <Info size={16} style={{ color: 'var(--admin-info)' }} />;
      default: return <Info size={16} style={{ color: 'var(--admin-text-muted)' }} />;
    }
  };

  const ScoreCard = ({ label, score }) => (
    <div className="stat-card" style={{ textAlign: 'center' }}>
      <div className="stat-card-glow" style={{ background: getScoreColor(score) }} />
      <div style={{ fontSize: 36, fontWeight: 800, color: getScoreColor(score), marginTop: 8 }}>{score}</div>
      <div className="stat-card-label" style={{ marginTop: 4 }}>{label}</div>
    </div>
  );

  if (loading && !audit) return <div className="admin-loading">{isAr ? 'جار التدقيق...' : 'Running audit...'}</div>;

  return (
    <>
      <Helmet><title>{isAr ? 'تدقيق تحسين محركات البحث' : 'SEO Audit'} — Delta Harvest Admin</title></Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{isAr ? 'تدقيق تحسين محركات البحث' : 'SEO Audit'}</h2>
        <button className="btn btn-primary" onClick={runAudit} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? (isAr ? 'جاري التدقيق...' : 'Auditing...') : (isAr ? 'تشغيل التدقيق' : 'Run Audit')}
        </button>
      </div>

      {error && (
        <div className="admin-data-table-wrapper" style={{ padding: 16, marginBottom: 16, borderLeft: '3px solid var(--admin-danger)' }}>
          <span style={{ color: 'var(--admin-danger)', fontSize: 14 }}>{error}</span>
        </div>
      )}

      {audit && (
        <>
          <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
            <ScoreCard label={isAr ? 'النتيجة الإجمالية' : 'Overall Score'} score={audit.score} />
            <ScoreCard label={isAr ? 'تقنية' : 'Technical'} score={audit.technicalScore} />
            <ScoreCard label={isAr ? 'المحتوى' : 'Content'} score={audit.contentScore} />
            <ScoreCard label={isAr ? 'إمكانية الوصول' : 'Accessibility'} score={audit.accessibilityScore} />
            <ScoreCard label={isAr ? 'الأداء' : 'Performance'} score={audit.performanceScore} />
          </div>

          {audit.summary && (
            <div className="admin-data-table-wrapper" style={{ padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <XCircle size={16} style={{ color: 'var(--admin-danger)' }} />
                  <strong>{audit.summary.highSeverity}</strong> {isAr ? 'عالية' : 'High'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <AlertTriangle size={16} style={{ color: 'var(--admin-warning)' }} />
                  <strong>{audit.summary.mediumSeverity}</strong> {isAr ? 'متوسطة' : 'Medium'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <Info size={16} style={{ color: 'var(--admin-info)' }} />
                  <strong>{audit.summary.lowSeverity}</strong> {isAr ? 'منخفضة' : 'Low'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <FileText size={16} style={{ color: 'var(--admin-text-muted)' }} />
                  <strong>{audit.summary.totalIssues}</strong> {isAr ? 'إجمالي' : 'Total'}
                </div>
              </div>
            </div>
          )}

          <div className="admin-data-table-wrapper" style={{ padding: 0 }}>
            <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--admin-border)' }}>
              <button className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('overview')}>{isAr ? 'جميع المشكلات' : 'All Issues'}</button>
              <button className={`btn btn-sm ${activeTab === 'high' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('high')}>{isAr ? 'عالية' : 'High'}</button>
              <button className={`btn btn-sm ${activeTab === 'medium' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('medium')}>{isAr ? 'متوسطة' : 'Medium'}</button>
              <button className={`btn btn-sm ${activeTab === 'analysis' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('analysis')}>{isAr ? 'تحليل' : 'Analysis'}</button>
            </div>

            {activeTab === 'analysis' && analysis ? (
              <div style={{ padding: 24 }}>
                <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
                  <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-card-value">{analysis.totalProducts}</div>
                    <div className="stat-card-label">{isAr ? 'المنتجات' : 'Products'}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: analysis.productsWithSeo === analysis.totalProducts ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                      {analysis.productsWithSeo}/{analysis.totalProducts} {isAr ? 'مع SEO' : 'with SEO'}
                    </div>
                  </div>
                  <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-card-value">{analysis.totalArticles}</div>
                    <div className="stat-card-label">{isAr ? 'المقالات' : 'Articles'}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: analysis.articlesWithSeo === analysis.totalArticles ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                      {analysis.articlesWithSeo}/{analysis.totalArticles} {isAr ? 'مع SEO' : 'with SEO'}
                    </div>
                  </div>
                  <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-card-value">{analysis.totalCategories}</div>
                    <div className="stat-card-label">{isAr ? 'التصنيفات' : 'Categories'}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: analysis.categoriesWithSeo === analysis.totalCategories ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                      {analysis.categoriesWithSeo}/{analysis.totalCategories} {isAr ? 'مع SEO' : 'with SEO'}
                    </div>
                  </div>
                  <div className="stat-card" style={{ textAlign: 'center' }}>
                    <div className="stat-card-value">{analysis.missingTitles}</div>
                    <div className="stat-card-label">{isAr ? 'عناوين مفقودة' : 'Missing Titles'}</div>
                  </div>
                </div>

                {Object.keys(analysis.duplicateTitles || {}).length > 0 && (
                  <div style={{ padding: 16, marginBottom: 12, borderRadius: 8, background: 'rgba(212, 168, 67, 0.08)', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
                    <strong style={{ fontSize: 14 }}>{isAr ? 'عناوين SEO مكررة:' : 'Duplicate SEO Titles:'}</strong>
                    <ul style={{ margin: '8px 0 0', fontSize: 12, paddingLeft: 20 }}>
                      {Object.entries(analysis.duplicateTitles).map(([title, count]) => (
                        <li key={title} style={{ marginBottom: 4 }}>"{title}" ({count}x)</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Object.keys(analysis.duplicateDescriptions || {}).length > 0 && (
                  <div style={{ padding: 16, borderRadius: 8, background: 'rgba(212, 168, 67, 0.08)', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
                    <strong style={{ fontSize: 14 }}>{isAr ? 'أوصاف SEO مكررة:' : 'Duplicate Meta Descriptions:'}</strong>
                    <ul style={{ margin: '8px 0 0', fontSize: 12, paddingLeft: 20 }}>
                      {Object.entries(analysis.duplicateDescriptions).map(([desc, count]) => (
                        <li key={desc} style={{ marginBottom: 4 }}>"{desc.substring(0, 60)}..." ({count}x)</li>
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
                          <td><code style={{ fontSize: 12, background: 'var(--admin-surface-2)', padding: '2px 6px', borderRadius: 4 }}>{issue.page}</code></td>
                          <td><span className={`status-badge ${issue.severity === 'high' ? 'replied' : issue.severity === 'medium' ? 'new' : 'active'}`} style={{ fontSize: 11 }}>{issue.type}</span></td>
                        </tr>
                      ))}
                    {audit.issues.filter(i => activeTab === 'overview' || i.severity === activeTab).length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-muted)' }}>
                        <CheckCircle size={32} style={{ color: 'var(--admin-success)', marginBottom: 8 }} /><br />
                        {isAr ? 'لا توجد مشكلات في هذه الفئة' : 'No issues in this category'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SeoAudit;
