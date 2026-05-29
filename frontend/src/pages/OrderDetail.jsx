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

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Return/cancel states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      if (res.data.success) {
        setOrder(res.data.data);
        alert('Order cancelled successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/orders/${id}/return`, { returnReason });
      if (res.data.success) {
        setOrder(res.data.data);
        setShowReturnModal(false);
        alert('Return request submitted!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setActionLoading(false);
    }
  };

  const isReturnable = (updatedAt) => {
    const deliveredAt = new Date(updatedAt).getTime();
    const now = Date.now();
    const diffDays = (now - deliveredAt) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

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

  const isReturnFlow = order.status === 'return_pending' || order.status === 'returned';

  const STATUS_STEPS = isReturnFlow
    ? ['pending', 'confirmed', 'shipped', 'delivered', 'returned']
    : ['pending', 'confirmed', 'shipped', 'delivered'];

  const STATUS_LABELS = { 
    pending: 'Ordered', 
    confirmed: 'Confirmed', 
    shipped: 'Shipped', 
    delivered: 'Delivered',
    returned: order.status === 'return_pending' ? 'Return Pending' : 'Returned' 
  };

  const statusForStep = order.status === 'return_pending' ? 'delivered' : order.status;
  const currentStepIdx = STATUS_STEPS.indexOf(statusForStep);
  const orderNum = `406-${String(order.id).padStart(7, '0')}-${String(order.id * 1234567 % 9999999).padStart(7, '0')}`;

  return (
    <>
      <div className="bg-[#EAEDED] min-h-screen pb-16 print:hidden">
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
                <p className={`text-[18px] font-bold mb-1 
                  ${order.status === 'delivered' ? 'text-green-700' : 
                    order.status === 'cancelled' ? 'text-red-600' : 
                    order.status === 'return_pending' ? 'text-blue-700' : 
                    order.status === 'returned' ? 'text-green-800' : 
                    'text-[#0F1111]'}`}>
                  {order.status === 'delivered' ? `Delivered on ${fmtDate(order.updatedAt || order.createdAt)}` :
                   order.status === 'cancelled' ? 'Order Cancelled' :
                   order.status === 'return_pending' ? 'Return Processing (Pending Approval)' :
                   order.status === 'returned' ? 'Order Returned & Refunded' :
                   `Arriving by ${getDeliveryDate(order.createdAt)}`}
                </p>

                {order.status !== 'cancelled' && (
                  <div className="mt-5">
                    {/* Progress bar */}
                    <div className="relative flex items-start justify-between">
                      {/* Line Wrapper (inset by 10px so it runs from center of first to center of last circle) */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 h-1 -translate-y-1/2">
                        <div className="absolute inset-0 bg-gray-200 rounded-full" />
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-[#067D62] rounded-full transition-all duration-500"
                          style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                      </div>
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
                      <div className="w-[100px] h-[100px] flex-shrink-0 border border-gray-100 rounded bg-white flex items-center justify-center overflow-hidden p-1.5">
                        <img
                          src={item.product?.imageUrl}
                          alt={item.product?.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product?.id || item.productId}`}
                          className="text-[14px] text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        {item.variantLabel && (
                          <p className="text-[13px] text-gray-500 mt-1 font-medium">{item.variantLabel}</p>
                        )}
                        <p className="text-[13px] text-gray-500 mt-1">Qty: {item.quantity}</p>
                        <p className="text-[15px] font-bold text-[#B12704] mt-1">₹{parseFloat(item.priceAtPurchase).toLocaleString('en-IN')}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => navigate(`/products/${item.product?.id || item.productId}`)}
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded-full border border-[#FCD200] shadow-sm transition-colors"
                          >
                            Buy it again
                          </button>
                          {order.status === 'delivered' && isReturnable(order.updatedAt) && (
                            <button
                              onClick={() => setShowReturnModal(true)}
                              className="bg-white hover:bg-gray-50 text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded-full border border-[#d5d9d9] shadow-sm transition-colors"
                            >
                              Return item
                            </button>
                          )}
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

              {/* Order Actions Panel */}
              <div className="bg-white border border-[#d5d9d9] rounded-lg p-5 space-y-3 shadow-sm text-[13px]">
                <h3 className="font-bold text-[#0F1111] pb-2 border-b border-gray-100">Order Actions</h3>
                
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={actionLoading}
                    className="w-full bg-[#CC0C39] hover:bg-[#b30b32] text-white py-2 rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}

                {order.status === 'delivered' && isReturnable(order.updatedAt) && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    disabled={actionLoading}
                    className="w-full bg-[#FFA41C] hover:bg-[#FA8914] text-[#0F1111] py-2 rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
                  >
                    Return Order
                  </button>
                )}

                {order.status === 'return_pending' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded space-y-1 font-medium">
                    <p className="font-bold">Return Pending Approval</p>
                    <p className="text-gray-600 text-xs">Reason: "{order.returnReason}"</p>
                  </div>
                )}

                {order.status === 'returned' && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded space-y-1 font-medium">
                    <p className="font-bold">Returned & Refunded</p>
                    <p className="text-gray-600 text-xs">Reason: "{order.returnReason}"</p>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <p className="text-red-600 font-bold italic text-center">This order is cancelled.</p>
                )}

                {order.status === 'delivered' && !isReturnable(order.updatedAt) && (
                  <p className="text-gray-500 italic text-center text-xs">Return window has closed.</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Return Request Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-gray-300 shadow-xl max-w-md w-full animate-fade-in">
              <div className="bg-[#F0F2F2] px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                <h2 className="text-sm font-bold text-[#0F1111]">Return Items</h2>
                <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleReturnOrder} className="p-6 space-y-4 text-[13px]">
                <div>
                  <label className="block font-bold text-[#0F1111] mb-1">Reason for Return</label>
                  <textarea
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    rows="3"
                    placeholder="Please describe the issue (e.g. Defective, damaged, wrong size)"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none resize-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="px-4 py-1.5 bg-white border border-[#D5D9D9] hover:bg-gray-50 rounded-lg font-medium shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg font-medium shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── PRINT-ONLY INVOICE RECEIPT ── */}
      <div className="hidden print:block print-invoice-container p-8 bg-white text-black font-sans text-sm min-h-screen">
        {/* Invoice Header */}
        <div className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">AMAZON CLONE</h1>
            <p className="text-xs text-gray-500 mt-1">Receipt & Invoice</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">INVOICE / RECEIPT</p>
            <p className="text-xs text-gray-500">Order ID: #{order.id}</p>
            <p className="text-xs text-gray-500">Order Date: {fmtDate(order.createdAt)}</p>
            <p className="text-xs text-gray-500">Invoice Date: {fmtDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold border-b border-gray-200 pb-1 mb-2 text-xs uppercase tracking-wider text-gray-500">Shipping Details</h3>
            <p className="font-bold">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
          <div>
            <h3 className="font-bold border-b border-gray-200 pb-1 mb-2 text-xs uppercase tracking-wider text-gray-500">Payment Summary</h3>
            <p className="font-medium">Method: <span className="uppercase font-bold">{order.paymentMethod}</span></p>
            {order.paymentId && <p className="text-xs text-gray-500">Transaction ID: {order.paymentId}</p>}
            <p className="mt-2 text-xs text-green-700 font-bold uppercase">Payment Status: Paid / Confirmed</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 font-bold text-xs uppercase tracking-wider">Item Details</th>
              <th className="py-2 font-bold text-xs uppercase tracking-wider text-right w-24">Unit Price</th>
              <th className="py-2 font-bold text-xs uppercase tracking-wider text-center w-20">Qty</th>
              <th className="py-2 font-bold text-xs uppercase tracking-wider text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 pr-4">
                  <p className="font-bold text-gray-900">{item.product?.name}</p>
                  {item.variantLabel && <p className="text-xs text-gray-500">{item.variantLabel}</p>}
                  {item.product?.brand && <p className="text-xs text-gray-400">Brand: {item.product.brand}</p>}
                </td>
                <td className="py-3 text-right">₹{parseFloat(item.priceAtPurchase).toLocaleString('en-IN')}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right font-bold">₹{(item.quantity * parseFloat(item.priceAtPurchase)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mt-4">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping & Handling:</span>
              <span className="text-green-700 font-medium">FREE</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg text-black">
              <span>Order Total:</span>
              <span>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 mt-12 text-center text-xs text-gray-400">
          <p>Thank you for shopping with Amazon Clone!</p>
          <p className="mt-1">This is a computer-generated invoice and does not require a physical signature.</p>
        </div>
      </div>
    </>
  );
}