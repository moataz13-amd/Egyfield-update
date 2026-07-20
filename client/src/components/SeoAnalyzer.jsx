import { useState, useEffect, useRef } from 'react';
import { analyzeSeo } from '../services/api';

const STATUS_ICONS = {
  error: '✗',
  warning: '!',
  good: '✓',
  info: '○',
};

const STATUS_COLORS = {
  error: 'var(--admin-danger)',
  warning: 'var(--admin-warning)',
  good: 'var(--admin-success)',
  info: 'var(--admin-info)',
};

const GRADE_CONFIG = {
  perfect: { color: '#238636', bg: 'rgba(35,134,54,0.1)', labelEn: 'Perfect', labelAr: 'ممتاز' },
  good: { color: '#7BB445', bg: 'rgba(123,180,69,0.1)', labelEn: 'Good', labelAr: 'جيد' },
  average: { color: '#D4A843', bg: 'rgba(212,168,67,0.1)', labelEn: 'Average', labelAr: 'متوسط' },
  poor: { color: '#DA3633', bg: 'rgba(218,54,51,0.1)', labelEn: 'Needs Work', labelAr: 'بحاجة لتحسين' },
  bad: { color: '#DA3633', bg: 'rgba(218,54,51,0.15)', labelEn: 'Bad', labelAr: 'سيء' },
};

const SeoAnalyzer = ({ form, language = 'en', content, images }) => {
  const isAr = language === 'ar';
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoading(true);
      analyzeSeo({
        title: form.title,
        description: form.description,
        keywords: form.keywords,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        ogImage: form.ogImage,
        twitterTitle: form.twitterTitle,
        twitterDescription: form.twitterDescription,
        twitterImage: form.twitterImage,
        robots: form.robots,
        follow: form.follow,
        canonicalUrl: form.canonicalUrl,
        schemaType: form.schemaType,
        breadcrumbTitle: form.breadcrumbTitle,
        content,
        images,
      }).then(res => {
        setResult(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, 500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [form.title, form.description, form.keywords, form.ogTitle, form.ogDescription, form.ogImage, form.twitterTitle, form.twitterDescription, form.twitterImage, form.canonicalUrl, form.schemaType, form.breadcrumbTitle, form.robots, form.follow, content]);

  if (!result && !loading) return null;

  const grade = result ? GRADE_CONFIG[result.grade] || GRADE_CONFIG.bad : GRADE_CONFIG.bad;

  return (
    <div style={{
      background: 'var(--admin-surface)',
      border: '1px solid var(--admin-border)',
      borderRadius: 'var(--admin-radius)',
      overflow: 'hidden',
      position: 'sticky',
      top: 24,
    }}>
      {/* Score Circle */}
      <div style={{
        textAlign: 'center',
        padding: '24px 20px 20px',
        background: grade.bg,
        borderBottom: '1px solid var(--admin-border)',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="spin" style={{ width: 20, height: 20, border: '2px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%' }} />
            <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{isAr ? 'جار التحليل...' : 'Analyzing...'}</span>
          </div>
        ) : result ? (
          <>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              background: `conic-gradient(${grade.color} ${result.score * 3.6}deg, var(--admin-border) ${result.score * 3.6}deg)`,
              position: 'relative',
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--admin-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 800,
                color: grade.color,
              }}>
                {result.score}
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: grade.color }}>{isAr ? grade.labelAr : grade.labelEn}</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 12 }}>
              <span style={{ color: 'var(--admin-danger)' }}>✗ {result.summary.errors}</span>
              <span style={{ color: 'var(--admin-warning)' }}>! {result.summary.warnings}</span>
              <span style={{ color: 'var(--admin-success)' }}>✓ {result.summary.good}</span>
            </div>
          </>
        ) : null}
      </div>

      {/* Checks List */}
      {result && (
        <div style={{ padding: '12px 16px', maxHeight: 400, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            {isAr ? 'نتائج التحليل' : 'Analysis Results'}
          </div>
          {result.checks.map((check, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 8,
              padding: '8px 0',
              borderBottom: i < result.checks.length - 1 ? '1px solid var(--admin-border)' : 'none',
              alignItems: 'flex-start',
            }}>
              <span style={{
                color: STATUS_COLORS[check.status],
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
                width: 16,
                textAlign: 'center',
              }}>
                {STATUS_ICONS[check.status]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--admin-text)', lineHeight: 1.4 }}>{check.message}</div>
                {check.fix && (
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2, lineHeight: 1.3, fontStyle: 'italic' }}>
                    {isAr ? 'الإصلاح: ' : 'Fix: '}{check.fix}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeoAnalyzer;
