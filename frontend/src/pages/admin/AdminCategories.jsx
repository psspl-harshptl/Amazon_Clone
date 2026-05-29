import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';

const TABS = ['pending', 'approved', 'rejected', 'all'];

export default function AdminCategories() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState('');

  const load = (status = tab) => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/admin/category-requests${params}`)
      .then(r => setRequests(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const approve = async (id) => {
    try {
      await api.put(`/admin/category-requests/${id}/approve`);
      flash('Category approved — now visible in seller dropdown and buyer nav');
      load();
    } catch (e) {
      flash(e.response?.data?.message || 'Approval failed');
    }
  };

  const submitReject = async () => {
    try {
      await api.put(`/admin/category-requests/${rejectModal.id}/reject`, { reason: rejectReason });
      setRejectModal(null);
      setRejectReason('');
      flash('Category request rejected');
      load();
    } catch (e) {
      flash(e.response?.data?.message || 'Rejection failed');
    }
  };

  const counts = {
    pending:  requests.length, // only accurate when tab = 'pending'; shown as indicator
  };

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />

      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-[22px] font-bold text-[#0F1111] mb-1">Category Requests</h1>
        <p className="text-[13px] text-[#565959] mb-5">
          Sellers submit these when their product doesn't fit an existing category.
          Approving a request creates the category and immediately makes it available
          in the seller listing form and the buyer navigation bar.
        </p>

        {msg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-[13px] rounded">
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[#d5d9d9] mb-4 flex gap-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-[13px] font-medium border-b-[3px] capitalize transition-colors ${
                tab === t ? 'border-[#e77600] text-[#C7511F]' : 'border-transparent text-[#0F1111] hover:text-[#C7511F]'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#d5d9d9] rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-[#565959] text-[14px]">
              No {tab === 'all' ? '' : tab} category requests.
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#f0f2f2] border-b border-[#d5d9d9]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F1111]">Category Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F1111]">Requested By</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F1111]">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F1111]">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#0F1111]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f2]">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-medium text-[#0F1111]">{req.name}</td>
                    <td className="px-4 py-3 text-[#565959]">
                      <div>{req.seller?.name}</div>
                      <div className="text-[11px]">{req.seller?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#565959]">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                      {req.rejectionReason && (
                        <p className="text-[11px] text-[#CC0C39] mt-1 max-w-[180px] truncate" title={req.rejectionReason}>
                          {req.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approve(req.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal(req); setRejectReason(''); }}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-[16px] font-bold text-[#0F1111] mb-1">Reject Category Request</h2>
            <p className="text-[13px] text-[#565959] mb-3">
              Rejecting <span className="font-medium text-[#0F1111]">"{rejectModal.name}"</span> by {rejectModal.seller?.name}.
            </p>
            <label className="block text-[13px] font-bold text-[#0F1111] mb-1">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Let the seller know why this category won't be created…"
              className="w-full border border-gray-400 rounded px-3 py-2 text-sm text-[#0F1111] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-[13px] border border-[#d5d9d9] rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 text-[13px] bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
