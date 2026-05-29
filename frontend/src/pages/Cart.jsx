import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item, onUpdateQty, onRemove }) => (
  <div className="flex gap-4 py-6 border-b border-gray-200">
    <div className="w-[180px] h-[180px] bg-gray-50 flex-shrink-0 flex items-center justify-center p-4">
      <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
    </div>

    <div className="flex-grow space-y-1">
      <div className="flex justify-between items-start">
        <Link to={`/products/${item.id}`} className="text-[18px] font-medium text-[#0F1111] hover:text-[#007185] hover:underline line-clamp-2 leading-tight">
          {item.name}
        </Link>
        <span className="text-[18px] font-bold text-[#0F1111]">₹{Number(item.price).toLocaleString('en-IN')}</span>
      </div>

      <p className="text-[#007600] text-[12px] font-medium">In Stock</p>
      {item.brand && <p className="text-[12px] text-[#565959]">Brand: {item.brand}</p>}
      {item.variantLabel && (
        <p className="text-[12px] text-[#565959] font-medium">{item.variantLabel}</p>
      )}

      <div className="flex items-center gap-4 mt-4 h-8">
        <div className="flex items-center bg-[#F0F2F2] border border-[#D5D9D9] rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => onUpdateQty(item.itemId, -1)}
            className="px-3 py-1 hover:bg-[#E3E6E6] transition-colors font-bold border-r border-[#D5D9D9]"
          >-</button>
          <span className="px-4 text-[14px] font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.itemId, 1)}
            className="px-3 py-1 hover:bg-[#E3E6E6] transition-colors font-bold border-l border-[#D5D9D9]"
          >+</button>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-[#007185]">
          <span className="h-4 border-l border-gray-300"></span>
          <button onClick={() => onRemove(item.itemId)} className="hover:underline">Delete</button>
          <span className="h-4 border-l border-gray-300"></span>
          <button className="hover:underline">Save for later</button>
          <span className="h-4 border-l border-gray-300"></span>
          <button className="hover:underline">Compare with similar items</button>
        </div>
      </div>
    </div>
  </div>
);

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartCount } = useCart();
  const navigate = useNavigate();
  
  const shipping = cartSubtotal > 500 ? 0 : 40;
  const discount = cartSubtotal > 10000 ? Math.round(cartSubtotal * 0.1) : 0; // 10% discount for big orders
  const total = cartSubtotal + shipping - discount;

  if (cart.length === 0) {
    return (
      <div className="bg-[#EAEDED] min-h-screen py-8">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="bg-white p-8 rounded shadow-sm">
            <h1 className="text-3xl font-medium mb-4">Your Amazon Cart is empty.</h1>
            <p className="mb-6">Your shopping cart lives to serve. Give it purpose — fill it with groceries, electronics, and more.</p>
            <Link to="/" className="bg-[#FFD814] px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-[#F7CA00]">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-8">
      <div className="max-w-[1500px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Cart Section */}
        <div className="lg:col-span-3 bg-white p-6 shadow-sm rounded">
          <div className="flex justify-between items-end border-b border-gray-200 pb-2">
            <h1 className="text-[28px] font-medium">Shopping Cart</h1>
            <span className="text-[14px] text-[#565959] pr-4">Price</span>
          </div>
          
          <div className="divide-y divide-gray-200">
            {cart.map(item => (
              <CartItem
                key={item.itemId}
                item={item}
                onUpdateQty={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
          
          <div className="text-right py-4 text-[18px]">
            Subtotal ({cartCount} items): <span className="font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 shadow-sm rounded space-y-4">
            {shipping === 0 && (
              <div className="flex items-start gap-2 text-[#067D62]">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-[13px] leading-tight">
                   Your order qualifies for <span className="font-bold">FREE Shipping</span>.
                </p>
              </div>
            )}
            
            <div className="space-y-1 border-b border-gray-100 pb-4">
              <div className="flex justify-between text-[14px]">
                <span>Subtotal ({cartCount} items):</span>
                <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span>Estimated Shipping:</span>
                <span className={shipping === 0 ? 'text-[#067D62]' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[14px] text-[#B12704]">
                  <span>Discount (BIG10):</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between text-[18px] font-bold">
              <span>Order Total:</span>
              <span className="text-[#B12704]">₹{total.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[12px] pt-2">
               <input type="checkbox" id="gift" className="w-4 h-4 rounded border-gray-300" />
               <label htmlFor="gift">This order contains a gift</label>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg py-2 text-[13px] font-medium shadow-sm"
            >
              Proceed to Checkout
            </button>
            
            <div className="relative">
              <select className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-[12px] appearance-none cursor-pointer">
                <option>Select Installment Plan</option>
                <option>3 months EMI - ₹{(total/3).toFixed(2)}/mo</option>
                <option>6 months EMI - ₹{(total/6).toFixed(2)}/mo</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1111] text-white p-6 shadow-sm rounded space-y-4">
             <h3 className="text-[18px] font-bold">Get 5% Back</h3>
             <p className="text-[12px] leading-tight">
                Earn unlimited 5% back on AmazonClone.in with the AmazonClone Store Card.
             </p>
             <button className="w-full bg-white text-[#0F1111] py-2 rounded-full text-[13px] font-medium hover:bg-gray-100 transition-colors">
                Learn More
             </button>
          </div>
        </div>
      </div>
      
      {/* Recommendations at bottom */}
      <div className="max-w-[1500px] mx-auto px-4 mt-8 pb-10">
         <h2 className="text-xl font-bold mb-4 bg-white p-4 shadow-sm rounded-t">Your items and recommendations</h2>
         <div className="bg-white p-6 shadow-sm rounded-b grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              {name: 'RuggedX Outdoor Speaker', price: 45.99, img: '/images/products/speaker.png'},
              {name: 'TurboCharge 6ft Braided Cable', price: 12.99, img: '/images/products/braided-cable.png'},
              {name: 'WoolFelt Minimalist Desk Mat', price: 24.00, img: '/images/products/keyboard.jpg'},
              {name: 'Heritage Leather Journal', price: 18.50, img: '/images/products/journal.png'},
            ].map((p, i) => (
              <div key={i} className="space-y-2 group cursor-pointer">
                 <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                    <img src={p.img} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition-transform" />
                 </div>
                 <p className="text-[13px] text-[#007185] group-hover:text-[#C7511F] group-hover:underline line-clamp-2">{p.name}</p>
                 <p className="font-bold text-[#B12704]">₹{Number(p.price * 83).toLocaleString('en-IN')}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Cart;