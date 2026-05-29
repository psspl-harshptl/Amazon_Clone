import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutHeader from '../components/common/CheckoutHeader';
import api from '../api/axios';
import upi from '/upi.png';

const Checkout = () => {
   const { cart, cartSubtotal, clearCart, loading: cartLoading } = useCart();
   const { user } = useAuth();
   const navigate = useNavigate();

   const [paymentMethod, setPaymentMethod] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Totals - Restored from previous version
   const shipping = 40.00;
   const tax = Math.round(cartSubtotal * 0.18);
   const orderTotal = cartSubtotal + shipping + tax;

   const [orderSuccess, setOrderSuccess] = useState(false);

   const [addresses, setAddresses] = useState([]);
   const [selectedAddress, setSelectedAddress] = useState(null);
   const [isChangingAddress, setIsChangingAddress] = useState(false);

   useEffect(() => {
      const getAddresses = async () => {
         try {
            const res = await api.get('/addresses');
            if (res.data.success && res.data.data.length > 0) {
               setAddresses(res.data.data);
               const def = res.data.data.find(a => a.isDefault) || res.data.data[0];
               setSelectedAddress(def);
            } else {
               // Fallback to flat profile address
               const fallback = {
                  fullName: user?.name || 'User',
                  phone: user?.phone || '',
                  streetAddress: user?.address || '',
                  city: user?.city || '',
                  state: user?.state || '',
                  zipCode: user?.zipCode || '',
                  country: user?.country || 'India'
               };
               setSelectedAddress(fallback);
            }
         } catch (err) {
            console.error('Failed to fetch addresses', err);
         }
      };
      if (user) getAddresses();
   }, [user]);

   useEffect(() => {
      // Wait for cart to finish loading before redirecting — prevents race condition
      // on direct navigation where cart context hasn't fetched yet
      if (!cartLoading && cart.length === 0 && !orderSuccess) {
         navigate('/cart');
      }
   }, [cart, cartLoading, navigate, orderSuccess]);

   // Helper to load Razorpay script
   const loadRazorpay = () => {
      return new Promise((resolve) => {
         const script = document.createElement('script');
         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
         script.onload = () => resolve(true);
         script.onerror = () => resolve(false);
         document.body.appendChild(script);
      });
   };

   const handlePlaceOrder = async () => {
      if (!paymentMethod) return;

      // If Online Payment (Card, UPI, Netbanking), trigger Razorpay
      if (['card', 'upi', 'netbanking'].includes(paymentMethod)) {
         const res = await loadRazorpay();
         if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
         }
         const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderTotal * 100, // Amount in paise
            currency: 'INR',
            name: 'Amazon Clone',
            description: 'Order Payment',
            image: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
            handler: async function (response) {
               await finalizeOrder(response.razorpay_payment_id);
            },
            prefill: {
               name: user?.name,
               email: user?.email,
               contact: user?.phone
            },
            theme: {
               color: '#131921'
            }
         };

         const paymentObject = new window.Razorpay(options);
         paymentObject.open();
      } else {
         await finalizeOrder();
      }
   };

   const finalizeOrder = async (paymentId = 'cod_payment') => {
      setLoading(true);
      setError('');
      
      try {
         const orderData = {
            items: cart.map(item => ({
               productId: item.id,
               quantity: item.quantity,
               price: item.price,
               variantId: item.variantId || null,
            })),
            totalAmount: orderTotal,
            shippingAddress: {
               name: selectedAddress?.fullName || user?.name || 'User',
               address: selectedAddress?.streetAddress || user?.address || '',
               city: selectedAddress?.city || user?.city || '',
               state: selectedAddress?.state || user?.state || '',
               zipCode: selectedAddress?.zipCode || user?.zipCode || '',
               country: selectedAddress?.country || user?.country || 'India',
               phone: selectedAddress?.phone || user?.phone || ''
            },
            paymentMethod: paymentMethod,
            paymentId: paymentId
         };

         const res = await api.post('/orders', orderData);

         if (res.data.success) {
            const orderId = res.data.data.id;
            setOrderSuccess(true);
            clearCart();
            navigate(`/orders/${orderId}/success`);
         }
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   // Helper for Payment Icons from Sprite Map
   const CardIcon = ({ position }) => (
      <div
         className="inline-block w-8 h-5 border border-gray-100 rounded-sm"
         style={{
            backgroundImage: 'url("/payment-sprites.jpg")',
            backgroundPosition: position,
            backgroundRepeat: 'no-repeat',
            marginRight: '6px',
            height: '29px',
            width: '45px'
         }}
      />
   );

   return (
      <div className="bg-[#f0f2f2] min-h-screen font-sans pb-20">
         <CheckoutHeader />

         <main className="max-w-[1150px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Side: Steps */}
            <div className="lg:col-span-2 space-y-4">

               {/* Section 1: Delivery Address */}
               <section className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
                  <div className="space-y-4">
                     <div className="flex justify-between items-start">
                        <h2 className="text-[17px] font-bold text-[#0F1111]">1 Delivery Address</h2>
                        {!isChangingAddress && addresses.length > 0 && (
                           <button 
                              onClick={() => setIsChangingAddress(true)} 
                              className="text-[#007185] text-[13px] hover:underline"
                           >
                              Change
                           </button>
                        )}
                     </div>

                     {isChangingAddress ? (
                        <div className="space-y-4 ml-5 text-[13px]">
                           <div className="space-y-3">
                              {addresses.map(addr => (
                                 <div key={addr.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 text-gray-700">
                                    <input 
                                       type="radio" 
                                       name="checkoutAddress" 
                                       id={`addr-${addr.id}`}
                                       checked={selectedAddress?.id === addr.id}
                                       onChange={() => setSelectedAddress(addr)}
                                       className="w-4 h-4 mt-0.5 accent-[#e77600]"
                                    />
                                    <label htmlFor={`addr-${addr.id}`} className="cursor-pointer">
                                       <span className="font-bold">{addr.fullName}</span>, {addr.streetAddress}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country} (Phone: {addr.phone})
                                    </label>
                                 </div>
                              ))}
                           </div>
                           <div className="flex gap-3 pt-2">
                              <button 
                                 onClick={() => setIsChangingAddress(false)}
                                 className="px-4 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] rounded-lg font-medium shadow-sm"
                              >
                                 Use this address
                              </button>
                              <Link 
                                 to="/addresses" 
                                 className="px-4 py-1.5 bg-white border border-[#D5D9D9] hover:bg-gray-50 rounded-lg font-medium shadow-sm text-center"
                              >
                                 Manage Addresses
                              </Link>
                           </div>
                        </div>
                     ) : (
                        <div className="text-[13px] text-gray-700 ml-5">
                           <p className="font-bold">{selectedAddress?.fullName}</p>
                           <p>{selectedAddress?.streetAddress || selectedAddress?.address}</p>
                           <p>{selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.zipCode}</p>
                           <p>{selectedAddress?.country}</p>
                           {addresses.length === 0 && (
                              <div className="mt-2">
                                 <Link to="/addresses" className="text-[#007185] hover:underline font-medium">Add a shipping address</Link>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </section>

               {/* Section 2: Payment Method */}
               <section className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                     <h2 className="text-[17px] font-bold text-[#0F1111]">2 Payment method</h2>
                  </div>

                  <div className="p-5 space-y-6">
                     {/* Available Balance */}
                     <div className="bg-[#fcf5ee] border border-[#fbd8b4] p-4 rounded-lg">
                        <h3 className="text-[13px] font-bold mb-3 uppercase tracking-tight text-gray-600">Your available balance</h3>
                        <div className="flex items-start gap-3">
                           <input type="radio" disabled className="w-4 h-4 mt-0.5" />
                           <div className="text-[13px]">
                              <span className="font-bold text-gray-400">Use your ₹17.00 Amazon Pay Balance</span>
                              <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                                 <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                 Insufficient balance. <span className="text-blue-600 hover:underline cursor-pointer">Add money & get rewarded</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 mt-4 ml-7">
                           <input placeholder="Enter Code" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-44 shadow-inner" />
                           <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm hover:bg-gray-50 font-medium">Apply</button>
                        </div>
                     </div>

                     <div className="space-y-5 px-1">
                        <h3 className="text-[13px] font-bold uppercase tracking-tight text-gray-600">Another payment method</h3>

                        {/* Credit Card */}
                        <div className="flex items-start gap-4">
                           <input
                              type="radio"
                              name="pay"
                              id="card"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                              className="w-4 h-4 mt-1 accent-[#e77600] flex-shrink-0"
                           />
                           <label htmlFor="card" className="text-[13px] cursor-pointer">
                              <p className="font-bold">Credit or debit card</p>
                              <div className="flex gap-2 mt-2">
                                 <CardIcon position="0 0" /> {/* Visa */}
                                 <CardIcon position="-45px 0" /> {/* Mastercard */}
                                 <CardIcon position="-90px 0" /> {/* Maestro */}
                                 <CardIcon position="-135px 0" /> {/* Amex */}
                              </div>
                           </label>
                        </div>

                        {/* Net Banking */}
                        <div className="flex items-start gap-4">
                           <input
                              type="radio"
                              name="pay"
                              id="netbanking"
                              checked={paymentMethod === 'netbanking'}
                              onChange={() => setPaymentMethod('netbanking')}
                              className="w-4 h-4 mt-1 accent-[#e77600] flex-shrink-0"
                           />
                           <div className="text-[13px] w-full">
                              <label htmlFor="netbanking" className="font-bold block mb-2 cursor-pointer">Net Banking</label>
                              <select className="w-full max-w-xs border border-gray-300 rounded px-3 py-1.5 bg-[#f0f2f2] text-sm focus:border-[#e77600] shadow-sm outline-none">
                                 <option>Choose an Option</option>
                                 <option>HDFC Bank</option>
                                 <option>ICICI Bank</option>
                                 <option>SBI Bank</option>
                                 <option>Axis Bank</option>
                              </select>
                           </div>
                        </div>

                        {/* UPI - FIXED ALIGNMENT */}
                        <div className={`rounded transition-all`}>
                           <div className="flex items-start gap-4">
                              <input
                                 type="radio"
                                 name="pay"
                                 id="upi"
                                 checked={paymentMethod === 'upi'}
                                 onChange={() => setPaymentMethod('upi')}
                                 className="w-4 h-4 mt-1 accent-[#e77600] flex-shrink-0"
                              />
                              <div className="text-[13px]">
                                 <label htmlFor="upi" className="font-bold flex items-center gap-1 cursor-pointer">
                                    Scan and Pay with
                                    <span className="italic text-gray-500 text-[11px] font-bold uppercase">
                                       <img src={upi} alt="upi" />
                                    </span>
                                 </label>
                                 {paymentMethod === 'upi' && (
                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-[12px] flex items-start gap-2 shadow-sm">
                                       <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                       <span>You will need to Scan the QR code on the payment page to complete the payment.</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* COD */}
                        <div className="flex items-start gap-4">
                           <input
                              type="radio"
                              name="pay"
                              id="cod"
                              checked={paymentMethod === 'cod'}
                              onChange={() => setPaymentMethod('cod')}
                              className="w-4 h-4 mt-1 accent-[#e77600] flex-shrink-0"
                           />
                           <label htmlFor="cod" className="text-[13px] cursor-pointer">
                              <p className="font-bold">Cash on Delivery/Pay on Delivery</p>
                              <p className="text-gray-500">Cash, UPI and Cards accepted. <span className="text-[#007185] hover:underline cursor-pointer">Know more.</span></p>
                           </label>
                        </div>
                     </div>
                  </div>

                  <div className="p-5 border-t border-gray-200 bg-[#f7f8f8]">
                     <button
                        onClick={handlePlaceOrder}
                        disabled={!paymentMethod || loading}
                        className={`px-6 py-2 rounded-lg border text-[13px] font-medium shadow-sm transition-all ${paymentMethod ? 'bg-[#FFD814] border-[#FCD200] hover:bg-[#F7CA00]' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                     >
                        Use this payment method
                     </button>
                  </div>
               </section>

               {/* Section 3: Review items and shipping */}
               <section className="bg-white border border-gray-300 rounded-lg shadow-sm">
                  <div className="p-5 border-b border-gray-200">
                     <h2 className="text-[17px] font-bold text-[#0F1111]">3 Review items and shipping</h2>
                  </div>
                  <div className="p-5 space-y-6">
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-6">
                           {cart.map(item => (
                              <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
                                 <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-contain" />
                                 <div className="space-y-1">
                                    <h4 className="text-[14px] font-bold text-[#0F1111] line-clamp-2 leading-snug">{item.name}</h4>
                                    <p className="text-[14px] font-bold text-[#B12704] mt-1">₹{item.price.toLocaleString()}</p>
                                    <p className="text-[12px] text-gray-600">Quantity: <span className="font-bold">{item.quantity}</span></p>
                                    <p className="text-[11px] text-[#067D62] font-bold mt-2">FREE Delivery</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="w-full md:w-64 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                           <p className="text-[13px] font-bold mb-2">Delivery date:</p>
                           <p className="text-[13px] text-green-700 font-bold">
                             {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                           </p>
                           <p className="text-[11px] text-gray-500 mt-1">Estimated delivery in 5 days</p>
                        </div>
                     </div>
                  </div>
               </section>

            </div>

            {/* Right Side: Sticky Summary */}
            <div className="lg:col-span-1">
               <div className="sticky top-20 border border-gray-300 rounded-lg p-5 bg-white space-y-4 shadow-sm">
                  <button
                     onClick={handlePlaceOrder}
                     disabled={!paymentMethod || loading}
                     className={`w-full py-2 rounded-xl text-sm font-medium shadow-sm transition-all ${paymentMethod ? 'bg-[#FFD814] border-[#FCD200] hover:bg-[#F7CA00]' : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'}`}
                  >
                     {loading ? 'Processing...' : 'Place your order'}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center leading-tight">
                     By placing your order, you agree to Amazon's <span className="text-[#007185] hover:underline">privacy notice</span> and <span className="text-[#007185] hover:underline">conditions of use</span>.
                  </p>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                     <h3 className="font-bold text-[17px]">Order Summary</h3>
                     <div className="space-y-2 text-[13px] text-gray-700">
                        <div className="flex justify-between">
                           <span>Items:</span>
                           <span>₹{cartSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Delivery:</span>
                           <span>₹{shipping.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                           <span>Total before tax:</span>
                           <span>₹{(cartSubtotal + shipping).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                           <span>Estimated tax (18%):</span>
                           <span>₹{tax.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="flex justify-between pt-4 border-t border-gray-200">
                        <span className="text-lg font-bold text-[#B12704]">Order Total:</span>
                        <span className="text-lg font-bold text-[#B12704]">₹{orderTotal.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

         </main>

         {/* Footer */}
         <footer className="mt-20 border-t border-gray-300 bg-white py-10">
            <div className="flex flex-col items-center gap-6">
               <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-8" alt="Amazon" />
               <div className="flex gap-8 text-[12px] text-[#007185] hover:underline cursor-pointer">
                  <span>Conditions of Use & Sale</span>
                  <span>Privacy Notice</span>
                  <span>Interest-Based Ads</span>
               </div>
               <p className="text-[11px] text-gray-500">© 1996-2026, Amazon.com, Inc. or its affiliates</p>
            </div>
         </footer>
      </div>
   );
};

export default Checkout;