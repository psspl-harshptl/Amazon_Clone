import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';

const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function AdminBuyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/buyers/${id}`)
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load buyer'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF9900]" />
      </main>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[#CC0C39] text-[14px]">{error}</p>
      </main>
    </div>
  );

  const { buyer, orders, cart } = data;
  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
  const cartItems = cart?.items || [];

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-5 overflow-auto">
        <button
          onClick={() => navigate('/admin/buyers')}
          className="text-[13px] text-[#0066C0] hover:underline"
        >
          ← Back to Buyers
        </button>

        {/* Profile */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-4">Buyer Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <Field label="Name" value={buyer.name} />
            <Field label="Email" value={buyer.email} />
            <Field label="Phone" value={buyer.phone || '—'} />
            <Field label="Joined" value={new Date(buyer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Field label="City" value={buyer.city || '—'} />
            <Field label="State" value={buyer.state || '—'} />
            <Field label="Country" value={buyer.country || '—'} />
            <Field label="Zip Code" value={buyer.zipCode || '—'} />
            <Field label="Total Orders" value={orders.length} />
            <Field label="Total Spent" value={fmt(totalSpent)} />
          </div>
        </section>

        {/* Cart */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-4">
            Current Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
          </h2>
          {cartItems.length === 0 ? (
            <p className="text-[13px] text-[#565959]">Cart is empty</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F8] border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-4 py-2 font-medium">Product</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Qty</th>
                  <th className="px-4 py-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 flex items-center gap-3">
                      {item.product?.imageUrl && (
                        <img src={item.product.imageUrl} alt="" className="w-10 h-10 object-cover rounded border" />
                      )}
                      <span className="font-medium text-[#0F1111]">{item.product?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-[#565959]">{fmt(item.product?.price)}</td>
                    <td className="px-4 py-3 text-[#565959]">{item.quantity}</td>
                    <td className="px-4 py-3 text-[#0F1111] font-medium">{fmt((item.product?.price || 0) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Orders */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-4">Order History ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-[13px] text-[#565959]">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[13px] font-semibold text-[#0F1111]">Order #{order.id}</span>
                      <span className="text-[12px] text-[#565959] ml-3">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-[13px] font-bold text-[#0F1111]">{fmt(order.totalAmount)}</span>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <p className="text-[12px] text-[#565959] mb-3">
                      Ship to: {[order.shippingAddress.fullName, order.shippingAddress.addressLine1, order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}
                    </p>
                  )}

                  <div className="space-y-2">
                    {(order.items || []).map(item => (
                      <div key={item.id} className="flex items-center gap-3 text-[13px]">
                        {item.product?.imageUrl && (
                          <img src={item.product.imageUrl} alt="" className="w-9 h-9 object-cover rounded border flex-shrink-0" />
                        )}
                        <span className="text-[#0F1111] flex-1">{item.product?.name || '—'}</span>
                        <span className="text-[#565959]">×{item.quantity}</span>
                        <span className="text-[#0F1111] font-medium">{fmt(item.priceAtPurchase)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-[#565959] uppercase font-medium mb-0.5">{label}</p>
      <p className="text-[13px] text-[#0F1111]">{value}</p>
    </div>
  );
}
