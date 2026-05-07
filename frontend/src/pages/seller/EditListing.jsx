import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import ListingForm from '../../components/seller/ListingForm';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/seller/products')
      .then(r => {
        const p = (r.data.data || []).find(x => String(x.id) === id);
        if (!p) setFetchError('Product not found');
        else setProduct(p);
      })
      .catch(() => setFetchError('Failed to load product'));
  }, [id]);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/seller/products/${id}`, form);
      navigate('/seller/listings');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="flex justify-center items-center h-40">
        <p className="text-[#CC0C39]">{fetchError}</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <nav className="text-[12px] text-[#565959] mb-4">
          <Link to="/seller/listings" className="hover:underline">My Listings</Link>
          <span className="mx-2">›</span>
          <span className="line-clamp-1">{product.name}</span>
        </nav>
        <h1 className="text-[21px] font-bold text-[#0F1111] mb-4">Edit Product</h1>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#CC0C39] text-[13px] rounded mb-4">{error}</div>
        )}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
          <ListingForm initial={product} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
