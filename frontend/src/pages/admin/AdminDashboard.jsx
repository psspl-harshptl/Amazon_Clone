import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';

const Stat = ({ label, value, color, sub }) => (
  <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
    <p className="text-[13px] text-[#565959]">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
    {sub && <p className="text-[11px] text-[#565959] mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-6 overflow-auto">
        <h1 className="text-[21px] font-bold text-[#0F1111]">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF9900]" />
          </div>
        ) : (
          <>
            <section>
              <p className="text-[11px] font-bold text-[#565959] uppercase tracking-wider mb-3">Products</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Total Products"   value={stats?.products.total}    color="text-[#FF9900]" />
                <Stat label="Pending Approval" value={stats?.products.pending}  color="text-[#c45500]" sub="Needs review" />
                <Stat label="Approved"         value={stats?.products.approved} color="text-[#007600]" />
                <Stat label="Rejected"         value={stats?.products.rejected} color="text-[#CC0C39]" />
              </div>
            </section>

            <section>
              <p className="text-[11px] font-bold text-[#565959] uppercase tracking-wider mb-3">Sellers</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Total Sellers"  value={stats?.sellers.total}    color="text-[#FF9900]" />
                <Stat label="Pending Review" value={stats?.sellers.pending}  color="text-[#c45500]" sub="Awaiting approval" />
                <Stat label="Approved"       value={stats?.sellers.approved} color="text-[#007600]" />
                <Stat label="Rejected"       value={stats?.sellers.rejected} color="text-[#CC0C39]" />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-[#565959] uppercase tracking-wider">Top Viewed Products</p>
                <Link to="/admin/products" className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline">View all</Link>
              </div>
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-[#F7F8F8] border-b border-gray-200">
                    <tr className="text-left text-[11px] text-[#565959] uppercase">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(stats?.topViewed || []).map(p => (
                      <tr key={p.id} className="hover:bg-[#F7F8F8]">
                        <td className="px-5 py-3 font-medium text-[#0F1111]">{p.name}</td>
                        <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-5 py-3 text-[#565959]">{p.viewCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
