import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_pending', 'returned'];
const TABS = ['all', ...STATUS_OPTIONS];
const PAGE_SIZE = 15;

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtINR  = (n)   => `₹${parseFloat(n).toLocaleString('en-IN')}`;

export default function AdminOrders() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');
  const [page, setPage]           = useState(1);
  const [updating, setUpdating]   = useState(null);
  const [msg, setMsg]             = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = (t = tab, p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
    if (t !== 'all') params.set('status', t);
    api.get(`/admin/orders?${params}`)
      .then(r => { setOrders(r.data.data.rows || []); setTotal(r.data.data.count || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(tab, 1); }, [tab]);
  useEffect(() => { load(tab, page); }, [page]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      flash('Order status updated');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-4 overflow-auto">

        <div className="flex items-center justify-between">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Orders ({total})</h1>
        </div>

        {msg && (
          <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded shadow-sm">{msg}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border border-gray-300 rounded overflow-hidden w-fit bg-white shadow-sm flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] font-medium capitalize border-r border-gray-200 last:border-r-0 transition-colors ${
                tab === t ? 'bg-[#232F3E] text-white' : 'text-[#0F1111] hover:bg-[#F7F8F8]'
              }`}
            >
              {t === 'return_pending' ? 'Return Pending' : t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-[#565959] py-16 text-[14px]">No orders found</p>
          ) : (
            <>
              <table className="w-full text-[13px]">
                <thead className="bg-[#F7F8F8] border-b border-gray-200">
                  <tr className="text-left text-[11px] text-[#565959] uppercase">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-[#F7F8F8]">
                      <td className="px-5 py-3 text-[#565959] font-medium">
                        #{String(order.id).padStart(6, '0')}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#0F1111]">{order.user?.name}</p>
                        <p className="text-[11px] text-[#565959]">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 3).map(item => (
                            <img
                              key={item.id}
                              src={item.product?.imageUrl || '/images/products/placeholder.png'}
                              alt={item.product?.name}
                              className="w-8 h-8 rounded border-2 border-white object-contain bg-[#F7F8F8]"
                              title={item.product?.name}
                              onError={e => { e.target.src = '/images/products/placeholder.png'; }}
                            />
                          ))}
                          {(order.items?.length || 0) > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-[#565959] font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-[#565959] mt-0.5">{order.items?.length} item(s)</p>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#0F1111]">
                        {fmtINR(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3 text-[#565959]">{fmtDate(order.createdAt)}</td>
                      <td className="px-5 py-3">
                        <select
                          value={order.status}
                          disabled={updating === order.id || ['cancelled', 'returned'].includes(order.status)}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-[12px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] disabled:opacity-60 disabled:cursor-not-allowed bg-white"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                              {s === 'return_pending' ? 'Return Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        {updating === order.id && (
                          <span className="ml-2 text-[11px] text-[#565959]">Saving…</span>
                        )}
                        {order.returnReason && (
                          <p className="text-[11px] text-[#565959] mt-1 max-w-[150px] truncate" title={order.returnReason}>
                            "{order.returnReason}"
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-[#F7F8F8]">
                  <p className="text-[12px] text-[#565959]">
                    Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => goTo(page - 1)} disabled={page === 1}
                      className="px-2.5 py-1 text-[12px] border border-gray-300 rounded bg-white hover:bg-[#F7F8F8] disabled:opacity-40 disabled:cursor-not-allowed">
                      ← Prev
                    </button>
                    <span className="px-3 py-1 text-[12px] text-[#565959]">{page} / {totalPages}</span>
                    <button onClick={() => goTo(page + 1)} disabled={page === totalPages}
                      className="px-2.5 py-1 text-[12px] border border-gray-300 rounded bg-white hover:bg-[#F7F8F8] disabled:opacity-40 disabled:cursor-not-allowed">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
