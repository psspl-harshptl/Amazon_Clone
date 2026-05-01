import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getDeliveryDate = (createdAt) => {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_LABELS = { pending: 'Ordered', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered' };

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) setOrder(res.data.data);
      } catch (err) {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAEDED] p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error || 'Order not found.'}</p>
        <Link to="/orders" className="bg-[#FFD814] px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-[#F7CA00]">Back to Orders</Link>
      </div>
    </div>
  );

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const orderNum = `406-${String(order.id).padStart(7, '0')}-${String(order.id * 1234567 % 9999999).padStart(7, '0')}`;

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-4 pt-5">
        <p className="text-[13px] text-[#007185]">
          <Link to="/profile" className="hover:underline hover:text-[#C7511F]">Your Account</Link>
          <span className="mx-1 text-gray-400">›</span>
          <Link to="/orders" className="hover:underline hover:text-[#C7511F]">Your Orders</Link>
          <span className="mx-1 text-gray-400">›</span>
          <span className="text-[#C7511F]">Order Details</span>
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 mt-4">
        <h1 className="text-[24px] font-bold text-[#0F1111] mb-5">Order Details</h1>

        {/* ── Top Info Bar ── */}
        <div className="flex flex-wrap gap-6 justify-between items-start text-[13px] mb-5">
          <div className="flex gap-8">
            <div>
              <p className="text-gray-500 font-bold uppercase text-[11px] tracking-wider">Ordered on</p>
              <p>{fmtDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[11px] tracking-wider">Order #</p>
              <p>{orderNum}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="text-[#007185] hover:text-[#C7511F] hover:underline text-[13px] flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: Items + Status ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Status Progress */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-6">
              <p className={`text-[18px] font-bold mb-1 ${order.status === 'delivered' ? 'text-green-700' : order.status === 'cancelled' ? 'text-red-600' : 'text-[#0F1111]'}`}>
                {order.status === 'delivered' ? `Delivered on ${fmtDate(order.updatedAt || order.createdAt)}` :
                 order.status === 'cancelled' ? 'Order Cancelled' :
                 `Arriving by ${getDeliveryDate(order.createdAt)}`}
              </p>

              {order.status !== 'cancelled' && (
                <div className="mt-5">
                  {/* Progress bar */}
                  <div className="relative flex items-center justify-between">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#067D62] -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                    {STATUS_STEPS.map((step, idx) => (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          idx <= currentStepIdx ? 'bg-[#067D62] border-[#067D62]' : 'bg-white border-gray-300'
                        }`}>
                          {idx <= currentStepIdx && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        <span className={`text-[12px] mt-2 ${idx <= currentStepIdx ? 'font-bold text-[#067D62]' : 'text-gray-400'}`}>
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-6">
              <h2 className="text-[16px] font-bold text-[#0F1111] mb-4">Items Ordered</h2>
              <div className="space-y-5">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <img
                      src={item.product?.imageUrl}
                      alt={item.product?.name}
                      className="w-[100px] h-[100px] object-contain border border-gray-100 rounded p-1.5 flex-shrink-0"
                      onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product?.id || item.productId}`}
                        className="text-[14px] text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-[13px] text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-[15px] font-bold text-[#B12704] mt-1">₹{parseFloat(item.priceAtPurchase).toLocaleString('en-IN')}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/products/${item.product?.id || item.productId}`)}
                          className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded-full border border-[#FCD200] shadow-sm transition-colors"
                        >
                          Buy it again
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">
            {/* Shipping Address */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-5">
              <h3 className="text-[14px] font-bold text-[#0F1111] mb-3">Shipping Address</h3>
              <div className="text-[13px] text-gray-700 space-y-0.5">
                <p className="font-bold">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-5">
              <h3 className="text-[14px] font-bold text-[#0F1111] mb-3">Payment Method</h3>
              <p className="text-[13px] text-gray-700 uppercase">{order.paymentMethod}</p>
              {order.paymentId && (
                <p className="text-[12px] text-gray-400 mt-1">Txn: {order.paymentId}</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-5">
              <h3 className="text-[14px] font-bold text-[#0F1111] mb-3">Order Summary</h3>
              <div className="text-[13px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-green-700">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-[16px] text-[#B12704]">
                  <span>Order Total:</span>
                  <span>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <Link to="/orders" className="block w-full text-center bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2.5 rounded-lg font-bold text-[14px] shadow-sm transition-colors">
                Back to Orders
              </Link>
              <Link to="/" className="block w-full text-center bg-white border border-[#d5d9d9] py-2.5 rounded-lg font-medium text-[14px] shadow-sm hover:bg-gray-50 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}