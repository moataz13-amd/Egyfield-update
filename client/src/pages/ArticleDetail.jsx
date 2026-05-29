import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Calendar, Eye, ArrowLeft, Loader, FileText, Share2, Check } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.get(`/articles/slug/${slug}`)
      .then(res => {
        setArticle(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load article detail:', err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fafafa' }}>
        <Loader className="spin" size={40} style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fafafa', padding: 20 }}>
        <FileText size={48} style={{ color: '#dc3545', marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--dark)', marginBottom: 8 }}>
          {language === 'ar' ? 'المقال غير موجود!' : 'Article Not Found'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center' }}>
          {language === 'ar' ? 'عذراً، يبدو أن هذا المقال تم حذفه أو غير منشور حالياً.' : 'The article you are looking for does not exist or has been removed.'}
        </p>
        <Link to="/articles" className="btn btn-primary">
          {language === 'ar' ? 'العودة لصفحة المقالات' : 'Back to Articles'}
        </Link>
      </div>
    );
  }

  const titleText = article.title?.[language] || article.title?.en || article.title?.ar || '';
  const contentText = article.content?.[language] || article.content?.en || article.content?.ar || '';
  const summaryText = article.summary?.[language] || article.summary?.en || article.summary?.ar || '';
  const dateLocale = language === 'ar' ? ar : enUS;
  const dateText = article.createdAt 
    ? format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: dateLocale }) 
    : '';

  return (
    <div className="article-detail-page" style={{ minHeight: '100vh', padding: '140px 0 80px', background: '#fafafa' }}>
      <div className="container" style={{ maxWidth: 850 }}>
        
        {/* Back Link */}
        <Link 
          to="/articles" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--primary)',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '0.95rem',
            marginBottom: 32,
            transition: 'color 0.2s'
          }}
          className="back-btn"
        >
          <ArrowLeft size={18} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
          {language === 'ar' ? 'العودة إلى المقالات' : 'Back to Articles'}
        </Link>

        {/* Article Container */}
        <article style={{
          background: '#fff',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.03)',
          border: '1px solid #f0f0f0',
          padding: '40px 32px'
        }}
        className="article-full"
        >
          {/* Header Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 20, 
              fontSize: '0.9rem', 
              color: 'var(--text-muted)' 
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} style={{ color: 'var(--primary)' }} /> {dateText}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={15} style={{ color: 'var(--primary)' }} /> {article.views} {language === 'ar' ? 'مشاهدة' : 'views'}
              </span>
            </div>

            <button 
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: copied ? '#7bb445' : 'rgba(0,0,0,0.03)',
                color: copied ? '#fff' : 'var(--dark)',
                border: 'none',
                borderRadius: 50,
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s'
              }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied 
                ? (language === 'ar' ? 'تم نسخ الرابط!' : 'Link Copied!') 
                : (language === 'ar' ? 'مشاركة المقال' : 'Share Article')}
            </button>
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', 
            fontWeight: 800, 
            color: 'var(--dark)', 
            lineHeight: 1.3, 
            marginBottom: 24,
            direction: language === 'ar' ? 'rtl' : 'ltr'
          }}>
            {titleText}
          </h1>

          {/* Short summary block */}
          {summaryText && (
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              borderLeft: language === 'ar' ? 'none' : '4px solid var(--primary)',
              borderRight: language === 'ar' ? '4px solid var(--primary)' : 'none',
              paddingLeft: language === 'ar' ? 0 : 16,
              paddingRight: language === 'ar' ? 16 : 0,
              background: 'rgba(123, 180, 69, 0.03)',
              padding: '16px 20px',
              borderRadius: 8,
              marginBottom: 32,
              fontWeight: '500',
              direction: language === 'ar' ? 'rtl' : 'ltr'
            }}>
              {summaryText}
            </p>
          )}

          {/* Featured Image */}
          {article.image?.url && (
            <div style={{ 
              borderRadius: 16, 
              overflow: 'hidden', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
              marginBottom: 40,
              aspectRatio: '16/9',
              background: '#eaeaea'
            }}>
              <img 
                src={article.image.url} 
                alt={titleText} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          )}

          {/* Body Content */}
          <div 
            style={{ 
              fontSize: '1.125rem', 
              lineHeight: 1.8, 
              color: '#333', 
              textAlign: 'justify',
              direction: language === 'ar' ? 'rtl' : 'ltr',
              whiteSpace: 'pre-line' // respects newlines and linebreaks
            }}
            dangerouslySetInnerHTML={{ __html: contentText }}
            className="article-body-content"
          />

        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;
