import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';

const TABS = ['all', 'pending', 'approved', 'rejected'];
const PAGE_SIZE = 10;

const IconApprove = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const IconReject = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524L13.477 14.89zm1.414-1.414L6.524 5.11A6 6 0 0114.89 13.477zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
  </svg>
);

const IconDelete = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = (statusFilter = tab, q = activeSearch, p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: PAGE_SIZE, page: p });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (q) params.set('search', q);
    api.get(`/admin/products?${params}`)
      .then(r => { setProducts(r.data.data.rows || []); setTotal(r.data.data.count || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(tab, activeSearch, 1); }, [tab, activeSearch]);
  useEffect(() => { load(tab, activeSearch, page); }, [page]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const approve = async (id) => {
    await api.put(`/admin/products/${id}/approve`);
    flash('Product approved — now visible to buyers');
    load();
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    await api.put(`/admin/products/${rejectModal.id}/reject`, { reason: rejectReason });
    setRejectModal(null);
    flash('Product rejected');
    load();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Permanently delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    flash('Product deleted');
    load();
  };

  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const pageNumbers = () => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    if (range[0] > 1) { range.unshift('...'); range.unshift(1); }
    if (range[range.length - 1] < totalPages) { range.push('...'); range.push(totalPages); }
    return range;
  };

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-4 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Products ({total})</h1>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setActiveSearch(search); }}
              placeholder="Search products…"
              className="border border-gray-400 rounded px-3 py-1.5 text-[13px] w-52 focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
            />
            <button
              onClick={() => setActiveSearch(search)}
              className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-3 py-1.5 rounded text-[13px] font-medium shadow-sm"
            >Search</button>
          </div>
        </div>

        {msg && <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded">{msg}</div>}

        {/* Tabs */}
        <div className="flex gap-0 border border-gray-300 rounded overflow-hidden w-fit bg-white shadow-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] font-medium capitalize border-r border-gray-200 last:border-r-0 transition-colors ${
                tab === t ? 'bg-[#232F3E] text-white' : 'text-[#0F1111] hover:bg-[#F7F8F8]'
              }`}
            >{t}</button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-[#565959] py-16 text-[14px]">No products found</p>
          ) : (
            <>
              <table className="w-full text-[13px]">
                <thead className="bg-[#F7F8F8] border-b border-gray-200">
                  <tr className="text-left text-[11px] text-[#565959] uppercase">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Seller</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Views</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-[#F7F8F8]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl || '/images/products/placeholder.png'} alt="" className="w-10 h-10 object-contain border border-gray-200 rounded bg-white flex-shrink-0" />
                          <span className="font-medium text-[#0F1111] line-clamp-2 max-w-[160px] leading-snug">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#565959]">
                        {p.seller?.name || <span className="text-[#999]">—</span>}
                        {p.seller?.email && <div className="text-[11px] text-[#999]">{p.seller.email}</div>}
                      </td>
                      <td className="px-5 py-3 font-medium">₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-[#565959]">{p.viewCount}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                        {p.rejectionReason && (
                          <p className="text-[11px] text-[#CC0C39] mt-1 max-w-[120px] truncate" title={p.rejectionReason}>{p.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {p.status !== 'approved' && (
                            <button
                              onClick={() => approve(p.id)}
                              title="Approve"
                              className="flex items-center justify-center w-7 h-7 rounded bg-[#007600] hover:bg-[#005a00] text-white transition-colors"
                            ><IconApprove /></button>
                          )}
                          {p.status !== 'rejected' && (
                            <button
                              onClick={() => setRejectModal(p)}
                              title="Reject"
                              className="flex items-center justify-center w-7 h-7 rounded bg-[#c45500] hover:bg-[#a34700] text-white transition-colors"
                            ><IconReject /></button>
                          )}
                          <button
                            onClick={() => deleteProduct(p.id)}
                            title="Delete"
                            className="flex items-center justify-center w-7 h-7 rounded bg-[#CC0C39] hover:bg-[#a50a2e] text-white transition-colors"
                          ><IconDelete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-[#F7F8F8]">
                <p className="text-[12px] text-[#565959]">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} products
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goTo(page - 1)} disabled={page === 1}
                    className="px-2.5 py-1 text-[12px] border border-gray-300 rounded bg-white hover:bg-[#F7F8F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >← Prev</button>

                  {pageNumbers().map((n, i) =>
                    n === '...'
                      ? <span key={`e${i}`} className="px-1 text-[#565959] text-[12px]">…</span>
                      : <button
                          key={n}
                          onClick={() => goTo(n)}
                          className={`w-7 h-7 text-[12px] border rounded transition-colors ${
                            n === page
                              ? 'bg-[#232F3E] text-white border-[#232F3E]'
                              : 'bg-white border-gray-300 hover:bg-[#F7F8F8] text-[#0F1111]'
                          }`}
                        >{n}</button>
                  )}

                  <button
                    onClick={() => goTo(page + 1)} disabled={page === totalPages}
                    className="px-2.5 py-1 text-[12px] border border-gray-300 rounded bg-white hover:bg-[#F7F8F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >Next →</button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-300 rounded shadow-xl p-6 w-full max-w-md">
            <h3 className="text-[16px] font-bold text-[#0F1111] mb-1">Reject Product</h3>
            <p className="text-[13px] text-[#565959] mb-4">"{rejectModal.name}"</p>
            <textarea
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              rows={3} placeholder="Reason for rejection (shown to seller)…"
              className="w-full border border-gray-400 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setRejectModal(null)} className="text-[13px] text-[#565959] border border-gray-300 px-4 py-1.5 rounded hover:bg-[#F7F8F8]">Cancel</button>
              <button
                onClick={submitReject} disabled={!rejectReason.trim()}
                className="bg-[#CC0C39] hover:bg-[#b00a30] disabled:opacity-50 text-white text-[13px] font-medium px-4 py-1.5 rounded transition-colors"
              >Reject Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
