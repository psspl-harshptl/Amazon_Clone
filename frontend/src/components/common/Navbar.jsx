import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

/* ── REFINED Cart icon ── */
const CartIcon = ({ count }) => (
  <div className="relative flex items-center cursor-pointer group px-2 py-1 border border-transparent hover:border-white transition-all h-[50px]">
    <div className="relative flex items-end">
      {/* Sprite Cart Icon */}
      <div 
        className="w-[38px] h-[26px]"
        style={{
          backgroundImage: 'url("/nav-sprite.png")',
          backgroundPosition: '-10px -340px',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '350px 450px',
        }}
      />
      <span className="absolute top-[-2px] left-[17px] text-[#f08804] text-[16px] font-bold leading-none z-10">
        {count}
      </span>
      <span className="text-[14px] font-bold self-end pb-1 ml-0.5">Cart</span>
    </div>
  </div>
);

const NAV_ITEMS = [
  { label: 'Fresh' }, { label: 'MX Player' }, { label: 'Bestsellers' }, { label: 'Mobiles' },
  { label: "Today's Deals" }, { label: 'Customer Service' }, { label: 'New Releases' }, { label: 'Prime' },
  { label: 'Amazon Pay' }, { label: 'Electronics' }, { label: 'Fashion' }, { label: 'Home & Kitchen' },
  { label: 'Computers' }, { label: 'Books' }, { label: 'Toys & Games' }, { label: 'Gift Cards' },
  { label: 'Beauty & Personal Care' }, { label: 'Car & Motorbike' },
];

export default function Navbar() {
  const { cartCount, toggleDrawer } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Fetch categories for the search dropdown
  useEffect(() => {
    api.get('/products/categories')
      .then(res => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  // Sync search input with URL when on /products page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.pathname]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  // Helper for initials
  const getInitials = (userData) => {
    if (userData?.name) {
      return userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return userData?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-[60]">
      {/* ══ TOP BAR ══ */}
      <nav className="bg-[#131921] text-white flex items-center h-[60px] px-2 gap-1 relative">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="border border-transparent hover:border-white px-1.5 py-1 flex items-center h-[50px]">
            {/* Sprite Logo */}
            <div 
              className="w-[97px] h-[30px]"
              style={{
                backgroundImage: 'url("/nav-sprite.png")',
                backgroundPosition: '-10px -51px',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '350px 450px',
              }}
            />
            <span className="text-[#ccc] text-[11px] font-normal -mt-[4px]">.in</span>
          </div>
        </Link>

        {/* Deliver to */}
        {user ? (
          <Link
            to="/profile"
            className="border border-transparent hover:border-white hidden lg:flex flex-col px-2 py-1 cursor-pointer leading-tight"
          >
            <span className="text-[11px] text-[#ccc]">Delivering to</span>
            <span className="text-[13px] font-bold flex items-center gap-0.5">
              <div
                className="w-[15px] h-[18px]"
                style={{
                  backgroundImage: 'url("/nav-sprite.png")',
                  backgroundPosition: '-71px -378px',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '350px 450px',
                }}
              />
              {user.city || 'Update location'}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="border border-transparent hover:border-white hidden lg:flex flex-col px-2 py-1 cursor-pointer leading-tight"
          >
            <span className="text-[11px] text-[#ccc]">Delivering to</span>
            <span className="text-[13px] font-bold flex items-center gap-0.5">
              <div
                className="w-[15px] h-[18px]"
                style={{
                  backgroundImage: 'url("/nav-sprite.png")',
                  backgroundPosition: '-71px -378px',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '350px 450px',
                }}
              />
              Update location
            </span>
          </Link>
        )}

        {/* Search Bar */}
        <div className="flex-grow min-w-0 mx-1">
          <div className="flex h-[40px] rounded overflow-hidden focus-within:ring-2 ring-[#FF9900]">
            <div className="relative flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#e3e6e6] text-[#0F1111] text-[12px] pl-2 pr-6 h-full border-r border-[#cdcdcd] outline-none cursor-pointer"
              >
                <option value="all">All</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <svg className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search AmazonClone.in"
              className="flex-grow px-3 text-[#0F1111] text-[14px] outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-[#FF9900] hover:bg-[#e68a00] w-[46px] flex items-center justify-center transition-colors"
            >
              <div
                className="w-[21px] h-[21px]"
                style={{
                  backgroundImage: 'url("/nav-sprite.png")',
                  backgroundPosition: '-10px -290px',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '350px 450px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Account, Orders & Cart */}
        <div className="flex items-center gap-1">
          
          {/* ── USER PROFILE / SIGN IN ── */}
          <div className="relative">
            {user ? (
              <div 
                className="border border-transparent hover:border-white flex items-center gap-2 px-2 py-1 cursor-pointer leading-tight"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-8 h-8 bg-[#FF9900] rounded-full flex items-center justify-center text-[13px] font-bold text-[#131921]">
                   {getInitials(user)}
                </div>
                <div className="hidden xl:flex flex-col">
                  <span className="text-[11px] text-[#ccc]">Hello, {user.name?.split(' ')[0] || 'User'}</span>
                  <span className="text-[13px] font-bold flex items-center gap-0.5">
                    Account & Lists
                    <svg className={`w-2.5 h-2.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
            ) : (
              <Link to="/login" className="border border-transparent hover:border-white flex flex-col px-2 py-1 leading-tight">
                <span className="text-[11px] text-[#ccc]">Hello, sign in</span>
                <span className="text-[13px] font-bold">Account & Lists</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {showDropdown && user && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-[50px] right-0 w-[200px] bg-white text-[#0F1111] shadow-xl rounded border border-gray-200 z-[61] py-2 flex flex-col">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                     <p className="text-[14px] font-bold line-clamp-1">{user.name}</p>
                     <p className="text-[11px] text-gray-500 line-clamp-1">{user.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setShowDropdown(false)} className="px-4 py-1.5 text-[13px] hover:bg-gray-100 hover:text-[#C7511F]">My Orders</Link>
                  <Link to="/profile" onClick={() => setShowDropdown(false)} className="px-4 py-1.5 text-[13px] hover:bg-gray-100 hover:text-[#C7511F]">Profile Settings</Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button 
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-1.5 text-[13px] hover:bg-gray-100 font-medium text-[#CC0C39]"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link to="/orders" className="border border-transparent hover:border-white hidden sm:flex flex-col px-2 py-1 leading-tight">
            <span className="text-[11px] text-[#ccc]">Returns</span>
            <span className="text-[13px] font-bold">& Orders</span>
          </Link>

          <div onClick={() => toggleDrawer(true)}>
             <CartIcon count={cartCount} />
          </div>
        </div>
      </nav>

      {/* ══ SECONDARY NAV ══ */}
      <div className="bg-[#232F3E] text-white flex items-center h-[38px] px-2 overflow-x-auto whitespace-nowrap text-[13px] no-scrollbar">
        <Link to="/products" className="border border-transparent hover:border-white flex items-center gap-1 px-2 py-1 cursor-pointer font-bold flex-shrink-0">
          {/* <div
            className="w-[17px] h-[14px]"
            style={{
              backgroundImage: 'url("/nav-sprite.png")',
              backgroundPosition: '-172px -255px',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '350px 450px',
            }}
          /> */}
          <span>All Product</span>
        </Link>
        {categories.length > 0
          ? categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="border border-transparent hover:border-white px-2 py-1 cursor-pointer flex-shrink-0 font-normal"
              >
                {cat.name}
              </Link>
            ))
          : NAV_ITEMS.map(({ label }) => (
              <Link
                key={label}
                to={`/products?search=${encodeURIComponent(label)}`}
                className="border border-transparent hover:border-white px-2 py-1 cursor-pointer flex-shrink-0 font-normal"
              >
                {label}
              </Link>
            ))
        }
        <Link to="/seller/register" className="border border-transparent hover:border-white px-2 py-1 cursor-pointer flex-shrink-0 font-bold text-[#FF9900] ml-auto">
          Sell on Amazon
        </Link>
      </div>
    </header>
  );
}
