import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import StatusBadge from '../../components/common/StatusBadge';

export default function MyListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadLogs, setUploadLogs] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/seller/products')
      .then(r => setProducts(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await api.delete(`/seller/products/${id}`);
      setMsg('Product deleted successfully.');
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setUploadingCsv(true);
    setUploadLogs(null);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/seller/products/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(`Bulk upload completed! Success: ${res.data.data.successCount}, Failures: ${res.data.data.failureCount}`);
      setUploadLogs(res.data.data.logs);
      setCsvFile(null);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setUploadingCsv(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[21px] font-bold text-[#0F1111]">My Listings</h1>
          <Link
            to="/seller/listings/new"
            className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-4 py-1.5 rounded shadow-sm text-[13px] font-medium transition-all"
          >
            + Add Product
          </Link>
        </div>

        {/* CSV Bulk Upload Area */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-[14px] font-bold text-[#0F1111]">Bulk Upload Products via CSV</h3>
            <p className="text-[12px] text-[#565959]">Columns required: <strong>name, description, price, mrp, stock, category, brand, image_url</strong></p>
          </div>
          <form onSubmit={handleBulkUpload} className="flex gap-2 items-center flex-wrap">
            <input
              type="file"
              accept=".csv"
              required
              onChange={e => setCsvFile(e.target.files[0])}
              className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-[#0F1111] hover:file:bg-gray-200 cursor-pointer"
            />
            <button
              type="submit"
              disabled={uploadingCsv || !csvFile}
              className="bg-[#FF9900] hover:bg-[#e68a00] disabled:opacity-50 text-white text-[12px] font-semibold px-4 py-1.5 rounded shadow-sm transition-all cursor-pointer"
            >
              {uploadingCsv ? 'Uploading...' : 'Upload CSV'}
            </button>
          </form>
        </div>

        {/* Bulk Upload Status Logs */}
        {uploadLogs && (
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-2 max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-[13px] font-bold text-[#0F1111]">CSV Import Logs</h4>
              <button onClick={() => setUploadLogs(null)} className="text-[11px] text-[#007185] hover:underline">Close Logs</button>
            </div>
            <div className="space-y-1 text-[12px]">
              {uploadLogs.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 ${log.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  <span className="font-bold flex-shrink-0">Row {log.row}:</span>
                  <span className="font-semibold flex-shrink-0">[{log.status.toUpperCase()}]</span>
                  <span className="font-medium flex-shrink-0">{log.name}</span>
                  <span>— {log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {msg && (
          <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded">
            {msg}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-[#565959] mb-4">You haven't added any products yet.</p>
              <Link to="/seller/listings/new"
                className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-5 py-1.5 rounded shadow-sm text-[13px] font-medium">
                Add your first product
              </Link>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F8] border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#F7F8F8]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || '/images/products/placeholder.png'}
                          alt=""
                          className="w-10 h-10 object-contain border border-gray-200 rounded bg-white"
                        />
                        <span className="font-medium text-[#0F1111] line-clamp-1 max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#565959]">{p.category?.name || '—'}</td>
                    <td className="px-5 py-3 font-medium">₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-[#565959]">{p.stock}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                      {p.status === 'rejected' && p.rejectionReason && (
                        <p className="text-[11px] text-[#CC0C39] mt-1 max-w-[160px]">{p.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <Link to={`/seller/listings/${p.id}/edit`} className="text-[#0066c0] hover:underline text-[13px]">Edit</Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="text-[#CC0C39] hover:underline text-[13px] disabled:opacity-50"
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
