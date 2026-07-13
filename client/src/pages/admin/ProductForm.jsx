import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useProducts';
import { LanguageContext } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload, X, Loader } from 'lucide-react';
import compressImage from '../../utils/imageCompression';

const ProductForm = () => {
  const { t, language } = useContext(LanguageContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { data: categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [form, setForm] = useState({
    nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
    category: '', origin: 'Egypt', packaging: '', season: 'Year-round',
    certifications: '["ISO 22000","HACCP"]', featured: false, isActive: true,
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(res => {
      const p = res.data;
      setForm({
        nameEn: p.name?.en || '', nameAr: p.name?.ar || '',
        descriptionEn: p.description?.en || '', descriptionAr: p.description?.ar || '',
        category: p.category?._id || '', origin: p.origin || 'Egypt',
        packaging: p.packaging || '', season: p.season || 'Year-round',
        certifications: JSON.stringify(p.certifications || []),
        featured: p.featured || false, isActive: p.isActive !== false,
      });
      setExistingImages(p.images || []);
      setFetching(false);
    }).catch(() => { 
      toast.error(language === 'ar' ? 'المنتج غير موجود' : 'Product not found'); 
      navigate('/admin/products'); 
    });
  }, [id, isEdit, navigate, language]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = async (e) => {
  const originals = Array.from(e.target.files);
  const compressed = await Promise.all(originals.map(f => compressImage(f)));
  setFiles(prev => [...prev, ...compressed]);
};

  const handleRemoveExisting = (publicId) => {
    setRemoveImages(prev => [...prev, publicId]);
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    files.forEach(f => data.append('images', f));
    if (removeImages.length) data.append('removeImages', JSON.stringify(removeImages));

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(language === 'ar' ? 'تم تحديث المنتج بنجاح!' : 'Product updated!');
      } else {
        await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success(language === 'ar' ? 'تم إنشاء المنتج بنجاح!' : 'Product created!');
      }
      navigate('/admin/products');
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed'); 
    }
    setLoading(false);
  };

  if (fetching) return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={24} className="spin" /></div>;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={16} /> {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
        </button>
      </div>

      <div className="admin-data-table-wrapper" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Outfit', marginBottom: 24 }}>
          {isEdit ? (language === 'ar' ? 'تعديل منتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'اسم المنتج بالإنجليزية' : 'Product Name (English)'}</label>
              <input className="admin-form-control" name="nameEn" value={form.nameEn} onChange={handleChange} required />
            </div>
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'اسم المنتج بالعربية' : 'Product Name (Arabic)'}</label>
              <input className="admin-form-control" name="nameAr" value={form.nameAr} onChange={handleChange} required style={{ direction: 'rtl' }} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}</label>
              <textarea className="admin-form-control" name="descriptionEn" value={form.descriptionEn} onChange={handleChange} required />
            </div>
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}</label>
              <textarea className="admin-form-control" name="descriptionAr" value={form.descriptionAr} onChange={handleChange} required style={{ direction: 'rtl' }} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>{t('admin.category')}</label>
              <select className="admin-form-control" name="category" value={form.category} onChange={handleChange} required>
                <option value="">{language === 'ar' ? 'اختر قسم' : 'Select Category'}</option>
                {categories?.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name?.[language] || c.name?.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'المنشأ' : 'Origin'}</label>
              <input className="admin-form-control" name="origin" value={form.origin} onChange={handleChange} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>{language === 'ar' ? 'التعبئة والتغليف' : 'Packaging'}</label>
              <input className="admin-form-control" name="packaging" value={form.packaging} onChange={handleChange} placeholder="e.g. 500g, 1kg, 5kg" />
            </div>
            <div className="admin-form-group">
              <label>{t('admin.season')}</label>
              <input className="admin-form-control" name="season" value={form.season} onChange={handleChange} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>{language === 'ar' ? 'الشهادات (تنسيق JSON)' : 'Certifications (JSON array)'}</label>
            <input className="admin-form-control" name="certifications" value={form.certifications} onChange={handleChange} />
          </div>

          {/* Images */}
          <div className="admin-form-group">
            <label>{language === 'ar' ? 'الصور' : 'Images'}</label>
            {existingImages.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {existingImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={img.url} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--admin-border)' }} />
                    <button type="button" onClick={() => handleRemoveExisting(img.publicId)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--admin-danger)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, border: '2px dashed var(--admin-border)', borderRadius: 'var(--admin-radius)', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: 13, gap: 8 }}>
              <Upload size={18} /> {language === 'ar' ? 'اسحب الصور هنا أو انقر للتصفح' : 'Drop images or click to browse'}
              <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--admin-text-muted)' }}>
                {files.length} {language === 'ar' ? 'ملفات جديدة تم اختيارها' : 'new file(s) selected'}
              </div>
            )}
          </div>

          <div className="admin-form-row" style={{ marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> {language === 'ar' ? 'منتج مميز (في الرئيسية)' : 'Featured Product'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> {language === 'ar' ? 'نشط (ظاهر في الموقع)' : 'Active (visible on website)'}
            </label>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/products')}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? <Loader size={16} className="spin" /> : <><Save size={16} /> {isEdit ? (language === 'ar' ? 'تحديث المنتج' : 'Update Product') : (language === 'ar' ? 'نشر المنتج' : 'Publish Product')}</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductForm;
