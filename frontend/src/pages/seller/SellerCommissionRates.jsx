import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';

const pct = (rate) => `${(parseFloat(rate) * 100).toFixed(1)}%`;
const fmtINR = (n) => `₹${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function SellerCommissionRates() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calcPrice, setCalcPrice] = useState('');

  useEffect(() => {
    api.get('/seller/commission-tiers')
      .then(r => setTiers(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const matchedTier = (() => {
    const p = parseFloat(calcPrice);
    if (!p || p <= 0) return null;
    return tiers.find(t =>
      p >= parseFloat(t.minPrice) && (t.maxPrice == null || p <= parseFloat(t.maxPrice))
    ) || null;
  })();

  const calcResult = (() => {
    const p = parseFloat(calcPrice);
    if (!p || p <= 0 || !matchedTier) return null;
    const rate = parseFloat(matchedTier.rate);
    const fee  = p * rate;
    const earn = p - fee;
    return { rate, fee, earn };
  })();

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-[21px] font-bold text-[#0F1111]">Commission Rates</h1>
          <p className="text-[13px] text-[#565959] mt-1">
            Platform fees are deducted automatically when an order item is marked as delivered.
            The rate applied depends on your listing price at the time of sale.
          </p>
        </div>

        {/* Tiers table */}
        <section className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-[#F7F8F8] border-b border-gray-200">
            <h2 className="text-[15px] font-bold text-[#0F1111]">Current Fee Structure</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-[#FF9900]" />
            </div>
          ) : tiers.length === 0 ? (
            <p className="text-[13px] text-[#565959] text-center py-10">No commission tiers configured.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-[11px] text-[#565959] uppercase">
                  <th className="px-5 py-3 font-medium">Tier</th>
                  <th className="px-5 py-3 font-medium">Item Price Range</th>
                  <th className="px-5 py-3 font-medium">Platform Fee</th>
                  <th className="px-5 py-3 font-medium">You Keep</th>
                  <th className="px-5 py-3 font-medium">Example on ₹1,000</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tiers.map(t => {
                  const rate  = parseFloat(t.rate);
                  const keep  = (1 - rate) * 100;
                  const fee1k = (1000 * rate).toFixed(2);
                  const earn1k = (1000 - fee1k).toFixed(2);
                  const maxLabel = t.maxPrice == null ? '∞' : `₹${parseFloat(t.maxPrice).toLocaleString('en-IN')}`;
                  return (
                    <tr key={t.id} className="hover:bg-[#F7F8F8]">
                      <td className="px-5 py-3 font-semibold text-[#0F1111]">{t.label}</td>
                      <td className="px-5 py-3 text-[#565959]">
                        ₹{parseFloat(t.minPrice).toLocaleString('en-IN')} – {maxLabel}
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-[#FFF3CD] text-[#856404] text-[12px] font-bold px-2 py-0.5 rounded">
                          {pct(t.rate)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[#007600] font-semibold">{keep.toFixed(1)}%</span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[#565959]">
                        Fee <span className="text-[#CC0C39] font-medium">₹{fee1k}</span>
                        {' → '}
                        You get <span className="text-[#007600] font-medium">₹{earn1k}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Calculator */}
        <section className="bg-white border border-gray-200 rounded shadow-sm p-5">
          <h2 className="text-[15px] font-bold text-[#0F1111] mb-1">Fee Calculator</h2>
          <p className="text-[12px] text-[#565959] mb-4">Enter your listing price to see the exact fee and your earnings.</p>

          <div className="flex gap-3 items-center max-w-sm">
            <span className="text-[14px] font-medium text-[#0F1111]">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={calcPrice}
              onChange={e => setCalcPrice(e.target.value)}
              placeholder="Enter price…"
              className="flex-1 border border-gray-400 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
            />
          </div>

          {calcResult && matchedTier && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-[#F7F8F8] border border-gray-200 rounded p-4 text-center">
                <p className="text-[11px] text-[#565959] uppercase font-medium mb-1">Your Price</p>
                <p className="text-[18px] font-bold text-[#0F1111]">{fmtINR(calcPrice)}</p>
                <p className="text-[11px] text-[#565959] mt-1">{matchedTier.label} tier</p>
              </div>
              <div className="bg-[#FFF8EC] border border-[#e88b00] rounded p-4 text-center">
                <p className="text-[11px] text-[#856404] uppercase font-medium mb-1">Platform Fee ({pct(matchedTier.rate)})</p>
                <p className="text-[18px] font-bold text-[#c45500]">-{fmtINR(calcResult.fee)}</p>
                <p className="text-[11px] text-[#565959] mt-1">deducted on delivery</p>
              </div>
              <div className="bg-[#EAF7EA] border border-green-300 rounded p-4 text-center">
                <p className="text-[11px] text-[#2d6a2d] uppercase font-medium mb-1">You Receive</p>
                <p className="text-[18px] font-bold text-[#007600]">{fmtINR(calcResult.earn)}</p>
                <p className="text-[11px] text-[#565959] mt-1">credited to your balance</p>
              </div>
            </div>
          )}

          {calcPrice && parseFloat(calcPrice) > 0 && !matchedTier && !loading && (
            <p className="mt-3 text-[13px] text-[#565959]">No matching tier found — a default rate will apply.</p>
          )}
        </section>

        {/* Info note */}
        <div className="bg-[#E8F4FD] border border-[#BDD7EE] rounded p-4 text-[13px] text-[#0F1111] space-y-1">
          <p className="font-semibold">How commission works</p>
          <ul className="list-disc list-inside space-y-1 text-[#565959]">
            <li>Commission is calculated on the <strong>per-unit price at purchase</strong>, not the total order value.</li>
            <li>It is deducted from your ledger only when an item status reaches <strong>Delivered</strong>.</li>
            <li>If an order is cancelled or returned, no commission is charged.</li>
            <li>The exact rate applied is visible on every commission entry in your <a href="/seller/financials" className="text-[#0066C0] hover:underline">Payments ledger</a>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
