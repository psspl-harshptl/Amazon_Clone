import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CheckoutHeader = () => {
  const { cartCount } = useCart();

  return (
    <header className="bg-[#131921] py-2 px-4 sticky top-0 z-50">
      <div className="max-w-[1150px] mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center">
          <div 
            className="w-[97px] h-[30px]"
            style={{
              backgroundImage: 'url("/nav-sprite.png")',
              backgroundPosition: '-10px -51px',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '350px 450px',
            }}
          />
          <span className="text-white text-xs mt-3 ml-0.5">.in</span>
        </Link>

        {/* Center: Secure Checkout */}
        <div className="flex items-center gap-1 group cursor-pointer">
          <h1 className="text-white text-xl md:text-2xl font-normal">
            Secure checkout
          </h1>
          <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Right: Cart Icon */}
        <Link to="/cart" className="relative flex items-center gap-1 text-white hover:text-orange-400 transition-colors">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
           </svg>
           <span className="text-sm font-bold mt-2">Cart</span>
        </Link>
      </div>
    </header>
  );
};

export default CheckoutHeader;
