import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import StatusBadge from '../../components/common/StatusBadge';

const Stat = ({ label, value, color }) => (
  <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
    <p className="text-[13px] text-[#565959]">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
  </div>
);

const LowStockBadge = ({ stock }) => (
  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stock === 0 ? 'bg-red-100 text-[#CC0C39]' : 'bg-orange-100 text-[#c45500]'}`}>
    {stock === 0 ? 'Out of stock' : `${stock} left`}
  </span>
);

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/seller/dashboard'),
      api.get('/seller/inventory/low-stock'),
    ])
      .then(([dashRes, stockRes]) => {
        setStats(dashRes.data.data);
        setLowStock(stockRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-[21px] font-bold text-[#0F1111]">Seller Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF9900]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Total Listings"   value={stats?.total}    color="text-[#FF9900]" />
              <Stat label="Pending Approval" value={stats?.pending}  color="text-[#c45500]" />
              <Stat label="Approved"         value={stats?.approved} color="text-[#007600]" />
              <Stat label="Rejected"         value={stats?.rejected} color="text-[#CC0C39]" />
            </div>

            {/* Low Stock Alerts */}
            {lowStock.length > 0 && (
              <div className="bg-white border border-orange-200 rounded shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-100 bg-orange-50">
                  <svg className="w-5 h-5 text-[#c45500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <h2 className="text-[15px] font-bold text-[#c45500]">Low Stock Alerts ({lowStock.length})</h2>
                  <span className="ml-auto text-[12px] text-[#565959]">Stock ≤ 10 units</span>
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] text-[#565959] uppercase border-b border-gray-100 bg-[#F7F8F8]">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Variant</th>
                      <th className="px-5 py-3 font-medium">Stock</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lowStock.map((alert, i) => (
                      <tr key={i} className="hover:bg-orange-50">
                        <td className="px-5 py-3 font-medium text-[#0F1111] max-w-[200px] truncate">{alert.productName}</td>
                        <td className="px-5 py-3 text-[#565959]">{alert.label || '—'}</td>
                        <td className="px-5 py-3"><LowStockBadge stock={alert.stock} /></td>
                        <td className="px-5 py-3">
                          <Link
                            to={`/seller/listings/${alert.productId}/edit`}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline text-[12px]"
                          >
                            Update stock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[16px] font-bold text-[#0F1111]">Recent Listings</h2>
                <Link to="/seller/listings" className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline">See all</Link>
              </div>

              {(!stats?.recent || stats.recent.length === 0) ? (
                <div className="text-center py-12">
                  <p className="text-[14px] text-[#565959] mb-3">No products yet.</p>
                  <Link to="/seller/listings/new"
                    className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-5 py-1.5 rounded shadow-sm text-[13px] font-medium">
                    Add your first product
                  </Link>
                </div>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] text-[#565959] uppercase border-b border-gray-100 bg-[#F7F8F8]">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Price</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recent.map(p => (
                      <tr key={p.id} className="hover:bg-[#F7F8F8]">
                        <td className="px-5 py-3 font-medium text-[#0F1111] max-w-[220px] truncate">{p.name}</td>
                        <td className="px-5 py-3 text-[#565959]">{p.category?.name || '—'}</td>
                        <td className="px-5 py-3 font-medium">₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
