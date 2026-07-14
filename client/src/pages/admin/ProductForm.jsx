import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useProducts';
import { LanguageContext } from '../../context/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload, X, Loader, Plus, Trash2, FileText, Image } from 'lucide-react';
import compressImage from '../../utils/imageCompression';
import uploadToCloudinary from '../../utils/directUpload';
import TranslateButton from '../../components/TranslateButton';

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
    featured: false, isActive: true,
  });
  const [certifications, setCertifications] = useState([
    { name: 'ISO 22000', type: 'text' },
    { name: 'HACCP', type: 'text' },
  ]);
  const [certUploading, setCertUploading] = useState(false);
  const [specifications, setSpecifications] = useState([
    { enLabel: 'Properties', arLabel: 'الخاصية', value: '' },
    { enLabel: 'Details', arLabel: 'تفاصيل', value: '' },
    { enLabel: 'Ingredients', arLabel: 'المكونات', value: '' },
    { enLabel: 'Available Sizes', arLabel: 'المقاسات المتاحة', value: '' },
    { enLabel: 'Processing Steps', arLabel: 'خطوات المعالجة', value: '' },
    { enLabel: 'Characteristics', arLabel: 'الخصائص', value: '' },
    { enLabel: 'Packaging', arLabel: 'التعبئة', value: '' },
    { enLabel: 'Shelf Life', arLabel: 'مدة الصلاحية', value: '' },
  ]);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(res => {
      const p = res.data;
      setForm({
        nameEn: p.name?.en || '', nameAr: p.name?.ar || '',
        descriptionEn: p.description?.en || '', descriptionAr: p.description?.ar || '',
        category: p.category?._id || '', origin: p.origin || 'Egypt',
        packaging: p.packaging || '', season: p.season || 'Year-round',
        featured: p.featured || false, isActive: p.isActive !== false,
      });
      // Normalize certifications: support both old (string[]) and new ({name,type,url,publicId}[])
      const rawCerts = p.certifications || [];
      setCertifications(rawCerts.map(c => typeof c === 'string' ? { name: c, type: 'text' } : c));
      setExistingImages(p.images || []);
      if (p.specifications?.length) setSpecifications(p.specifications);
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

  const addTextCert = () => {
    setCertifications(prev => [...prev, { name: '', type: 'text' }]);
  };
  const removeCert = (i) => {
    setCertifications(prev => prev.filter((_, idx) => idx !== i));
  };
  const updateCertName = (i, val) => {
    setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, name: val } : c));
  };
  const handleCertFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCertUploading(true);
    try {
      const isPdf = file.type === 'application/pdf';
      const uploadFile = isPdf ? file : await compressImage(file);
      const result = await uploadToCloudinary(uploadFile, isPdf ? 'raw' : 'image');
      setCertifications(prev => [...prev, { name: file.name.replace(/\.[^.]+$/, ''), url: result.url, publicId: result.publicId, type: isPdf ? 'pdf' : 'image' }]);
    } catch (err) {
      toast.error(language === 'ar' ? 'فشل رفع الملف' : 'File upload failed');
    }
    setCertUploading(false);
    e.target.value = '';
  };

  const addSpecRow = () => {
    setSpecifications(prev => [...prev, { enLabel: '', arLabel: '', value: '' }]);
  };
  const removeSpecRow = (i) => {
    setSpecifications(prev => prev.filter((_, idx) => idx !== i));
  };
  const updateSpec = (i, field, val) => {
    setSpecifications(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imagesData = [];
    if (files.length > 0) {
      const results = await Promise.all(files.map(f => uploadToCloudinary(f)));
      imagesData = results;
    }
    const payload = {
      ...form,
      imagesData: JSON.stringify(imagesData),
      removeImages: JSON.stringify(removeImages),
      certifications: JSON.stringify(certifications.filter(c => c.name)),
      specifications: JSON.stringify(specifications.filter(s => s.enLabel || s.arLabel)),
    };

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success(language === 'ar' ? 'تم تحديث المنتج بنجاح!' : 'Product updated!');
      } else {
        await api.post('/products', payload);
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
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <TranslateButton sourceText={form.nameEn} targetLang="ar" onTranslated={v => setForm(p => ({ ...p, nameAr: v }))} />
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
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <TranslateButton sourceText={form.descriptionEn} targetLang="ar" onTranslated={v => setForm(p => ({ ...p, descriptionAr: v }))} />
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
          {/* Certifications */}
          <div className="admin-form-group">
            <label>{language === 'ar' ? 'الشهادات' : 'Certifications'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {certifications.map((cert, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--admin-bg)', padding: '6px 10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}>
                  {cert.type === 'text' ? (
                    <input className="admin-form-control" value={cert.name} onChange={e => updateCertName(i, e.target.value)} placeholder={language === 'ar' ? 'اسم الشهادة' : 'Certification name'} style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px 0', fontSize: 13 }} />
                  ) : cert.type === 'pdf' ? (
                    <>
                      <FileText size={16} color="var(--admin-danger)" />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--admin-text)' }}>{cert.name}</span>
                      {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--admin-primary)' }}>{language === 'ar' ? 'عرض' : 'View'}</a>}
                    </>
                  ) : (
                    <>
                      <Image size={16} color="var(--admin-primary)" />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--admin-text)' }}>{cert.name}</span>
                      {cert.url && <img src={cert.url} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />}
                    </>
                  )}
                  <button type="button" onClick={() => removeCert(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--admin-danger)', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addTextCert}>
                <Plus size={14} /> {language === 'ar' ? 'إضافة نص' : 'Add Text'}
              </button>
              <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {certUploading ? <Loader size={14} className="spin" /> : <Upload size={14} />}
                {language === 'ar' ? 'رفع ملف' : 'Upload File'}
                <input type="file" accept="image/*,application/pdf" onChange={handleCertFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="admin-form-group">
            <label style={{ marginBottom: 8, display: 'block' }}>
              {language === 'ar' ? 'جدول المواصفات (خاصية / قيمة)' : 'Specifications Table'}
            </label>
            {specifications.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input className="admin-form-control" placeholder={language === 'ar' ? 'التسمية (إنج)' : 'Label (EN)'} value={s.enLabel} onChange={e => updateSpec(i, 'enLabel', e.target.value)} style={{ width: 140 }} />
                <TranslateButton sourceText={s.enLabel} targetLang="ar" onTranslated={v => updateSpec(i, 'arLabel', v)} />
                <input className="admin-form-control" placeholder={language === 'ar' ? 'التسمية (عربي)' : 'Label (AR)'} value={s.arLabel} onChange={e => updateSpec(i, 'arLabel', e.target.value)} style={{ width: 140 }} />
                <input className="admin-form-control" placeholder={language === 'ar' ? 'القيمة' : 'Value'} value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} style={{ flex: 1 }} />
                <button type="button" onClick={() => removeSpecRow(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--admin-danger)', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addSpecRow}>
              <Plus size={14} /> {language === 'ar' ? 'إضافة خاصية' : 'Add Row'}
            </button>
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
