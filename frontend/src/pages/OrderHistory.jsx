import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── Dummy order history data ── */
const DUMMY_ORDERS = [
  {
    id: 'D-9876543',
    isDummy: true,
    totalAmount: '1499.00',
    status: 'delivered',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: { name: 'Home', city: 'Ahmedabad', state: 'Gujarat' },
    items: [
      {
        id: 'd1',
        quantity: 1,
        priceAtPurchase: '1499.00',
        product: {
          name: 'boAt Rockerz 450 Bluetooth On Ear Headphones with Mic, Upto 15 Hours Playback, Padded Ear Cushions',
          imageUrl: '/images/products/headphones.png',
        },
      },
    ],
  },
  {
    id: 'D-8765432',
    isDummy: true,
    totalAmount: '3299.00',
    status: 'delivered',
    paymentMethod: 'Razorpay',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: { name: 'Home', city: 'Ahmedabad', state: 'Gujarat' },
    items: [
      {
        id: 'd2',
        quantity: 1,
        priceAtPurchase: '2499.00',
        product: {
          name: 'Noise ColorFit Pro 4 Max 1.8" Display Smartwatch with Bluetooth Calling, Built-in Alexa',
          imageUrl: '/images/products/smartwatch.png',
        },
      },
      {
        id: 'd3',
        quantity: 2,
        priceAtPurchase: '400.00',
        product: {
          name: 'AmazonBasics USB Type-C to Lightning Cable, MFi Certified Charger',
          imageUrl: '/images/products/usb-cable.png',
        },
      },
    ],
  },
  {
    id: 'D-7654321',
    isDummy: true,
    totalAmount: '649.00',
    status: 'delivered',
    paymentMethod: 'COD',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: { name: 'Home', city: 'Ahmedabad', state: 'Gujarat' },
    items: [
      {
        id: 'd4',
        quantity: 1,
        priceAtPurchase: '649.00',
        product: {
          name: 'Lakme Eyeconic Kajal, Black, 0.35g + Lakme 9 to 5 Primer + Matte Lipstick Set',
          imageUrl: '/images/products/cosmetics.png',
        },
      },
    ],
  },
];

/* ── Helpers ── */
const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fmtShortDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
};

const statusLabel = {
  pending: { text: 'Order Placed', color: 'text-blue-600' },
  confirmed: { text: 'Confirmed', color: 'text-blue-700' },
  shipped: { text: 'Shipped', color: 'text-yellow-700' },
  delivered: { text: 'Delivered', color: 'text-green-700' },
  cancelled: { text: 'Cancelled', color: 'text-red-600' },
};

const getDeliveryDate = (createdAt) => {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 5);
  return d;
};

/* ══════════════════ EMPTY STATE ══════════════════ */
const EmptyOrders = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
      <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-[#f0f2f2] flex items-center justify-center">
        <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#0F1111] mb-2">You haven't placed any orders yet</h2>
      <p className="text-[15px] text-gray-600 mb-8 max-w-md mx-auto">
        Looks like you haven't made your first order. Browse our products and discover amazing deals!
      </p>
      <Link
        to="/"
        className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] px-10 py-3 rounded-full font-bold text-[15px] shadow-sm transition-colors"
      >
        Continue Shopping
      </Link>
      <div className="flex items-center justify-center gap-8 mt-10 text-[13px] text-gray-500">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Secure payments
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          Easy returns
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          Fast delivery
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════ ORDER CARD ══════════════════ */
const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const isDelivered = order.status === 'delivered';
  const isPending = order.status === 'pending' || order.status === 'confirmed';
  const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : getDeliveryDate(order.createdAt);
  const st = statusLabel[order.status] || statusLabel.pending;

  return (
    <div className="bg-white border border-[#d5d9d9] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* ── Card Header ── */}
      <div className="bg-[#f0f2f2] border-b border-[#d5d9d9] px-4 py-3 flex flex-wrap gap-y-2 justify-between items-center text-[13px]">
        <div className="flex gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Order Placed</p>
            <p className="text-[#0F1111]">{fmtDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Total</p>
            <p className="text-[#0F1111] font-bold">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Ship To</p>
            <p className="text-[#007185] cursor-pointer hover:underline">{order.shippingAddress?.name || 'N/A'} ▾</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
            Order # {order.isDummy ? order.id : `406-${String(order.id).padStart(7, '0')}-${String(order.id * 1234567 % 9999999).padStart(7, '0')}`}
          </p>
          {!order.isDummy && (
            <Link to={`/orders/${order.id}`} className="text-[#007185] hover:text-[#C7511F] hover:underline text-[13px]">
              View order details
            </Link>
          )}
          {order.isDummy && (
            <span className="text-[#007185] cursor-default text-[13px]">View order details</span>
          )}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4">
        {/* Status line */}
        <div className="mb-4">
          {isDelivered ? (
            <div>
              <p className="text-[18px] font-bold text-[#0F1111]">Delivered {fmtShortDate(deliveryDate)}</p>
              <p className="text-[13px] text-gray-600">Package was handed to resident</p>
            </div>
          ) : (
            <div>
              <p className={`text-[18px] font-bold ${st.color}`}>{st.text}</p>
              <p className="text-[13px] text-gray-600">
                {isPending ? `Arriving by ${fmtShortDate(getDeliveryDate(order.createdAt))}` : 'On its way'}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 mb-4 last:mb-0">
            <div className="w-[90px] h-[90px] flex-shrink-0 border border-gray-100 rounded bg-white flex items-center justify-center overflow-hidden p-1">
              <img
                src={item.product?.imageUrl}
                alt={item.product?.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to={item.product?.id ? `/products/${item.product.id}` : '#'}
                className="text-[14px] text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2 leading-snug"
              >
                {item.product?.name}
              </Link>
              {item.quantity > 1 && (
                <p className="text-[12px] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => item.product?.id && navigate(`/products/${item.product.id}`)}
                  className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded-full border border-[#FCD200] shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Buy it again
                </button>
                <button
                  onClick={() => item.product?.id && navigate(`/products/${item.product.id}`)}
                  className="bg-white hover:bg-gray-50 text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded-full border border-[#d5d9d9] shadow-sm transition-colors"
                >
                  View your item
                </button>
              </div>
            </div>

            {/* Right-side action buttons (desktop) */}
            <div className="hidden md:flex flex-col gap-2 flex-shrink-0 w-[200px]">
              {isDelivered && (
                <>
                  <button className="w-full bg-white hover:bg-gray-50 text-[13px] text-[#0F1111] border border-[#d5d9d9] rounded-lg py-1.5 shadow-sm transition-colors">
                    Track package
                  </button>
                  <button className="w-full bg-white hover:bg-gray-50 text-[13px] text-[#0F1111] border border-[#d5d9d9] rounded-lg py-1.5 shadow-sm transition-colors">
                    Return items
                  </button>
                  <button className="w-full bg-white hover:bg-gray-50 text-[13px] text-[#0F1111] border border-[#d5d9d9] rounded-lg py-1.5 shadow-sm transition-colors">
                    Write a product review
                  </button>
                </>
              )}
              {isPending && (
                <button className="w-full bg-white hover:bg-gray-50 text-[13px] text-[#0F1111] border border-[#d5d9d9] rounded-lg py-1.5 shadow-sm transition-colors">
                  Track package
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function OrderHistory() {
  const { user } = useAuth();
  const [realOrders, setRealOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setRealOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Merge real orders first, then dummy ones
  const allOrders = [...realOrders, ...DUMMY_ORDERS];
  const hasRealOrders = realOrders.length > 0;
  const totalCount = allOrders.length;

  // Filter by search
  const filteredOrders = searchQuery
    ? allOrders.filter((o) =>
        o.items.some((item) =>
          item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : allOrders;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin" />
    </div>
  );

  // Not logged in
  if (!user) return (
    <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-lg p-10 text-center max-w-md shadow-sm">
        <h2 className="text-2xl font-bold text-[#0F1111] mb-3">Sign in to view orders</h2>
        <p className="text-[14px] text-gray-600 mb-6">Please sign in to see your order history.</p>
        <Link to="/login" className="inline-block bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] px-8 py-2.5 rounded-lg font-bold shadow-sm transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );

  // No orders at all (no real, show empty)
  if (!hasRealOrders) return (
    <div className="min-h-screen bg-[#EAEDED] pb-16">
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-4 pt-5">
        <p className="text-[13px] text-[#007185]">
          <Link to="/profile" className="hover:underline hover:text-[#C7511F]">Your Account</Link>
          <span className="mx-1 text-gray-400">›</span>
          <span className="text-[#C7511F]">Your Orders</span>
        </p>
      </div>
      <EmptyOrders />
    </div>
  );

  const tabs = [
    { key: 'orders', label: 'Orders' },
    { key: 'buy-again', label: 'Buy Again' },
    { key: 'not-shipped', label: 'Not Yet Shipped' },
    { key: 'cancelled', label: 'Cancelled Orders' },
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-16">
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-4 pt-5">
        <p className="text-[13px] text-[#007185]">
          <Link to="/profile" className="hover:underline hover:text-[#C7511F]">Your Account</Link>
          <span className="mx-1 text-gray-400">›</span>
          <span className="text-[#C7511F]">Your Orders</span>
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 mt-3">
        {/* ── Title + Search ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-[28px] font-bold text-[#0F1111]">Your Orders</h1>
          <div className="flex h-[38px] rounded overflow-hidden border border-[#888c8c] focus-within:ring-2 ring-[#e77600] focus-within:border-[#e77600]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all orders"
              className="w-[260px] px-3 text-[14px] text-[#0F1111] outline-none"
            />
            <button className="bg-[#131921] hover:bg-[#232F3E] text-white px-5 text-[14px] font-bold transition-colors">
              Search Orders
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-[#d5d9d9] mb-4">
          <div className="flex gap-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`pb-3 text-[14px] font-medium border-b-[3px] transition-colors ${
                  activeTab === t.key
                    ? 'border-[#e77600] text-[#C7511F]'
                    : 'border-transparent text-[#0F1111] hover:text-[#C7511F]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders Count + Filter ── */}
        <div className="flex items-center gap-2 mb-5 text-[14px]">
          <span className="font-bold text-[#0F1111]">{filteredOrders.length} orders</span>
          <span className="text-[#0F1111]">placed in</span>
          <select className="border border-[#888c8c] rounded-lg px-2 py-1 text-[13px] text-[#0F1111] bg-[#f0f2f2] cursor-pointer outline-none focus:ring-2 ring-[#e77600]">
            <option>past 3 months</option>
            <option>past 6 months</option>
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>

        {/* ── Order Cards ── */}
        <div className="space-y-5">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <OrderCard key={order.isDummy ? order.id : `real-${order.id}`} order={order} />
            ))
          ) : (
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-10 text-center">
              <p className="text-[16px] text-gray-600 mb-4">No orders match your search.</p>
              <button onClick={() => setSearchQuery('')} className="text-[#007185] hover:text-[#C7511F] hover:underline text-[14px]">
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}