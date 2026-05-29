import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';

const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function AdminSellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/admin/sellers/${id}`)
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load seller'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const approve = async () => {
    await api.put(`/admin/sellers/${id}/approve`);
    flash('Seller approved');
    load();
  };

  const submitReject = async () => {
    await api.put(`/admin/sellers/${id}/reject`, { reason: rejectReason });
    setRejectModal(false);
    flash('Seller rejected');
    load();
  };

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

  const { seller, products, payoutRequests, clearedBalance, orderStats } = data;

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-5 overflow-auto">
        <button
          onClick={() => navigate('/admin/sellers')}
          className="text-[13px] text-[#0066C0] hover:underline"
        >
          ← Back to Sellers
        </button>

        {msg && (
          <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded">{msg}</div>
        )}

        {/* Profile + actions */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {seller.storeLogo ? (
                <img src={seller.storeLogo} alt="store" className="w-14 h-14 rounded-full object-cover border" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#232F3E] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {seller.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-[18px] font-bold text-[#0F1111]">{seller.storeName || seller.name}</h2>
                <p className="text-[13px] text-[#565959]">{seller.email}</p>
                <div className="mt-1"><StatusBadge status={seller.sellerStatus} /></div>
              </div>
            </div>
            <div className="flex gap-3">
              {seller.sellerStatus !== 'approved' && (
                <button onClick={approve} className="bg-[#017600] hover:bg-[#005a00] text-white text-[13px] font-medium px-4 py-1.5 rounded transition-colors">
                  Approve
                </button>
              )}
              {seller.sellerStatus !== 'rejected' && (
                <button onClick={() => setRejectModal(true)} className="bg-[#CC0C39] hover:bg-[#b00a30] text-white text-[13px] font-medium px-4 py-1.5 rounded transition-colors">
                  Reject
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <Field label="Full Name" value={seller.name} />
            <Field label="Phone" value={seller.phone || '—'} />
            <Field label="City" value={seller.city || '—'} />
            <Field label="State" value={seller.state || '—'} />
            <Field label="Country" value={seller.country || '—'} />
            <Field label="Joined" value={new Date(seller.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            {seller.storeDescription && (
              <div className="col-span-2">
                <Field label="Store Description" value={seller.storeDescription} />
              </div>
            )}
            {seller.sellerRejectionReason && (
              <div className="col-span-2">
                <Field label="Rejection Reason" value={seller.sellerRejectionReason} />
              </div>
            )}
          </div>
        </section>

        {/* Bank details */}
        {seller.bankDetails && (
          <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
            <h2 className="text-[15px] font-bold text-[#0F1111] mb-4">Bank Details</h2>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <Field label="Account Holder" value={seller.bankDetails.accountHolderName || '—'} />
              <Field label="Account Number" value={seller.bankDetails.accountNumber ? `••••${seller.bankDetails.accountNumber.slice(-4)}` : '—'} />
              <Field label="Bank Name" value={seller.bankDetails.bankName || '—'} />
              <Field label="IFSC Code" value={seller.bankDetails.ifscCode || '—'} />
            </div>
          </section>
        )}

        {/* Financials */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-[15px] font-bold text-[#0F1111] mb-4">Financials</h2>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard label="Cleared Balance" value={fmt(clearedBalance)} />
            <StatCard label="Total Items Sold" value={orderStats?.totalItems || 0} />
            <StatCard label="Total Revenue" value={fmt(orderStats?.totalRevenue || 0)} />
          </div>

          {payoutRequests.length > 0 && (
            <>
              <h3 className="text-[13px] font-semibold text-[#0F1111] mb-2">Recent Payout Requests</h3>
              <table className="w-full text-[13px]">
                <thead className="bg-[#F7F8F8] border-b border-gray-200">
                  <tr className="text-left text-[11px] text-[#565959] uppercase">
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Requested</th>
                    <th className="px-4 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payoutRequests.map(p => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 font-medium text-[#0F1111]">{fmt(p.amount)}</td>
                      <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-2 text-[#565959]">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2 text-[#565959]">{p.rejectionReason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        {/* Products */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-[15px] font-bold text-[#0F1111] mb-4">Products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-[13px] text-[#565959]">No products listed yet</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F8] border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-4 py-2 font-medium">Product</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Stock</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Listed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#F7F8F8]">
                    <td className="px-4 py-3 flex items-center gap-3">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt="" className="w-9 h-9 object-cover rounded border flex-shrink-0" />
                      )}
                      <span className="font-medium text-[#0F1111] max-w-[200px] truncate">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-[#565959]">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-[#0F1111]">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-[#565959]">{p.stock ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-[#565959]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-300 rounded shadow-xl p-6 w-full max-w-md">
            <h3 className="text-[16px] font-bold text-[#0F1111] mb-1">Reject Seller</h3>
            <p className="text-[13px] text-[#565959] mb-4">{seller.name} ({seller.email})</p>
            <textarea
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              rows={3} placeholder="Reason (optional — shown to seller)…"
              className="w-full border border-gray-400 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setRejectModal(false)} className="text-[13px] text-[#565959] border border-gray-300 px-4 py-1.5 rounded">Cancel</button>
              <button onClick={submitReject} className="bg-[#CC0C39] hover:bg-[#b00a30] text-white text-[13px] font-medium px-4 py-1.5 rounded transition-colors">
                Reject Seller
              </button>
            </div>
          </div>
        </div>
      )}
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

function StatCard({ label, value }) {
  return (
    <div className="bg-[#F7F8F8] border border-gray-200 rounded p-4 text-center">
      <p className="text-[11px] text-[#565959] uppercase font-medium mb-1">{label}</p>
      <p className="text-[18px] font-bold text-[#0F1111]">{value}</p>
    </div>
  );
}
