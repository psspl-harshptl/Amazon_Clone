import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';

const TABS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const load = (statusFilter = tab) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (statusFilter !== 'all') params.set('sellerStatus', statusFilter);
    api.get(`/admin/sellers?${params}`)
      .then(r => { setSellers(r.data.data.rows || []); setTotal(r.data.data.count || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const approve = async (id) => {
    await api.put(`/admin/sellers/${id}/approve`);
    flash('Seller approved — they can now log in and list products');
    load();
  };

  const submitReject = async () => {
    await api.put(`/admin/sellers/${rejectModal.id}/reject`, { reason: rejectReason });
    setRejectModal(null);
    flash('Seller rejected');
    load();
  };

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-4 overflow-auto">
        <h1 className="text-[21px] font-bold text-[#0F1111]">Sellers ({total})</h1>

        {msg && (
          <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded shadow-sm">{msg}</div>
        )}

        <div className="flex gap-0 border border-gray-300 rounded overflow-hidden w-fit bg-white shadow-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] font-medium capitalize border-r border-gray-200 last:border-r-0 transition-colors ${
                tab === t ? 'bg-[#232F3E] text-white' : 'text-[#0F1111] hover:bg-[#F7F8F8]'
              }`}
            >{t}</button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
            </div>
          ) : sellers.length === 0 ? (
            <p className="text-center text-[#565959] py-16 text-[14px]">No sellers found</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F8] border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-5 py-3 font-medium">Seller</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellers.map(s => (
                  <tr key={s.id} className="hover:bg-[#F7F8F8]">
                    <td className="px-5 py-3 font-medium text-[#0F1111]">{s.name}</td>
                    <td className="px-5 py-3 text-[#565959]">{s.email}</td>
                    <td className="px-5 py-3 text-[#565959]">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.sellerStatus} />
                      {s.sellerRejectionReason && (
                        <p className="text-[11px] text-[#CC0C39] mt-1 max-w-[150px] truncate">{s.sellerRejectionReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => navigate(`/admin/sellers/${s.id}`)} className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium">View</button>
                        {s.sellerStatus !== 'approved' && (
                          <button onClick={() => approve(s.id)} className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium">Approve</button>
                        )}
                        {s.sellerStatus !== 'rejected' && (
                          <button onClick={() => setRejectModal(s)} className="text-[#CC0C39] hover:underline font-medium">Reject</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-300 rounded shadow-xl p-6 w-full max-w-md">
            <h3 className="text-[16px] font-bold text-[#0F1111] mb-1">Reject Seller</h3>
            <p className="text-[13px] text-[#565959] mb-4">{rejectModal.name} ({rejectModal.email})</p>
            <textarea
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              rows={3} placeholder="Reason (optional — shown to seller)…"
              className="w-full border border-gray-400 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setRejectModal(null)} className="text-[13px] text-[#565959] border border-gray-300 px-4 py-1.5 rounded">Cancel</button>
              <button
                onClick={submitReject}
                className="bg-[#CC0C39] hover:bg-[#b00a30] text-white text-[13px] font-medium px-4 py-1.5 rounded transition-colors"
              >Reject Seller</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
