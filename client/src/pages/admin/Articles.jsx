import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { 
  FileText, Plus, Search, Edit2, Trash2, Eye, Calendar, ToggleLeft, ToggleRight, Loader 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const ArticlesList = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState(null);

  const fetchArticles = () => {
    setLoading(true);
    api.get(`/articles?admin=true&page=${page}&limit=10&search=${search}`)
      .then(res => {
        setArticles(res.data.articles || []);
        setTotalPages(res.data.pages || 1);
        setLoading(false);
      })
      .catch(() => {
        toast.error(language === 'ar' ? 'فشل تحميل المقالات' : 'Failed to load articles');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search]);

  const handleToggleActive = async (id, currentStatus) => {
    setToggling(id);
    try {
      const art = articles.find(a => a._id === id);
      const updateData = {
        title: art.title,
        content: art.content,
        summary: art.summary,
        isActive: !currentStatus
      };
      
      await api.put(`/articles/${id}`, updateData);
      setArticles(prev => prev.map(a => a._id === id ? { ...a, isActive: !currentStatus } : a));
      toast.success(language === 'ar' ? 'تم تحديث حالة المقال بنجاح' : 'Article status updated successfully');
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل تحديث حالة المقال' : 'Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟' : 'Are you sure you want to delete this article permanently?')) {
      return;
    }

    try {
      await api.delete(`/articles/${id}`);
      setArticles(prev => prev.filter(a => a._id !== id));
      toast.success(language === 'ar' ? 'تم حذف المقال بنجاح' : 'Article deleted successfully');
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل حذف المقال' : 'Failed to delete article');
    }
  };

  const dateLocale = language === 'ar' ? ar : enUS;

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            {language === 'ar' ? 'إدارة المقالات والأخبار' : 'Articles & News Manager'}
          </h3>
          <p className="admin-text-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
            {language === 'ar' ? 'أنشئ، عدل، أو احذف المقالات والأخبار المنشورة في موقعك.' : 'Create, edit, or delete articles and news published on your site.'}
          </p>
        </div>
        <Link to="/admin/articles/new" className="admin-btn admin-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          {language === 'ar' ? 'كتابة مقال جديد' : 'Write New Article'}
        </Link>
      </div>

      {/* Search Input */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)' }}>
        <div style={{ position: 'relative', maxWidth: 350 }}>
          <input
            type="text"
            className="admin-form-control"
            placeholder={language === 'ar' ? 'ابحث بالعنوان أو الملخص...' : 'Search title or summary...'}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: language === 'ar' ? 12 : 36, paddingRight: language === 'ar' ? 36 : 12 }}
          />
          <Search size={16} style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: language === 'ar' ? 'auto' : 12,
            right: language === 'ar' ? 12 : 'auto',
            color: 'var(--admin-text-muted)'
          }} />
        </div>
      </div>

      {/* Articles Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading && articles.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <Loader className="spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--admin-text-muted)' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>{language === 'ar' ? 'لم يتم العثور على أي مقالات.' : 'No articles found.'}</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>{language === 'ar' ? 'الصورة' : 'Image'}</th>
                <th>{language === 'ar' ? 'عنوان المقال' : 'Article Title'}</th>
                <th style={{ width: 140 }}>{language === 'ar' ? 'المشاهدات' : 'Views'}</th>
                <th style={{ width: 150 }}>{language === 'ar' ? 'تاريخ النشر' : 'Published At'}</th>
                <th style={{ width: 130 }}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th style={{ width: 120, textAlign: 'center' }}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => {
                const titleText = article.title?.[language] || article.title?.en || article.title?.ar || 'Untitled';
                const dateText = article.createdAt 
                  ? format(new Date(article.createdAt), 'yyyy-MM-dd', { locale: dateLocale }) 
                  : '-';

                return (
                  <tr key={article._id}>
                    <td>
                      <div style={{ width: 60, height: 40, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--admin-border)', background: '#f5f5f5' }}>
                        {article.image?.url ? (
                          <img src={article.image.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                            <FileText size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{titleText}</div>
                      <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'block', marginTop: 4 }}>
                        slug: /{article.slug}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--admin-text)' }}>
                        <Eye size={14} style={{ color: 'var(--primary)' }} />
                        {article.views}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--admin-text)' }}>
                        <Calendar size={14} style={{ color: 'var(--admin-text-muted)' }} />
                        {dateText}
                      </span>
                    </td>
                    <td>
                      {toggling === article._id ? (
                        <Loader className="spin" size={16} />
                      ) : (
                        <button
                          onClick={() => handleToggleActive(article._id, article.isActive)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: article.isActive ? 'var(--primary)' : 'var(--admin-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                        >
                          {article.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate(`/admin/articles/${article._id}/edit`)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: 6 }}
                          title={language === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: 6, color: 'var(--admin-danger)', borderColor: 'rgba(220, 53, 69, 0.2)' }}
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24, borderTop: '1px solid var(--admin-border)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p}
                onClick={() => setPage(p)}
                className={`admin-btn admin-btn-sm ${p === page ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
