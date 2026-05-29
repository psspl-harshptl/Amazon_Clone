import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';

const pct = (rate) => `${(parseFloat(rate) * 100).toFixed(1)}%`;
const fmtPrice = (p) => p == null ? '∞' : `₹${parseFloat(p).toLocaleString('en-IN')}`;

const EMPTY = { label: '', minPrice: '', maxPrice: '', rate: '' };

export default function AdminCommissionTiers() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/commission-tiers')
      .then(r => setTiers(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const openAdd = () => {
    setForm(EMPTY);
    setErr('');
    setModal({ mode: 'add' });
  };

  const openEdit = (tier) => {
    setForm({
      label:    tier.label,
      minPrice: tier.minPrice,
      maxPrice: tier.maxPrice ?? '',
      rate:     (parseFloat(tier.rate) * 100).toFixed(1),
    });
    setErr('');
    setModal({ mode: 'edit', id: tier.id });
  };

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const payload = {
        label:    form.label,
        minPrice: parseFloat(form.minPrice),
        maxPrice: form.maxPrice !== '' ? parseFloat(form.maxPrice) : null,
        rate:     parseFloat(form.rate) / 100,
      };
      if (modal.mode === 'add') {
        await api.post('/admin/commission-tiers', payload);
        flash('Tier added');
      } else {
        await api.put(`/admin/commission-tiers/${modal.id}`, payload);
        flash('Tier updated');
      }
      setModal(null);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this commission tier?')) return;
    try {
      await api.delete(`/admin/commission-tiers/${id}`);
      flash('Tier deleted');
      load();
    } catch (e) {
      flash(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 space-y-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[21px] font-bold text-[#0F1111]">Commission Tiers</h1>
            <p className="text-[12px] text-[#565959] mt-0.5">
              Platform fee charged to sellers based on item price at time of delivery.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors"
          >
            + Add Tier
          </button>
        </div>

        {msg && (
          <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded shadow-sm">{msg}</div>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
            </div>
          ) : tiers.length === 0 ? (
            <p className="text-center text-[#565959] py-16 text-[14px]">No tiers configured</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F8] border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-5 py-3 font-medium">Label</th>
                  <th className="px-5 py-3 font-medium">Price Range</th>
                  <th className="px-5 py-3 font-medium">Commission Rate</th>
                  <th className="px-5 py-3 font-medium">Example (₹1,000 item)</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tiers.map(t => {
                  const rate = parseFloat(t.rate);
                  const fee = (1000 * rate).toFixed(2);
                  const earn = (1000 - fee).toFixed(2);
                  return (
                    <tr key={t.id} className="hover:bg-[#F7F8F8]">
                      <td className="px-5 py-3 font-semibold text-[#0F1111]">{t.label}</td>
                      <td className="px-5 py-3 text-[#565959]">
                        {fmtPrice(t.minPrice)} — {fmtPrice(t.maxPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-[#FFF3CD] text-[#856404] text-[12px] font-bold px-2 py-0.5 rounded">
                          {pct(t.rate)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[#565959]">
                        Fee ₹{fee} → Seller gets ₹{earn}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => openEdit(t)} className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium">Edit</button>
                          <button onClick={() => remove(t.id)} className="text-[#CC0C39] hover:underline font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-300 rounded shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-[16px] font-bold text-[#0F1111]">
              {modal.mode === 'add' ? 'Add Commission Tier' : 'Edit Commission Tier'}
            </h3>

            {err && (
              <div className="p-3 bg-[#FFBABA] border border-[#D8000C] text-[#D8000C] text-[13px] rounded">{err}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Label</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Standard"
                  className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Min Price (₹)</label>
                  <input type="number" min="0" value={form.minPrice} onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Max Price (₹) — blank = no limit</label>
                  <input type="number" min="0" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                    placeholder="Leave blank for no upper limit"
                    className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Commission Rate (%)</label>
                <input type="number" min="0.1" max="99.9" step="0.1" value={form.rate}
                  onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                  placeholder="e.g. 10 for 10%"
                  className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]" />
              </div>

              {/* Live preview */}
              {form.rate && form.minPrice !== '' && (
                <div className="bg-[#F7F8F8] border border-gray-200 rounded p-3 text-[12px] text-[#565959]">
                  Price range <strong className="text-[#0F1111]">
                    ₹{parseFloat(form.minPrice || 0).toLocaleString('en-IN')} –{' '}
                    {form.maxPrice ? `₹${parseFloat(form.maxPrice).toLocaleString('en-IN')}` : '∞'}
                  </strong> → platform takes <strong className="text-[#c45500]">{parseFloat(form.rate || 0).toFixed(1)}%</strong>,
                  seller keeps <strong className="text-[#007600]">{(100 - parseFloat(form.rate || 0)).toFixed(1)}%</strong>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button onClick={() => setModal(null)}
                className="text-[13px] text-[#565959] border border-gray-300 px-4 py-1.5 rounded">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
