import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const HERO_IMAGES = [
  { src: '/images/hero/hero1.jpg', alt: 'Shop the latest deals' },
  { src: '/images/hero/hero2.jpg', alt: 'Fashion sale' },
  { src: '/images/hero/hero3.jpg', alt: 'Electronics' },
  { src: '/images/hero/hero4.jpg', alt: 'Home & Kitchen' },
];

/* ─── tiny helpers ─────────────────────────────────────────── */
const StarRating = ({ rating = 0, count = 0 }) => (
  <div className="flex items-center gap-1 mt-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-[#FFA41C]' : 'text-gray-300'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-[12px] text-[#007185] font-medium ml-1">({count?.toLocaleString()})</span>
  </div>
);

const SliderArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute top-[40%] -translate-y-1/2 z-30 bg-white/90 hover:bg-white border border-gray-300 shadow-md
      ${direction === 'left' ? 'left-0 rounded-r-md' : 'right-0 rounded-l-md'}
      p-4 transition-all opacity-0 group-hover:opacity-100`}
  >
    {direction === 'left' ? (
      <svg className="w-8 h-8 text-[#0F1111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
    ) : (
      <svg className="w-8 h-8 text-[#0F1111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
    )}
  </button>
);

const CategoryCard = ({ title, linkText = 'See more', link = '/products', children }) => (
  <div className="bg-white p-5 flex flex-col h-full shadow-sm">
    <h3 className="text-[21px] font-bold text-[#0F1111] mb-2 leading-tight tracking-tight">{title}</h3>
    <div className="flex-grow">{children}</div>
    <Link to={link} className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline mt-4 block">
      {linkText}
    </Link>
  </div>
);

const QuadGrid = ({ items }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
    {items.map(({ label, image, link }, i) => (
      <Link key={i} to={link || '/products'} className="cursor-pointer group block">
        <div className="h-[120px] overflow-hidden mb-1">
          <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        </div>
        <p className="text-[12px] text-[#0F1111] leading-tight font-medium group-hover:text-[#C7511F]">{label}</p>
      </Link>
    ))}
  </div>
);

export default function Home() {
  const { user } = useAuth();
  const [bestSellers, setBestSellers] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const bestRef = useRef(null);
  const dealsRef = useRef(null);
  const autoplayRef = useRef(null);

  const startAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products?limit=50');
        const allProducts = res.data.data.rows || [];
        setBestSellers(allProducts.filter(p => p.is_best_seller));
        setTopDeals(allProducts.filter(p => p.is_top_deal));
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
    startAutoplay();
    return () => clearInterval(autoplayRef.current);
  }, [startAutoplay]);

  const scroll = (ref, dir) => ref.current?.scrollBy({ left: dir === 'left' ? -800 : 800, behavior: 'smooth' });

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#EAEDED]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9900]" /></div>;

  return (
    <div className="bg-[#EAEDED] min-h-screen">
      {/* HERO SLIDER */}
      <div className="relative w-full h-[600px] overflow-hidden group/hero">
        {HERO_IMAGES.map(({ src, alt }, i) => (
          <img key={src} src={src} alt={alt} className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#EAEDED] via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="max-w-[1500px] mx-auto px-4 -mt-64 relative z-20 space-y-5 pb-10">
        
        {/* ROW 1: 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CategoryCard title="Gaming accessories" link="/products?categoryId=1">
            <QuadGrid items={[
              { label: 'Headsets', image: '/images/categories/headset.png', link: '/products?categoryId=1&search=headset' },
              { label: 'Keyboards', image: '/images/categories/keyboard.png', link: '/products?categoryId=1&search=keyboard' },
              { label: 'Mice', image: '/images/categories/mouse.png', link: '/products?categoryId=1&search=mouse' },
              { label: 'Chairs', image: '/images/categories/chair.png', link: '/products?categoryId=1&search=chair' },
            ]} />
          </CategoryCard>

          <CategoryCard title="Shop deals in Fashion" link="/products?categoryId=2">
            <QuadGrid items={[
              { label: 'Jeans under ₹600', image: '/images/categories/jeans.png', link: '/products?categoryId=2&maxPrice=600' },
              { label: 'Tops under ₹500', image: '/images/categories/tops.png', link: '/products?categoryId=2&maxPrice=500' },
              { label: 'Dresses under ₹800', image: '/images/categories/dress.png', link: '/products?categoryId=2&maxPrice=800' },
              { label: 'Footwear under ₹700', image: '/images/categories/footwear.png', link: '/products?categoryId=2&maxPrice=700' },
            ]} />
          </CategoryCard>

          <CategoryCard title="Deals on Gadgets" link="/products?categoryId=1&is_top_deal=true">
            <div className="h-64 overflow-hidden">
              <img src="/images/categories/smarthome.jpg" className="w-full h-full object-cover" alt="Gadgets" />
            </div>
          </CategoryCard>

          <div className="flex flex-col gap-5">
            {!user ? (
              <div className="bg-white p-5 shadow-sm">
                <h3 className="text-[21px] font-bold text-[#0F1111] mb-3 leading-tight">Sign in for your best experience</h3>
                <Link to="/login"><button className="amazon-button w-full py-1.5 text-sm font-normal shadow-sm">Sign in securely</button></Link>
              </div>
            ) : (
              <div className="bg-white p-5 shadow-sm">
                <h3 className="text-[21px] font-bold text-[#0F1111] mb-1 leading-tight">
                  Welcome back, {user.name?.split(' ')[0]}!
                </h3>
                <p className="text-[13px] text-[#565959] mb-3">Pick up where you left off</p>
                <Link to="/orders">
                  <button className="amazon-button w-full py-1.5 text-sm font-normal shadow-sm">View your orders</button>
                </Link>
              </div>
            )}
            <div className="bg-white shadow-sm flex-grow relative overflow-hidden flex items-center justify-center">
               <img src="/images/categories/laptop-ad.jpg" className="w-full h-full object-cover" alt="Ad" />
            </div>
          </div>
        </div>

        {/* BEST SELLERS SLIDER */}
        <div className="bg-white p-5 shadow-sm relative group">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[21px] font-bold text-[#0F1111]">Best Sellers in Electronics</h2>
            <Link to="/products?categoryId=1&is_best_seller=true" className="text-sm text-[#007185] hover:underline">See more</Link>
          </div>

          <SliderArrow direction="left" onClick={() => scroll(bestRef, 'left')} />
          <div ref={bestRef} className="flex overflow-x-auto gap-6 pb-4 scroll-smooth no-scrollbar">
            {bestSellers.map((p, i) => (
              <Link key={p.id} to={`/products/${p.id}`} className="min-w-[180px] w-[180px] flex flex-col group/card bg-white">
                <div className="h-[180px] bg-white flex items-center justify-center overflow-hidden mb-2">
                  <img 
                    src={p.imageUrl} 
                    onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                    alt={p.name} 
                    className="w-full h-full object-contain group-hover/card:scale-105 transition-transform" 
                  />
                </div>
                {i === 0 && <span className="text-[12px] font-bold text-[#C7511F] mb-1">#1 Best Seller</span>}
                <p className="text-[13px] text-[#007185] group-hover/card:text-[#C7511F] line-clamp-2 leading-snug mb-1">{p.name}</p>
                <StarRating rating={p.rating} count={p.reviewCount} />
                <div className="flex items-baseline font-bold text-[#0F1111] mt-1">
                  <span className="text-xs align-top pt-0.5 mr-0.5">₹</span>
                  <span className="text-lg">{Number(p.price).toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
          <SliderArrow direction="right" onClick={() => scroll(bestRef, 'right')} />
        </div>

        {/* TOP DEALS SLIDER */}
        <div className="bg-white p-5 shadow-sm relative group">
          <h2 className="text-[21px] font-bold text-[#0F1111] mb-4">Top Deals</h2>
          <SliderArrow direction="left" onClick={() => scroll(dealsRef, 'left')} />
          <div ref={dealsRef} className="flex overflow-x-auto gap-6 pb-4 scroll-smooth no-scrollbar">
            {topDeals.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="min-w-[200px] w-[200px] flex flex-col group/card bg-white">
                <div className="h-[200px] bg-white flex items-center justify-center overflow-hidden mb-3">
                  <img 
                    src={p.imageUrl} 
                    onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                    alt={p.name} 
                    className="w-full h-full object-contain group-hover/card:scale-105 transition-transform" 
                  />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#CC0C39] text-white text-[12px] font-bold px-2 py-0.5 rounded-sm">Up to {p.discount_percent}% off</span>
                  <span className="text-[#CC0C39] text-[12px] font-bold">Top Deal</span>
                </div>
                <p className="text-[14px] font-bold text-[#0F1111]">₹{Number(p.price).toLocaleString('en-IN')}</p>
                <p className="text-[13px] text-[#565959] line-clamp-1">{p.name}</p>
              </Link>
            ))}
          </div>
          <SliderArrow direction="right" onClick={() => scroll(dealsRef, 'right')} />
        </div>

        {/* ROW 2: Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: 'Home décor under ₹4,000', link: '/products?categoryId=3&maxPrice=4000', img: 'homedecor' },
            { title: 'Kitchen favorites', link: '/products?categoryId=3', img: 'kitchen' },
            { title: 'Pet supplies', link: '/products?categoryId=1', img: 'pets' },
            { title: 'Gifts for the family', link: '/products?categoryId=1', img: 'gifts' }
          ].map((item, i) => (
            <CategoryCard key={i} title={item.title} link={item.link}>
              <div className="h-64 overflow-hidden">
                <img src={`/images/categories/${item.img}.jpg`} className="w-full h-full object-cover hover:scale-105 transition-transform" alt={item.title} />
              </div>
            </CategoryCard>
          ))}
        </div>
      </div>
    </div>
  );
}
