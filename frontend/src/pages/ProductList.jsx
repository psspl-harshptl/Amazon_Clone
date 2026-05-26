import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-[#FFA41C]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-[13px] text-[#007185] ml-1">{rating}</span>
  </div>
);

const SidebarSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold text-[#0F1111] mb-2">{title}</h3>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const FilterPill = ({ label, onRemove }) => (
  <div className="flex items-center gap-1 bg-white border border-gray-300 px-3 py-1 rounded-full text-[13px] text-[#0F1111] shadow-sm hover:bg-gray-50 group">
    <span>{label}</span>
    <button onClick={onRemove} className="ml-1 text-gray-400 group-hover:text-red-600 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ brands: [], priceRange: { min: 0, max: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, filtRes] = await Promise.all([
          api.get(`/products?${searchParams.toString()}`),
          api.get(`/products/filters?categoryId=${searchParams.get('categoryId') || ''}`)
        ]);
        setProducts(prodRes.data.data.rows || []);
        setFilters(filtRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [searchParams]);

  const handleFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'brand') {
      const currentBrands = newParams.getAll('brand');
      if (currentBrands.includes(value)) {
        const filtered = currentBrands.filter(b => b !== value);
        newParams.delete('brand');
        filtered.forEach(b => newParams.append('brand', b));
      } else {
        newParams.append('brand', value);
      }
    } else {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const removeSingleFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'brand') {
      const currentBrands = newParams.getAll('brand').filter(b => b !== value);
      newParams.delete('brand');
      currentBrands.forEach(b => newParams.append('brand', b));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const cat = searchParams.get('categoryId');
    setSearchParams(cat ? { categoryId: cat } : {});
  };

  const getActiveFilters = () => {
    const active = [];
    searchParams.forEach((value, key) => {
      if (key === 'brand') active.push({ key, value, label: value });
      if (key === 'rating') active.push({ key, value, label: `${value} & Up` });
      if (key === 'minPrice') active.push({ key, value, label: `From ₹${value}` });
      if (key === 'maxPrice') active.push({ key, value, label: `Up to ₹${value}` });
      if (key === 'sort' && (value === 'newest' || value === 'oldest'))
        active.push({ key, value, label: value === 'newest' ? 'Newest Arrivals' : 'Oldest First' });
    });
    return active;
  };

  return (
    <div className="bg-white min-h-screen pt-4 pb-10 relative">
      <div className="max-w-[1500px] mx-auto px-4 flex gap-6">

        {/* STICKY SIDEBAR FILTERS */}
        <aside className="w-[240px] flex-shrink-0 hidden md:block">
          <div className="sticky top-[80px] border-r border-gray-100 pr-4 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            <div className="mb-4">
              <button onClick={clearFilters} className="text-xs text-[#007185] hover:underline">Clear all filters</button>
            </div>

            <SidebarSection title="Category">
              <Link to="/" className="text-sm text-[#007185] hover:text-[#C7511F] block mb-1">‹ All Categories</Link>
              <span className="text-sm font-bold text-[#0F1111] pl-3">Current Store</span>
            </SidebarSection>

            <SidebarSection title="Customer Reviews">
              {[4, 3, 2, 1].map(r => (
                <div key={r} onClick={() => handleFilter('rating', r)}
                  className={`flex items-center gap-1 cursor-pointer group text-sm p-1 rounded-md transition-colors
                    ${searchParams.get('rating') == r ? 'bg-orange-50 font-bold border border-orange-200' : 'hover:bg-gray-50'}`}>
                  <StarRating rating={r} />
                  <span className="group-hover:text-[#C7511F]">& Up</span>
                </div>
              ))}
            </SidebarSection>

            {filters.brands.length > 0 && (
              <SidebarSection title="Brands">
                {filters.brands.map(b => (
                  <label key={b} className={`flex items-center gap-2 text-sm cursor-pointer p-1 rounded-md transition-colors
                    ${searchParams.getAll('brand').includes(b) ? 'bg-orange-50 font-bold' : 'hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={searchParams.getAll('brand').includes(b)}
                      onChange={() => handleFilter('brand', b)}
                      className="w-4 h-4 rounded-sm border-gray-400 accent-[#FF9900]"
                    /> {b}
                  </label>
                ))}
              </SidebarSection>
            )}

            <SidebarSection title="Price">
              {[
                { label: 'Up to ₹500', max: 500 },
                { label: '₹500 - ₹1,000', min: 500, max: 1000 },
                { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
                { label: 'Over ₹5,000', min: 5000 }
              ].map((p, i) => (
                <div key={i} onClick={() => {
                  if (p.min) handleFilter('minPrice', p.min);
                  if (p.max) handleFilter('maxPrice', p.max);
                }}
                  className={`text-sm cursor-pointer py-1 px-1 rounded-md transition-colors
                  ${(searchParams.get('minPrice') == p.min && searchParams.get('maxPrice') == p.max) ? 'bg-orange-50 font-bold text-[#C7511F]' : 'hover:text-[#C7511F]'}`}>
                  {p.label}
                </div>
              ))}
            </SidebarSection>

            <SidebarSection title="Date Listed">
              {[
                { label: 'Newest Arrivals', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
              ].map((s) => (
                <div key={s.value} onClick={() => handleFilter('sort', s.value)}
                  className={`text-sm cursor-pointer py-1 px-1 rounded-md transition-colors
                  ${searchParams.get('sort') === s.value ? 'bg-orange-50 font-bold text-[#C7511F]' : 'hover:text-[#C7511F]'}`}>
                  {s.label}
                </div>
              ))}
            </SidebarSection>
          </div>
        </aside>

        {/* RESULTS LIST */}
        <main className="flex-grow">

          {/* ACTIVE FILTER PILLS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getActiveFilters().map((filt, i) => (
              <FilterPill
                key={i}
                label={filt.label}
                onRemove={() => removeSingleFilter(filt.key, filt.value)}
              />
            ))}
            {getActiveFilters().length > 0 && (
              <button onClick={clearFilters} className="text-xs text-[#007185] hover:underline ml-2">Clear all</button>
            )}
          </div>

          <div className="mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-[#0F1111]">Results</h1>
              <p className="text-[13px] text-[#565959]">Price and other details may vary based on product size and colour.</p>
            </div>
            <select className="text-xs bg-gray-100 border border-gray-300 p-1.5 rounded-lg outline-none cursor-pointer" onChange={(e) => handleFilter('sort', e.target.value)}>
              <option value="">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF9900]" /></div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-xl font-bold">No results found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="flex gap-6 border border-gray-100 rounded-lg overflow-hidden group hover:shadow-md transition-shadow p-2">
                  <Link to={`/products/${p.id}`} className="w-[220px] h-[220px] flex-shrink-0 overflow-hidden bg-white flex items-center justify-center p-3">
                    <img
                      src={p.imageUrl}
                      onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-grow pt-2 pr-4">
                    {p.is_best_seller && <span className="bg-[#E47911] text-white text-[11px] px-2 py-0.5 rounded-sm font-bold mb-1.5 inline-block">Best seller</span>}
                    <Link to={`/products/${p.id}`} className="text-[18px] font-medium text-[#0F1111] hover:text-[#C7511F] line-clamp-2 leading-snug mb-1">{p.name}</Link>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={p.rating} />
                      <span className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">({p.reviewCount?.toLocaleString()})</span>
                    </div>
                    <p className="text-[13px] text-[#565959] mt-0.5 mb-1">1K+ bought in past month</p>

                    {p.is_top_deal && (
                      <span className="bg-[#CC0C39] text-white text-[12px] font-bold px-2 py-0.5 rounded-sm inline-block mb-1">Limited time deal</span>
                    )}

                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-2xl font-bold">₹{Number(p.price).toLocaleString()}</span>
                      {p.mrp > p.price && (
                        <span className="text-[13px] text-[#565959]">M.R.P: <span className="line-through">₹{Number(p.mrp).toLocaleString()}</span> ({p.discount_percent}% off)</span>
                      )}
                    </div>

                    <p className="text-[13px] text-[#0F1111] mb-3">
                      FREE delivery <span className="font-bold">Sat, 2 May</span> on first order
                    </p>

                    <button 
                      onClick={() => addToCart(p, 1)}
                      className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] px-5 py-1.5 rounded-full shadow-sm transition-all active:scale-95 font-medium"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;