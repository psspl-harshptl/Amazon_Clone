import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-[#FFA41C]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-[12px] text-[#007185] ml-1">{rating || 0}</span>
  </div>
);

export default function Storefront() {
  const { sellerId } = useParams();
  const { addToCart } = useCart();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/stores/${sellerId}`)
      .then(r => setStoreData(r.data.data))
      .catch(e => {
        console.error(e);
        setErr('Storefront not found or seller is not approved.');
      })
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#EAEDED] min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF9900]" />
      </div>
    );
  }

  if (err || !storeData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#EAEDED] min-h-[60vh]">
        <h3 className="text-xl font-bold text-[#0F1111] mb-2">Store Not Found</h3>
        <p className="text-gray-500 mb-6 max-w-sm">{err || 'This store does not exist or has been suspended.'}</p>
        <Link to="/" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-5 py-2 rounded shadow-sm text-[13px] font-medium text-black">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const { seller, products } = storeData;
  const storeInitials = (seller.storeName || seller.name || 'S').slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-16">
      {/* Store Identity & Profile Header Section */}
      <div className="max-w-6xl w-full mx-auto px-4 pt-8 mb-6 relative z-10">
        <div className="bg-white border border-gray-200 rounded-lg p-5 md:p-6 shadow-md flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5">
          {/* Logo */}
          {seller.storeLogo ? (
            <img src={seller.storeLogo} alt="Logo" className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-lg border bg-white p-2 shadow-sm flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-[#FFD814] text-black font-extrabold text-2xl md:text-3xl flex items-center justify-center border border-yellow-400 shadow-sm flex-shrink-0">
              {storeInitials}
            </div>
          )}

          {/* Details */}
          <div className="flex-1 space-y-2 pt-1">
            <h1 className="text-[22px] md:text-[28px] font-bold text-[#0F1111] leading-tight">
              {seller.storeName || seller.name}
            </h1>
            <p className="text-[13px] text-[#565959] font-medium">Approved Amazon Seller since {(new Date()).getFullYear()}</p>
            {seller.storeDescription && (
              <p className="text-[14px] text-[#333] leading-relaxed max-w-3xl pt-1">
                {seller.storeDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl w-full mx-auto px-4">
        <div className="border-b border-gray-300 pb-3 mb-6 flex justify-between items-center bg-transparent">
          <h2 className="text-[20px] font-bold text-[#0F1111]">Products ({products.length})</h2>
          <span className="text-[13px] text-[#565959]">All listings are genuine and backed by Amazon A-to-z Guarantee.</span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center shadow-sm">
            <h3 className="text-lg font-bold text-[#0F1111] mb-2">No active listings</h3>
            <p className="text-gray-500 text-[13px]">This seller hasn't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative">
                
                {/* Badge tags */}
                {p.is_best_seller && (
                  <span className="absolute top-2 left-2 bg-[#E47911] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold z-10 uppercase tracking-wider">
                    Best Seller
                  </span>
                )}
                {p.is_top_deal && (
                  <span className="absolute top-2 right-2 bg-[#CC0C39] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold z-10 uppercase tracking-wider">
                    Deal
                  </span>
                )}

                {/* Product Image */}
                <Link to={`/products/${p.id}`} className="h-48 w-full bg-white flex items-center justify-center p-4 border-b border-gray-100 flex-shrink-0">
                  <img src={p.imageUrl} alt={p.name} className="h-full object-contain transition-transform group-hover:scale-105" />
                </Link>

                {/* Product Details */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#565959] uppercase tracking-wider">{p.category?.name}</div>
                    <Link to={`/products/${p.id}`} className="text-[14px] font-medium text-[#0F1111] hover:text-[#C7511F] hover:underline line-clamp-2 leading-snug">
                      {p.name}
                    </Link>
                    <StarRating rating={p.rating} />
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-[#0F1111]">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-[#565959] line-through">₹{Number(p.mrp).toLocaleString('en-IN')}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(p, 1);
                      }}
                      className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-black text-[12px] font-medium py-1.5 rounded shadow-sm transition-colors text-center focus:outline-none"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
