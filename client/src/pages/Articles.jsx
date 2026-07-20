import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import { Search, Calendar, Eye, ArrowRight, Loader, FileText } from 'lucide-react';
import PageCover from '../components/PageCover';
import api, { resolveField } from '../services/api';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const Articles = () => {
  const { t, language } = useLanguage();
  const seo = useSEO();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api.get(`/articles?page=${page}&limit=9&search=${debouncedSearch}`)
      .then(res => {
        setArticles(res.data.articles || []);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load articles:', err);
        setLoading(false);
      });
  }, [page, debouncedSearch]);

  const dateLocale = language === 'ar' ? ar : enUS;

  return (
    <>
      <Helmet>
        <title>{seo.metaTitle || (language === 'ar' ? 'أحدث المقالات — إيجي فيلد' : 'Latest Articles — EgyField')}</title>
        <meta name="description" content={seo.metaDescription || 'Read EgyField articles about crop seasons, packaging excellence, quality standards, and global export procedures.'} />
        {seo.keywords?.length > 0 && <meta name="keywords" content={seo.keywords.join(', ')} />}
      </Helmet>
      <div className="articles-page" style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Page Cover */}
      <PageCover
        pageKey="articles"
        fallbackTitle={language === 'ar' ? 'أحدث مقالاتنا وأخبار الحاصلات الزراعية' : 'Latest Articles & Export Insights'}
        fallbackSubtitle={language === 'ar' 
          ? 'تابع مقالاتنا الدورية لمعرفة مواعيد المواسم الزراعية المصرية وأحدث معايير التصدير والتعبئة العالمية.' 
          : 'Read about crop seasons, packaging excellence, quality standards, and global import-export procedures.'}
      />

      <div className="container" style={{ padding: '40px 0 80px' }}>
        {/* Search Bar */}
        <div style={{ 
          maxWidth: 500, 
          margin: '0 auto 40px', 
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          borderRadius: 50
        }}>
          <input 
            type="text" 
            placeholder={language === 'ar' ? 'ابحث عن مقال...' : 'Search articles...'} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 24px',
              paddingLeft: language === 'ar' ? 24 : 54,
              paddingRight: language === 'ar' ? 54 : 24,
              border: '1px solid #e0e0e0',
              borderRadius: 50,
              fontSize: 16,
              background: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s',
              direction: language === 'ar' ? 'rtl' : 'ltr'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = '#e0e0e0'}
          />
          <Search size={20} style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: language === 'ar' ? 'auto' : 20,
            right: language === 'ar' ? 20 : 'auto',
            color: 'var(--text-muted)'
          }} />
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Loader className="spin" size={40} style={{ color: 'var(--primary)' }} />
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <FileText size={48} style={{ color: '#ccc', marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--dark)', marginBottom: 8 }}>
              {language === 'ar' ? 'لا توجد مقالات مطابقة لبحثك' : 'No articles found'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {language === 'ar' ? 'حاول البحث بكلمات مختلفة أو تصفح في وقت آخر.' : 'Try search with different keywords or check back later.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Articles Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: 30,
              marginBottom: 50 
            }}>
              {articles.map(article => {
                const titleText = resolveField(article.title, language) || '';
                const summaryText = resolveField(article.summary, language) || '';
                const dateText = article.createdAt 
                  ? format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: dateLocale }) 
                  : '';

                return (
                  <article key={article._id} style={{
                    background: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative'
                  }}
                  className="article-card"
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(123, 180, 69, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.03)';
                  }}
                  >
                    {/* Image Area */}
                    <div style={{ height: 200, width: '100%', overflow: 'hidden', background: '#eaeaea', position: 'relative' }}>
                      {article.image?.url ? (
                        <img 
                          src={article.image.url} 
                          alt={titleText} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                          className="article-img"
                          decoding="async"
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                          <FileText size={40} style={{ opacity: 0.5 }} />
                        </div>
                      )}
                    </div>

                    {/* Meta & Info Body */}
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 16, 
                        fontSize: 12, 
                        color: 'var(--text-muted)',
                        marginBottom: 12 
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} /> {dateText}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={13} /> {article.views} {language === 'ar' ? 'مشاهدة' : 'views'}
                        </span>
                      </div>

                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        color: 'var(--dark)', 
                        lineHeight: 1.4, 
                        marginBottom: 12,
                        minHeight: 56,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {titleText}
                      </h3>

                      <p style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '0.92rem', 
                        lineHeight: 1.5, 
                        marginBottom: 20,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {summaryText}
                      </p>

                      <Link 
                        to={`/articles/${article.slug}`} 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 6, 
                          color: 'var(--primary)', 
                          fontWeight: '700', 
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          alignSelf: 'flex-start',
                          marginTop: 'auto'
                        }}
                      >
                        {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                        <ArrowRight size={16} style={{ 
                          transform: language === 'ar' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="admin-btn admin-btn-secondary"
                  style={{ minWidth: 40, height: 40, padding: 0, borderRadius: 8 }}
                >
                  &laquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      border: 'none',
                      background: p === page ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                      color: p === page ? '#fff' : 'var(--dark)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="admin-btn admin-btn-secondary"
                  style={{ minWidth: 40, height: 40, padding: 0, borderRadius: 8 }}
                >
                  &raquo;
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default Articles;
