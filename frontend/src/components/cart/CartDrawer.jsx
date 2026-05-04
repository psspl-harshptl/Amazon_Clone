import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, cartCount, cartSubtotal, isDrawerOpen, toggleDrawer, updateQuantity } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300"
          onClick={() => toggleDrawer(false)}
        />
      )}

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-[350px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Section */}
        <div className="p-5 border-b border-gray-100 bg-[#F8F9F9]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[18px] font-bold text-[#0F1111]">Subtotal</h2>
            <button onClick={() => toggleDrawer(false)} className="text-gray-400 hover:text-gray-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-[22px] font-bold text-[#B12704] mb-4">₹{cartSubtotal.toLocaleString('en-IN')}</p>
          
          <div className="space-y-3">
             <div className="text-[13px] text-[#067D62] font-medium flex gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                <span>Your order is eligible for FREE Delivery. <span className="text-[#007185] cursor-pointer hover:underline">Details</span></span>
             </div>
             
             <button 
                onClick={() => { navigate('/checkout'); toggleDrawer(false); }}
                className="w-full py-2 bg-[#FFD814] border border-[#FCD200] rounded-full text-[13px] font-medium shadow-sm hover:bg-[#F7CA00] transition-colors mb-2"
             >
                Proceed to Buy ({cartCount} {cartCount === 1 ? 'item' : 'items'})
             </button>

             <button 
                onClick={() => { navigate('/cart'); toggleDrawer(false); }}
                className="w-full py-2 bg-white border border-gray-300 rounded-full text-[13px] font-medium shadow-sm hover:bg-gray-50 transition-colors"
             >
                Go to Cart
             </button>
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-y-auto h-[calc(100vh-220px)] p-4 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
               <p className="text-lg mb-2">Your cart is empty</p>
               <button onClick={() => toggleDrawer(false)} className="text-[#007185] hover:underline">Start shopping</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col border-b border-gray-100 pb-6 last:border-0">
                <div className="flex gap-4 mb-4">
                  <div className="w-[80px] h-[80px] flex-shrink-0 border border-gray-100 rounded bg-white flex items-center justify-center overflow-hidden p-1">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = '/images/products/placeholder.png'; }} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[14px] font-medium text-[#0F1111] line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-[16px] font-bold text-[#0F1111]">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    <p className="text-[12px] text-[#B12704] mt-1 font-medium">Only 2 left in stock.</p>
                  </div>
                </div>

                {/* Yellow-Border Quantity Selector */}
                <div className="flex justify-start">
                  <div className="flex items-center bg-white border-2 border-[#FFD814] rounded-full px-1 py-0.5 shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 hover:text-[#E47911] transition-colors"
                    >
                      {item.quantity === 1 ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                      )}
                    </button>
                    <span className="px-5 text-[15px] font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 hover:text-[#E47911] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
