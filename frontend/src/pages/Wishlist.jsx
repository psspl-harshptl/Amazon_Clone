import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const StarRating = ({ rating, size = "w-3.5 h-3.5" }) => (
  <div className="flex text-[#FFA41C]">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} className={`${size} ${s <= Math.round(rating) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { fetchCart } = useCart(); // consume fetchCart to update global count after move

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      setError('Failed to load Wish List items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      const res = await api.delete(`/wishlist/${id}`);
      if (res.data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        showToast('Item removed from Wish List.');
      }
    } catch (err) {
      setError('Failed to remove item.');
    }
  };

  const handleMoveToCart = async (id) => {
    try {
      const res = await api.post(`/wishlist/${id}/move-to-cart`);
      if (res.data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        fetchCart(); // Update global cart drawer
        showToast('Moved item to Cart!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to move item to cart.');
    }
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="bg-[#EAEDED] min-h-screen py-8 pb-20">
      <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Quick Actions / List Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-[#D5D9D9] shadow-sm">
            <h2 className="text-sm font-bold text-[#0F1111] pb-2 border-b border-gray-100">Your Lists</h2>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-800 bg-[#FCF5EE] border-l-4 border-[#E47911] p-2.5 rounded-r">
              <span>Shopping List</span>
              <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 font-bold text-[10px]">{items.length}</span>
            </div>
          </div>
        </div>

        {/* Right column: Items List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-6 rounded-lg border border-[#D5D9D9] shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h1 className="text-[20px] font-medium text-[#0F1111]">Shopping List</h1>
              <span className="text-[13px] text-gray-500 font-medium">Default List</span>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {successMsg}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-[16px] font-bold text-[#0F1111] mb-1">Your Wish List is empty.</p>
                <p className="text-sm">Explore products and click 'Add to Wish List' to save them here.</p>
                <Link to="/" className="inline-block mt-4 bg-[#FFD814] px-6 py-2 rounded-lg text-xs font-medium shadow-sm hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200]">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map(item => {
                  const prod = item.product;
                  if (!prod) return null;
                  
                  const isOutOfStock = prod.variants?.length > 0 
                    ? item.variant && item.variant.stock === 0
                    : prod.stock === 0;

                  return (
                    <div key={item.id} className="py-5 flex flex-col md:flex-row gap-5 first:pt-0 last:pb-0">
                      {/* Product Image */}
                      <Link to={`/products/${prod.id}`} className="w-[120px] h-[120px] border border-gray-100 rounded bg-white flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                        <img 
                          src={prod.imageUrl || '/images/products/placeholder.png'} 
                          alt={prod.name} 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                        />
                      </Link>

                      {/* Info & Actions */}
                      <div className="flex-grow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <Link to={`/products/${prod.id}`} className="text-[14px] font-medium text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2 leading-tight">
                            {prod.name}
                          </Link>
                          
                          {/* Variant info */}
                          {item.variant && (
                            <p className="text-xs text-gray-500 font-bold bg-gray-50 border border-gray-100 inline-block px-2 py-0.5 rounded">
                              {item.variant.size && `Size: ${item.variant.size}`}
                              {item.variant.size && item.variant.color && ' / '}
                              {item.variant.color && `Color: ${item.variant.color}`}
                            </p>
                          )}

                          {/* Ratings */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <StarRating rating={prod.rating} />
                            <span className="text-[#007185] hover:underline cursor-pointer">{prod.reviewCount}</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-[#B12704]">₹</span>
                            <span className="text-lg font-bold text-[#B12704]">{parseFloat(prod.price).toLocaleString('en-IN')}</span>
                            {prod.mrp > prod.price && (
                              <span className="text-xs text-gray-500 line-through">₹{parseFloat(prod.mrp).toLocaleString('en-IN')}</span>
                            )}
                          </div>

                          {/* Stock Status */}
                          <p className={`text-[12px] font-medium ${isOutOfStock ? 'text-[#CC0C39]' : 'text-green-700'}`}>
                            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 w-full md:w-44 flex-shrink-0">
                          <button
                            onClick={() => handleMoveToCart(item.id)}
                            disabled={isOutOfStock}
                            className={`w-full py-1.5 rounded-full text-xs font-medium shadow-sm transition-colors border
                              ${isOutOfStock 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                : 'bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] text-[#0f1111]'}`}
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="w-full py-1.5 rounded-lg border border-[#D5D9D9] hover:bg-gray-50 text-[11px] font-medium text-[#0F1111] shadow-sm transition-colors"
                          >
                            Delete item
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
