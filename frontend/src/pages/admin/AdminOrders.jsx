import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../api/axios';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_pending', 'returned'];

const STATUS_STYLE = {
  pending:        'bg-blue-50   text-blue-700   border-blue-200',
  confirmed:      'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped:        'bg-yellow-50 text-yellow-700 border-yellow-200',
  delivered:      'bg-green-50  text-green-700  border-green-200',
  cancelled:      'bg-red-50    text-red-600    border-red-200',
  return_pending: 'bg-orange-50 text-orange-700 border-orange-200',
  returned:       'bg-purple-50 text-purple-700 border-purple-200',
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminOrders() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [updating, setUpdating]   = useState(null);
  const limit = 15;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (filterStatus) params.set('status', filterStatus);
      const res = await api.get(`/admin/orders?${params}`);
      if (res.data.success) {
        setOrders(res.data.data.rows);
        setTotal(res.data.data.count);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-[#0F1111]">Orders</h1>
          <span className="text-sm text-gray-500">{total} total orders</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-[#232F3E] text-white border-[#232F3E]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">No orders found.</div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Items</th>
                    <th className="text-left px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #406-{String(order.id).padStart(7, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0F1111]">{order.user?.name}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 3).map(item => (
                            <img
                              key={item.id}
                              src={item.product?.imageUrl || '/images/products/placeholder.png'}
                              alt={item.product?.name}
                              className="w-8 h-8 rounded border-2 border-white object-contain bg-gray-50"
                              title={item.product?.name}
                              onError={e => { e.target.src = '/images/products/placeholder.png'; }}
                            />
                          ))}
                          {(order.items?.length || 0) > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{order.items?.length} item(s)</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0F1111]">
                        ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          disabled={updating === order.id || ['cancelled', 'returned'].includes(order.status)}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-medium border rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e77600] disabled:cursor-not-allowed disabled:opacity-70 ${STATUS_STYLE[order.status]}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                              {s === 'return_pending' ? 'Return Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        {order.returnReason && (
                          <p className="text-[10px] text-gray-500 mt-1 max-w-[150px] truncate" title={order.returnReason}>
                            Reason: "{order.returnReason}"
                          </p>
                        )}
                        {updating === order.id && (
                          <span className="ml-2 text-xs text-gray-400">Saving…</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
