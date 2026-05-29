import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = (q = '') => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (q) params.set('search', q);
    api.get(`/admin/buyers?${params}`)
      .then(r => { setBuyers(r.data.data.rows || []); setTotal(r.data.data.count || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-4 overflow-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Buyers ({total})</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="border border-gray-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] w-60"
            />
            <button type="submit" className="bg-[#FF9900] hover:bg-[#e88b00] text-black text-[13px] font-medium px-4 py-1.5 rounded transition-colors">
              Search
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
            </div>
          ) : buyers.length === 0 ? (
            <p className="text-center text-[#565959] py-16 text-[14px]">No buyers found</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F8] border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buyers.map(b => (
                  <tr key={b.id} className="hover:bg-[#F7F8F8]">
                    <td className="px-5 py-3 font-medium text-[#0F1111]">{b.name}</td>
                    <td className="px-5 py-3 text-[#565959]">{b.email}</td>
                    <td className="px-5 py-3 text-[#565959]">{b.phone || '—'}</td>
                    <td className="px-5 py-3 text-[#565959]">{b.orderCount}</td>
                    <td className="px-5 py-3 text-[#565959]">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/admin/buyers/${b.id}`)}
                        className="text-[#0066C0] hover:underline font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
