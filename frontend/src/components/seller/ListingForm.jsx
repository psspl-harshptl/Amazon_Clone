import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

const BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const MAX_IMAGES = 10;

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-[13px] font-bold text-[#0F1111] mb-1">
      {label}{required && <span className="text-[#CC0C39] ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm text-[#0F1111] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
  />
);

export default function ListingForm({ initial = {}, onSubmit, loading }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', mrp: '',
    stock: '', categoryId: '', brand: '', discount_percent: '',
    ...initial,
  });

  // existing = URLs already on server; newFiles = {file, preview} not yet uploaded
  const [existingUrls, setExistingUrls] = useState(() => {
    if (initial.galleryImages?.length > 0) return initial.galleryImages.map(g => g.url);
    return initial.imageUrl ? [initial.imageUrl] : [];
  });
  const [newFiles, setNewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const totalImages = existingUrls.length + newFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data.data || []));
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const addFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
    const slots = MAX_IMAGES - totalImages;
    const toAdd = imgs.slice(0, slots).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewFiles(prev => [...prev, ...toAdd]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (canAddMore) addFiles(e.dataTransfer.files);
  };

  const removeExisting = (url) => setExistingUrls(prev => prev.filter(u => u !== url));

  const removeNew = (idx) => {
    setNewFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Product name is required');
    if (!form.price || parseFloat(form.price) <= 0) return setError('Price must be greater than 0');
    if (!form.categoryId) return setError('Category is required');

    let uploadedUrls = [];
    if (newFiles.length > 0) {
      setUploading(true);
      try {
        const fd = new FormData();
        newFiles.forEach(({ file }) => fd.append('images', file));
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploadedUrls = res.data.data.urls.map(url => `${BASE}${url}`);
      } catch {
        setError('Image upload failed. Please try again.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const imageUrls = [...existingUrls, ...uploadedUrls];
    onSubmit({ ...form, imageUrl: imageUrls[0] || '', imageUrls });
  };

  const busy = loading || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#CC0C39] text-xs rounded">{error}</div>
      )}

      {/* Image Upload */}
      <Field label={`Product Images (${totalImages}/${MAX_IMAGES})`}>
        {/* Thumbnail strip */}
        {totalImages > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingUrls.map((url, i) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt=""
                  className="w-20 h-20 object-contain rounded border border-gray-200 bg-gray-50"
                />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-[#232F3E]/70 text-white rounded-b py-0.5">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExisting(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#CC0C39] text-white rounded-full text-[11px] font-bold leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
              </div>
            ))}
            {newFiles.map(({ preview }, i) => {
              const isMain = existingUrls.length === 0 && i === 0;
              return (
                <div key={preview} className="relative group">
                  <img
                    src={preview}
                    alt=""
                    className="w-20 h-20 object-contain rounded border border-[#e77600] bg-gray-50"
                  />
                  {isMain && (
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-[#232F3E]/70 text-white rounded-b py-0.5">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#CC0C39] text-white rounded-full text-[11px] font-bold leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Dropzone */}
        {canAddMore && (
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 text-center ${
              dragOver ? 'border-[#e77600] bg-orange-50' : 'border-gray-300 hover:border-[#e77600]'
            }`}
          >
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm font-medium text-[#0066c0]">
              {totalImages === 0 ? 'Upload images' : 'Add more'}
            </p>
            <p className="text-xs text-gray-400">
              Click or drag & drop · JPEG, PNG, WebP · any size · up to {MAX_IMAGES - totalImages} more
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </Field>

      {/* Name */}
      <Field label="Product Name" required>
        <Input value={form.name} onChange={set('name')} placeholder="Enter product name" />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select
            value={form.categoryId}
            onChange={set('categoryId')}
            className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm text-[#0F1111] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] bg-white"
          >
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="Brand">
          <Input value={form.brand} onChange={set('brand')} placeholder="Brand name" />
        </Field>

        <Field label="Price (₹)" required>
          <Input type="number" min="0.01" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
        </Field>

        <Field label="MRP (₹)">
          <Input type="number" min="0" step="0.01" value={form.mrp} onChange={set('mrp')} placeholder="0.00" />
        </Field>

        <Field label="Stock Quantity">
          <Input type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" />
        </Field>

        <Field label="Discount (%)">
          <Input type="number" min="0" max="100" value={form.discount_percent} onChange={set('discount_percent')} placeholder="0" />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={4}
          placeholder="Describe your product…"
          className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm text-[#0F1111] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
        />
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] disabled:opacity-60 py-2 rounded shadow-sm text-sm font-medium transition-all"
      >
        {uploading ? 'Uploading images…' : loading ? 'Saving…' : 'Submit for Approval'}
      </button>
    </form>
  );
}
