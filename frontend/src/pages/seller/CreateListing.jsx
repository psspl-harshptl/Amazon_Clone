import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import ListingForm from '../../components/seller/ListingForm';

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/seller/products', form);
      navigate('/seller/listings');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <nav className="text-[12px] text-[#565959] mb-4">
          <Link to="/seller/listings" className="hover:underline">My Listings</Link>
          <span className="mx-2">›</span>
          <span>Add New Product</span>
        </nav>
        <h1 className="text-[21px] font-bold text-[#0F1111] mb-4">Add New Product</h1>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#CC0C39] text-[13px] rounded mb-4">{error}</div>
        )}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
          <ListingForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
