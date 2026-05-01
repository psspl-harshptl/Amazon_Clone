import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin"></div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error || 'Order not found.'}</p>
        <Link to="/" className="bg-[#FFD814] px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-[#F7CA00]">Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f0f2f2] min-h-screen font-sans pb-20">
      {/* Success Banner */}
      <div className="max-w-4xl mx-auto pt-8 px-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center mb-6">
          <div className="w-16 h-16 bg-[#00A037] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your order has been confirmed and will be processed for shipment shortly. A confirmation email has been sent to your registered address.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Summary Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <span className="text-xs text-gray-500">Order ID: #{order.id}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px] border-b border-gray-100 pb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                    <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                    <p className="text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p className="text-gray-600">{order.shippingAddress.country}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</h3>
                    <div className="flex items-center gap-2">
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                       <p className="font-medium text-gray-900 uppercase">{order.paymentMethod}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Delivery</h3>
                    <div className="flex items-center gap-2 text-green-700 font-bold">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <p>Wednesday, 07 May 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">Order Total</h3>
                    <p className="text-sm text-gray-500">Including taxes & delivery charges</p>
                 </div>
                 <p className="text-3xl font-bold text-gray-900">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Ordered Items</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                    <img src={item.product?.imageUrl} alt={item.product?.name} className="w-24 h-24 object-contain rounded border border-gray-100 p-2" />
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-[#0F1111] line-clamp-2 hover:text-[#C45500] cursor-pointer">{item.product?.name}</h4>
                      <p className="text-[13px] text-gray-600 mt-1">Qty: <span className="font-bold">{item.quantity}</span></p>
                      <p className="text-[15px] font-bold text-[#B12704] mt-2">₹{parseFloat(item.priceAtPurchase).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Status & Actions */}
          <div className="space-y-6">
            
            {/* Delivery Status Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Delivery Status</h3>
              <div>
                {/* Status Timeline */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 bg-[#00A037] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="w-0.5 h-10 bg-[#00A037]"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Ordered</p>
                    <p className="text-xs text-gray-500">Today, 2:15 PM</p>
                  </div>
                </div>

                <div className="flex gap-4 opacity-40">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    <div className="w-0.5 h-10 bg-gray-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Shipped</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>

                <div className="flex gap-4 opacity-40">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    <div className="w-0.5 h-10 bg-gray-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Out for Delivery</p>
                  </div>
                </div>

                <div className="flex gap-4 opacity-40 pb-2">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Delivered</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-tight font-bold mb-1">Arriving by</p>
                <p className="text-lg font-bold text-gray-900">May 07, 2026</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-[#FFD814] hover:bg-[#F7CA00] py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm">
                Track Your Order
              </button>
              <Link to="/" className="block w-full text-center bg-white border border-gray-300 py-2.5 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm">
                Continue Shopping
              </Link>
              <button className="w-full flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-[#007185] pt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Invoice
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;