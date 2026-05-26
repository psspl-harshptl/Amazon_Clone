import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const RV_KEY = 'amazon_recently_viewed';

function saveToLocalStorage(p) {
  const stored = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
  const filtered = stored.filter(item => item.id !== p.id);
  const updated = [
    { id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, rating: p.rating, reviewCount: p.reviewCount, discount_percent: p.discount_percent },
    ...filtered
  ].slice(0, 10);
  localStorage.setItem(RV_KEY, JSON.stringify(updated));
}

const StarRating = ({ rating, count, size = "w-4 h-4" }) => (
  <div className="flex items-center gap-1">
    <div className="flex text-[#FFA41C]">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${size} ${s <= Math.round(rating) ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    {count !== undefined && <span className="text-[14px] text-[#007185] ml-1 hover:text-[#C7511F] hover:underline cursor-pointer">{count?.toLocaleString()} ratings</span>}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'specs');

  // Reviews state
  const [reviews, setReviews]           = useState([]);
  const [canReview, setCanReview]       = useState(null); // null | { canReview, orderId, alreadyReviewed }
  const [reviewForm, setReviewForm]     = useState({ rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError]   = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setProduct(p);
          const mainImg = p.galleryImages?.find(img => img.isMain)?.url || p.imageUrl || '/images/products/placeholder.png';
          setActiveImg(mainImg);
          if (user) {
            api.post('/recently-viewed', { productId: Number(id) }).catch(() => {});
          } else {
            saveToLocalStorage(p);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Fetch reviews + canReview whenever product id or user changes
  useEffect(() => {
    if (!id) return;
    api.get(`/reviews/product/${id}`).then(r => { if (r.data.success) setReviews(r.data.data); }).catch(() => {});
    if (user) {
      api.get(`/reviews/can-review/${id}`).then(r => { if (r.data.success) setCanReview(r.data.data); }).catch(() => {});
    }
  }, [id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return setReviewError('Please write a review comment');
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await api.post('/reviews', {
        productId: parseInt(id),
        orderId: canReview.orderId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      if (res.data.success) {
        setReviews(prev => [res.data.data, ...prev]);
        setReviewSuccess(true);
        setCanReview(c => ({ ...c, canReview: false, alreadyReviewed: true }));
        setReviewForm({ rating: 5, title: '', comment: '' });
        // Update product rating display
        setProduct(p => ({
          ...p,
          rating: reviews.length > 0
            ? ((p.rating * reviews.length + reviewForm.rating) / (reviews.length + 1)).toFixed(2)
            : reviewForm.rating,
          reviewCount: (p.reviewCount || 0) + 1,
        }));
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF9900]" />
      <p className="text-gray-500 font-medium">Loading details...</p>
    </div>
  );

  if (error || !product) return (
    <div className="py-20 text-center px-4">
      <h2 className="text-2xl font-bold text-[#CC0C39] mb-4">{error}</h2>
      <Link to="/" className="bg-[#FFD814] px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-[#F7CA00]">Return Home</Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <nav className="max-w-[1500px] mx-auto px-4 py-3 text-[12px] text-[#565959] border-b border-gray-50">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2 text-gray-400">›</span>
        <Link to={`/products?categoryId=${product.categoryId}`} className="hover:underline text-[#007185]">{product.category?.name}</Link>
        <span className="mx-2 text-gray-400">›</span>
        <span className="text-[#565959] font-medium">{product.name}</span>
      </nav>

      <main className="max-w-[1500px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
        {/* Left: Gallery */}
        <div className="lg:col-span-5 flex flex-col md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto no-scrollbar max-h-[500px] min-w-[50px]">
            {(product.galleryImages?.length > 0 ? product.galleryImages : [{url: product.imageUrl}]).map((img, i) => (
              <div
                key={i}
                onMouseEnter={() => setActiveImg(img.url)}
                className={`w-12 h-12 border rounded p-1 cursor-pointer flex-shrink-0 bg-white flex items-center justify-center overflow-hidden transition-all
                  ${activeImg === img.url ? 'border-[#E77600] ring-1 ring-[#E77600]' : 'border-gray-200 hover:border-[#E77600] shadow-sm'}`}
              >
                <img
                  src={img.url}
                  onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                  alt="thumb"
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
          {/* Main Image */}
          <div className="flex-grow order-1 md:order-2 bg-white flex items-center justify-center overflow-hidden h-[450px] border border-gray-50 rounded-lg p-4">
             <img src={activeImg} alt={product.name} className="w-full h-full object-contain hover:scale-[1.02] transition-transform duration-300" />
          </div>
        </div>

        {/* Center: Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-[24px] font-medium leading-snug text-[#0F1111] mb-1">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm mt-2">
               <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline">Visit the {product.brand || 'Store'}</a>
               <StarRating rating={product.rating} count={product.reviewCount} />
            </div>
          </div>

          <div className="space-y-1 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[#CC0C39] text-[28px] font-light">-{product.discount_percent}%</span>
              <div className="flex items-start text-[#0F1111]">
                <span className="text-sm pt-2 font-medium">₹</span>
                <span className="text-[28px] font-medium leading-none">{Number(product.price).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex flex-col text-[14px]">
              <p className="text-[#565959]">M.R.P.: <span className="line-through">₹{Number(product.mrp || Math.round(product.price / (1 - product.discount_percent / 100))).toLocaleString('en-IN')}</span></p>
              <p className="text-[#0F1111] font-medium mt-1">Inclusive of all taxes</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-[16px] font-bold text-[#0F1111] mb-3">About this item</h3>
            {product.features?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-[14px] text-[#0F1111] leading-relaxed">
                {product.features.map((f, i) => <li key={i}>{f.feature}</li>)}
              </ul>
            ) : product.description ? (
              <div
                className="text-[14px] text-[#0F1111] leading-relaxed product-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : null}
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className="lg:col-span-3">
          <div className="border border-gray-300 rounded-lg p-4 space-y-4 sticky top-20 shadow-sm bg-white">
            <div className="flex items-start">
              <span className="text-sm pt-0.5">₹</span>
              <span className="text-2xl font-medium">{Number(product.price).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[#007185] text-sm hover:underline cursor-pointer">FREE delivery <span className="font-bold">Wednesday, October 25</span></p>
            <div className="text-[#007600] text-lg font-medium">In Stock</div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="bg-[#F0F2F2] border border-[#D5D9D9] rounded-lg py-1 px-3 text-sm">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-2.5 text-[14px] font-medium shadow-sm active:scale-95 transition-transform"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="w-full bg-[#FFA41C] hover:bg-[#FA8914] border border-[#FF8F00] rounded-full py-2.5 text-[14px] font-medium shadow-sm active:scale-95 transition-transform"
            >
              Buy Now
            </button>
          </div>
        </div>
      </main>

      {/* ── COMBINED DETAIL SECTION ────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 mt-10">
        <div className="max-w-[1500px] mx-auto">
          {/* Custom Tabs */}
          <div className="flex bg-[#F8F9F9] border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('specs')}
              className={`px-10 py-3 text-sm font-bold transition-all border-r border-gray-200
                ${activeTab === 'specs' ? 'bg-white border-b-2 border-b-[#E47911]' : 'text-[#565959] hover:bg-gray-100'}`}
            >
              Specifications
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-10 py-3 text-sm font-bold transition-all border-r border-gray-200
                ${activeTab === 'reviews' ? 'bg-white border-b-2 border-b-[#E47911]' : 'text-[#565959] hover:bg-gray-100'}`}
            >
              Reviews ({product.reviewCount || 0})
            </button>
            <button 
              onClick={() => setActiveTab('qa')}
              className={`px-10 py-3 text-sm font-bold transition-all
                ${activeTab === 'qa' ? 'bg-white border-b-2 border-b-[#E47911]' : 'text-[#565959] hover:bg-gray-100'}`}
            >
              Q&A
            </button>
          </div>

          <div className="p-8">
            {/* 1. TECHNICAL SPECIFICATIONS */}
            <div className={activeTab === 'specs' ? 'block' : 'hidden'}>
               <h2 className="text-xl font-bold text-[#0F1111] mb-6">Technical Specifications</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-0.5 border-t border-gray-100">
                 {product.specifications?.map((spec, i) => (
                   <div key={i} className="flex border-b border-gray-100 py-3.5 items-center">
                     <span className="w-1/2 text-sm font-bold text-[#0F1111]">{spec.key}</span>
                     <span className="w-1/2 text-sm text-[#0F1111]">{spec.value}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* 2. CUSTOMER REVIEWS */}
            <div className={activeTab === 'reviews' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Left — summary */}
                <div className="md:col-span-4 space-y-4">
                  <h2 className="text-xl font-bold text-[#0F1111]">Customer Reviews</h2>
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <StarRating rating={product.rating} size="w-5 h-5" />
                        <span className="text-lg font-bold">{parseFloat(product.rating).toFixed(1)} out of 5</span>
                      </div>
                      <p className="text-sm text-gray-500">{product.reviewCount?.toLocaleString()} global ratings</p>
                      {/* Rating breakdown */}
                      <div className="space-y-2 mt-2">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                          return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                              <span className="w-10 text-[#007185]">{star} star</span>
                              <div className="flex-grow h-4 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                <div className="h-full bg-[#E47911]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-8 text-right text-[#007185]">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No ratings yet</p>
                  )}
                </div>

                {/* Right — review list + write form */}
                <div className="md:col-span-8 space-y-6">
                  {/* Write a review */}
                  {user && canReview?.canReview && !reviewSuccess && (
                    <div className="border border-[#e77600] rounded-lg p-5 bg-orange-50">
                      <h3 className="text-[15px] font-bold text-[#0F1111] mb-3">Write a customer review</h3>
                      {reviewError && <p className="text-xs text-[#CC0C39] mb-2">{reviewError}</p>}
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        {/* Star selector */}
                        <div>
                          <label className="block text-xs font-bold text-[#0F1111] mb-1">Overall rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                className={`text-2xl transition-colors ${s <= reviewForm.rating ? 'text-[#FFA41C]' : 'text-gray-300'}`}
                              >★</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0F1111] mb-1">Review title</label>
                          <input
                            type="text"
                            value={reviewForm.title}
                            onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="What's most important to know?"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0F1111] mb-1">Written review <span className="text-[#CC0C39]">*</span></label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            rows={4}
                            placeholder="What did you like or dislike? What did you use this product for?"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded px-5 py-1.5 text-sm font-medium disabled:opacity-60"
                        >
                          {reviewSubmitting ? 'Submitting…' : 'Submit review'}
                        </button>
                      </form>
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="border border-green-300 bg-green-50 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
                      Thank you — your review has been submitted!
                    </div>
                  )}

                  {canReview?.alreadyReviewed && !reviewSuccess && (
                    <p className="text-sm text-[#565959] italic">You have already reviewed this product.</p>
                  )}

                  {/* Review list */}
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-[16px] font-bold text-[#0F1111] mb-1">No reviews yet</p>
                      <p className="text-sm text-[#565959]">
                        {user
                          ? canReview?.canReview
                            ? 'Be the first to review this product!'
                            : 'Purchase and receive delivery to leave a review.'
                          : 'Sign in after receiving delivery to leave a review.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-[15px] font-bold text-[#0F1111]">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </h3>
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-[#232F3E] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {review.user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-[13px] font-medium text-[#0F1111]">{review.user?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} />
                            {review.title && <span className="text-[13px] font-bold text-[#0F1111]">{review.title}</span>}
                          </div>
                          <p className="text-[12px] text-[#565959] mt-0.5">
                            Reviewed on {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[14px] text-[#0F1111] leading-relaxed mt-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CUSTOMER QUESTIONS & ANSWERS */}
            <div className={activeTab === 'qa' ? 'block' : 'hidden'}>
               <h2 className="text-xl font-bold text-[#0F1111] mb-6">Customer questions & answers</h2>
               <div className="space-y-3">
                 <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-center">
                     <span className="text-[15px] font-bold text-[#0F1111]">Does this model support 3 external displays?</span>
                     <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                   </div>
                   <p className="mt-3 text-[14px] text-gray-700 leading-relaxed border-t border-gray-100 pt-3">Yes, the M3 Max chip supports up to 4 external displays simultaneously.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;