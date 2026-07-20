import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import { Calendar, Eye, ArrowLeft, Loader, FileText, Share2, Check, X } from 'lucide-react';
import api, { resolveField } from '../services/api';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const seo = useSEO();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const fallbackCopyToClipboard = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert(language === 'ar' ? 'يرجى نسخ الرابط من شريط العنوان' : 'Please copy link from address bar');
      }
    } catch (err) {
      console.error('Fallback copy error:', err);
      alert(language === 'ar' ? 'يرجى نسخ الرابط من شريط العنوان' : 'Please copy link from address bar');
    }
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyToClipboard(url);
        });
    } else {
      fallbackCopyToClipboard(url);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: resolveField(article.title, language) || 'EgyField Article',
      text: resolveField(article.summary, language) || '',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
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

  const titleText = resolveField(article.title, language) || '';
  const contentText = resolveField(article.content, language) || '';
  const summaryText = resolveField(article.summary, language) || '';
  const dateLocale = language === 'ar' ? ar : enUS;
  const dateText = article.createdAt 
    ? format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: dateLocale }) 
    : '';

  return (
    <>
      <Helmet>
        <title>{seo.metaTitle ? `${seo.metaTitle} — ${titleText}` : `${titleText} — EgyField Articles`}</title>
        <meta name="description" content={seo.metaDescription || summaryText?.substring(0, 160) || 'Read article on EgyField'} />
        {seo.keywords?.length > 0 && <meta name="keywords" content={seo.keywords.join(', ')} />}
      </Helmet>
    <div className="article-detail-page">
      <div className="container" style={{ maxWidth: 1400 }}>
        
        {/* Back Link */}
        <Link to="/articles" className="back-btn">
          <ArrowLeft size={18} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
          {language === 'ar' ? 'العودة إلى المقالات' : 'Back to Articles'}
        </Link>

        {/* Article Container */}
        <article className="article-full">
          {/* Header Meta */}
          <div className="article-meta-bar">
            <div className="article-meta-info">
              <span className="article-meta-item">
                <Calendar size={15} className="article-meta-icon" /> {dateText}
              </span>
              <span className="article-meta-item">
                <Eye size={15} className="article-meta-icon" /> {article.views} {language === 'ar' ? 'مشاهدة' : 'views'}
              </span>
            </div>

            <button 
              onClick={() => setShowShareModal(true)}
              className="article-share-btn"
            >
              <Share2 size={14} />
              {language === 'ar' ? 'مشاركة المقال' : 'Share Article'}
            </button>
          </div>

          {/* Title */}
          <h1 className="article-title">
            {titleText}
          </h1>

          {/* Excerpt Summary Block */}
          {summaryText && (
            <p className="article-excerpt">
              {summaryText}
            </p>
          )}

          {/* Featured Image */}
          {article.image?.url && (
            <div className="article-image-box">
              <img 
                src={article.image.url} 
                alt={titleText} 
                decoding="async"
              />
            </div>
          )}

          {/* Body Content */}
          <div 
            dangerouslySetInnerHTML={{ __html: contentText }}
            className="article-body-content"
          />

        </article>
      </div>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>{language === 'ar' ? 'مشاركة المقال' : 'Share Article'}</h3>
              <button className="share-modal-close" onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="share-modal-body">
              <p className="share-modal-subtitle">
                {language === 'ar' ? 'اختر التطبيق الذي تود مشاركة المقال عبره:' : 'Choose where you want to share this article:'}
              </p>
              
              <div className="share-options-grid">
                {/* WhatsApp */}
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(titleText + ' ' + window.location.href)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="share-option-btn whatsapp"
                >
                  <div className="share-icon-wrap">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.56 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                </a>
                
                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="share-option-btn facebook"
                >
                  <div className="share-icon-wrap">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span>{language === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
                </a>
                
                {/* Twitter / X */}
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(titleText)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="share-option-btn twitter"
                >
                  <div className="share-icon-wrap">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span>{language === 'ar' ? 'تويتر / X' : 'Twitter / X'}</span>
                </a>
                
                {/* LinkedIn */}
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="share-option-btn linkedin"
                >
                  <div className="share-icon-wrap">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <span>{language === 'ar' ? 'لينكد إن' : 'LinkedIn'}</span>
                </a>
              </div>
              
              <div className="share-modal-divider">
                <span>{language === 'ar' ? 'أو انسخ رابط المقال' : 'or copy the article link'}</span>
              </div>
              
              <div className="share-copy-field">
                <input type="text" readOnly value={window.location.href} />
                <button 
                  className={`share-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                  <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ArticleDetail;
