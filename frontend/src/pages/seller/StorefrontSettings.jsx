import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import { useAuth } from '../../context/AuthContext';

export default function StorefrontSettings() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch current settings (we can get from auth me or stats)
    api.get('/auth/me')
      .then(r => {
        const u = r.data.data;
        setStoreName(u.storeName || '');
        setStoreLogo(u.storeLogo || '');
        setStoreDescription(u.storeDescription || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setErr('Only image files (JPEG, PNG, WEBP, GIF) are allowed');
      return;
    }

    setUploading(true);
    setErr('');
    setMsg('');

    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success && response.data.data.urls?.length > 0) {
        const serverBase = api.defaults.baseURL.replace('/api/v1', '');
        const fullUrl = `${serverBase}${response.data.data.urls[0]}`;
        setStoreLogo(fullUrl);
        setMsg('Logo uploaded successfully! Please save settings to commit changes.');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to upload logo image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErr('');

    try {
      await api.put('/seller/storefront', {
        storeName: storeName.trim(),
        storeLogo: storeLogo.trim(),
        storeDescription: storeDescription.trim()
      });

      const updatedUser = {
        ...user,
        storeName: storeName.trim(),
        storeLogo: storeLogo.trim(),
        storeDescription: storeDescription.trim()
      };
      login(updatedUser);

      setMsg('Storefront settings updated successfully!');

      if (!user?.storeName) {
        setTimeout(() => {
          navigate('/seller/dashboard');
        }, 1500);
      }
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to update storefront settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-300 pb-3">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Storefront Customization</h1>
          {user?.storeName && (
            <a
              href={`/stores/${user?.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
            >
              View Public Storefront ↗
            </a>
          )}
        </div>

        {!user?.storeName && (
          <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 text-[13px] rounded shadow-sm">
            <h4 className="font-bold text-[14px] mb-1">⚠️ Action Required: Setup Your Storefront</h4>
            <p className="leading-relaxed">
              To activate your seller central dashboard, please configure your storefront customization details. A store display name is required.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded shadow-sm p-6 space-y-5">
            {msg && (
              <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded shadow-sm">{msg}</div>
            )}
            {err && (
              <div className="p-3 bg-[#FFBABA] border border-[#D8000C] text-[#D8000C] text-[13px] rounded shadow-sm">{err}</div>
            )}

            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">Store Display Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Tech Solutions"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
              />
              <p className="text-[11px] text-[#565959] mt-1">This name will be displayed on the product details page and your public storefront.</p>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">Store Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading || saving}
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] bg-white cursor-pointer"
              />
              {uploading && <p className="text-[12px] text-gray-500 mt-1">Uploading logo image...</p>}
              {storeLogo && (
                <div className="mt-2">
                  <span className="text-[11px] text-[#565959] block mb-1">Logo Preview:</span>
                  <img src={storeLogo} alt="Logo Preview" className="w-16 h-16 object-contain border rounded p-1 bg-[#F7F8F8]" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">Store Biography / Description</label>
              <textarea
                rows={4}
                placeholder="Describe your brand, return policy, or what makes your store unique…"
                value={storeDescription}
                onChange={e => setStoreDescription(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
              />
              <p className="text-[11px] text-[#565959] mt-1">Accepts plain text. Use this space to write a warm greeting or describe your specialties.</p>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-6 py-2 rounded shadow-sm text-[13px] font-medium text-center transition-colors focus:outline-none disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
