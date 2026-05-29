import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import { useAuth } from '../../context/AuthContext';

const fmtINR = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const fmtShort = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

const CHART_H = 180;
const BARS = [
  { key: 'sales',   color: '#007600', label: 'Sales' },
  { key: 'payouts', color: '#007185', label: 'Payouts' },
  { key: 'net',     color: '#FF9900', label: 'Net',    net: true },
];

function BarChart({ monthlyFlow }) {
  const [tooltip, setTooltip] = useState(null);

  if (!monthlyFlow?.length) return null;

  const allVals = monthlyFlow.flatMap(m => [m.sales, m.payouts, Math.max(0, m.net)]);
  const rawMax  = Math.max(...allVals, 1);

  // round up to a nice number for the Y-axis ceiling
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const yMax      = Math.ceil(rawMax / magnitude) * magnitude;

  const STEPS    = 4;
  const gridVals = Array.from({ length: STEPS + 1 }, (_, i) => (yMax / STEPS) * i);

  const px = (v) => Math.round((Math.max(0, v) / yMax) * CHART_H);

  return (
    <div className="select-none">
      <div className="flex gap-3">
        {/* Y-axis labels */}
        <div className="flex flex-col-reverse justify-between pb-6 w-14 flex-shrink-0">
          {gridVals.map(v => (
            <span key={v} className="text-[10px] text-[#565959] text-right leading-none">{fmtShort(v)}</span>
          ))}
        </div>

        {/* Chart body */}
        <div className="flex-1 min-w-0">
          {/* Plot area */}
          <div className="relative" style={{ height: CHART_H }}>
            {/* Gridlines */}
            {gridVals.map(v => (
              <div
                key={v}
                className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                style={{ bottom: `${(v / yMax) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-2 px-1">
              {monthlyFlow.map((m) => (
                <div
                  key={m.key}
                  className="flex-1 flex items-end gap-0.5 cursor-pointer"
                  onMouseEnter={e => setTooltip({ key: m.key, m, rect: e.currentTarget.getBoundingClientRect() })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {BARS.map(({ key, color, net }) => {
                    const val    = net ? Math.max(0, m[key]) : m[key];
                    const height = px(val);
                    return (
                      <div
                        key={key}
                        className="flex-1 rounded-t transition-all duration-200"
                        style={{
                          height:     height > 0 ? height : 2,
                          background: color,
                          opacity:    height > 0 ? 1 : 0.15,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Month labels */}
          <div className="flex gap-2 px-1 mt-2">
            {monthlyFlow.map(m => (
              <div key={m.key} className="flex-1 text-center">
                <span className="text-[10px] text-[#565959] leading-none">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mt-4 pl-[4.25rem]">
        {BARS.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-[11px] text-[#565959]">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip — rendered as fixed overlay */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#0F1111] text-white text-[11px] rounded-lg p-3 shadow-xl pointer-events-none space-y-1 min-w-[160px]"
          style={{ left: tooltip.rect.left + tooltip.rect.width / 2, top: tooltip.rect.top - 8, transform: 'translate(-50%, -100%)' }}
        >
          <p className="font-bold text-[12px] mb-1 border-b border-gray-700 pb-1">{tooltip.m.label}</p>
          <p className="flex justify-between gap-4"><span className="text-green-300">Sales</span><span>{fmtINR(tooltip.m.sales)}</span></p>
          <p className="flex justify-between gap-4"><span className="text-orange-300">Commission</span><span>-{fmtINR(tooltip.m.commissions)}</span></p>
          <p className="flex justify-between gap-4"><span className="text-red-300">Refunds</span><span>-{fmtINR(tooltip.m.refunds)}</span></p>
          <p className="flex justify-between gap-4"><span className="text-blue-300">Payouts</span><span>-{fmtINR(tooltip.m.payouts)}</span></p>
          <p className="flex justify-between gap-4 border-t border-gray-700 pt-1 mt-1">
            <span className="text-white font-semibold">Net</span>
            <span className={tooltip.m.net >= 0 ? 'text-green-300' : 'text-red-300'}>{fmtINR(tooltip.m.net)}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SellerFinancials() {
  const [data, setData] = useState({
    clearedBalance: 0,
    pendingPayouts: 0,
    availableBalance: 0,
    ledger: [],
    payoutRequests: []
  });
  const [analytics, setAnalytics] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/seller/financials')
      .then(r => { setData(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    setAnalyticsLoading(true);
    api.get('/seller/financials/analytics')
      .then(r => setAnalytics(r.data.data))
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      setErr('Please enter a valid positive amount.');
      return;
    }

    if (payoutAmount > data.availableBalance) {
      setErr(`Insufficient balance. You can request up to ₹${parseFloat(data.availableBalance || 0).toLocaleString('en-IN')}.`);
      return;
    }

    try {
      await api.post('/seller/financials/payouts', {
        amount: payoutAmount
      });
      setMsg('Payout request submitted successfully!');
      setAmount('');
      load();
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to submit payout request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-[21px] font-bold text-[#0F1111]">Payments & Financial Ledger</h1>

        {/* ── Analytics ──────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[15px] font-bold text-[#0F1111]">Cash Flow Analytics</h2>
          </div>
          <div className="p-5 space-y-6">

          {analyticsLoading ? (
            <div className="flex justify-center items-center h-28">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-[#FF9900]" />
            </div>
          ) : analytics ? (
            <>
              {/* Lifetime stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Gross Revenue',  value: fmtINR(analytics.lifetimeStats.totalSales),       color: 'text-[#007600]' },
                  { label: 'Commissions',    value: `-${fmtINR(analytics.lifetimeStats.totalCommissions)}`, color: 'text-[#c45500]' },
                  { label: 'Refunds',        value: `-${fmtINR(analytics.lifetimeStats.totalRefunds)}`,     color: 'text-[#CC0C39]' },
                  { label: 'Total Paid Out', value: `-${fmtINR(analytics.lifetimeStats.totalPayouts)}`,     color: 'text-[#0066C0]' },
                  { label: 'Net Earnings',   value: fmtINR(analytics.lifetimeStats.netEarnings),       color: 'text-[#0F1111]', bold: true },
                ].map(({ label, value, color, bold }) => (
                  <div key={label} className="bg-[#F7F8F8] border border-gray-200 rounded p-3">
                    <p className="text-[10px] text-[#565959] uppercase font-medium mb-1">{label}</p>
                    <p className={`text-[15px] font-bold ${color} ${bold ? 'text-[17px]' : ''}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Monthly bar chart */}
              <div>
                <p className="text-[12px] font-semibold text-[#565959] uppercase tracking-wide mb-4">Monthly Cash Flow — last 6 months</p>
                <BarChart monthlyFlow={analytics.monthlyFlow} />
              </div>

              {/* Monthly breakdown table */}
              {analytics.monthlyFlow.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] min-w-[560px]">
                    <thead className="bg-[#F7F8F8] border-b border-gray-200">
                      <tr className="text-left text-[10px] text-[#565959] uppercase">
                        <th className="px-4 py-2 font-medium">Month</th>
                        <th className="px-4 py-2 font-medium text-right">Sales</th>
                        <th className="px-4 py-2 font-medium text-right">Commission</th>
                        <th className="px-4 py-2 font-medium text-right">Refunds</th>
                        <th className="px-4 py-2 font-medium text-right">Payouts</th>
                        <th className="px-4 py-2 font-medium text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[...analytics.monthlyFlow].reverse().map(m => (
                        <tr key={m.key} className="hover:bg-[#F7F8F8]">
                          <td className="px-4 py-2 font-medium text-[#0F1111]">{m.label}</td>
                          <td className="px-4 py-2 text-right text-[#007600]">{fmtINR(m.sales)}</td>
                          <td className="px-4 py-2 text-right text-[#c45500]">-{fmtINR(m.commissions)}</td>
                          <td className="px-4 py-2 text-right text-[#CC0C39]">-{fmtINR(m.refunds)}</td>
                          <td className="px-4 py-2 text-right text-[#0066C0]">-{fmtINR(m.payouts)}</td>
                          <td className={`px-4 py-2 text-right font-bold ${m.net >= 0 ? 'text-[#007600]' : 'text-[#CC0C39]'}`}>
                            {m.net >= 0 ? '' : '-'}{fmtINR(Math.abs(m.net))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-[13px] text-[#565959]">No analytics data available yet.</p>
          )}
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
          </div>
        ) : (
          <>
            {/* Balances Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                <p className="text-[13px] text-[#565959] font-medium">Cleared Balance</p>
                <p className="text-3xl font-bold mt-1 text-[#007600]">₹{parseFloat(data.clearedBalance || 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-[#565959] mt-2">Net earnings from completed deliveries.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                <p className="text-[13px] text-[#565959] font-medium">Pending Payouts</p>
                <p className="text-3xl font-bold mt-1 text-[#c45500]">₹{parseFloat(data.pendingPayouts || 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-[#565959] mt-2">Awaiting administrator approval.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm border-t-4 border-t-[#FF9900]">
                <p className="text-[13px] text-[#565959] font-medium">Available to Withdraw</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">₹{parseFloat(data.availableBalance || 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-[#565959] mt-2">Cleared balance minus pending withdrawals.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Request Payout Form */}
              <div className="bg-white border border-gray-200 rounded shadow-sm p-5 self-start">
                <h3 className="text-[16px] font-bold text-[#0F1111] border-b border-gray-100 pb-3 mb-4">Request Payout</h3>
                
                {msg && (
                  <div className="mb-4 p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded">{msg}</div>
                )}
                {err && (
                  <div className="mb-4 p-3 bg-[#FFBABA] border border-[#D8000C] text-[#D8000C] text-[13px] rounded">{err}</div>
                )}

                {data.availableBalance <= 0 ? (
                  <p className="text-[13px] text-[#565959] text-center py-6">You have no available funds to withdraw at this time.</p>
                ) : (
                  <form onSubmit={handlePayoutSubmit} className="space-y-4">
                    {user?.bankDetails && user.bankDetails.accountNumber ? (
                      <div className="p-3 bg-[#F7F8F8] border border-gray-200 rounded text-[12px] space-y-1">
                        <div className="font-bold text-[#0F1111] mb-1 text-[13px]">Linked Bank Account</div>
                        <div><strong>Bank:</strong> {user.bankDetails.bankName}</div>
                        <div><strong>Acc #:</strong> •••• {user.bankDetails.accountNumber.slice(-4)}</div>
                        <div><strong>IFSC:</strong> {user.bankDetails.ifsc}</div>
                        <div><strong>Holder:</strong> {user.bankDetails.accountHolderName}</div>
                        <div className="pt-1.5">
                          <a href="/seller/bank-details" className="text-[#007185] hover:underline font-medium text-[12px]">
                            Change Bank Account ↗
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-[12px] text-red-700">
                        No bank account linked. Please{' '}
                        <a href="/seller/bank-details" className="underline font-bold">
                          link your bank account
                        </a>{' '}
                        first.
                      </div>
                    )}

                    <div>
                      <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Amount to Withdraw (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        max={data.availableBalance}
                        placeholder={`Max: ₹${parseFloat(data.availableBalance || 0).toLocaleString('en-IN')}`}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!user?.bankDetails?.accountNumber}
                      className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] py-2 rounded shadow-sm text-[13px] font-medium text-center transition-colors mt-2 disabled:opacity-50"
                    >
                      Submit Payout Request
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Ledger & Payout History */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ledger Table */}
                <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-[#F7F8F8]">
                    <h3 className="text-[15px] font-bold text-[#0F1111]">Ledger Transactions</h3>
                  </div>
                  {data.ledger.length === 0 ? (
                    <p className="text-center text-[#565959] py-12 text-[13px]">No ledger records found.</p>
                  ) : (
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="text-left text-[11px] text-[#565959] uppercase border-b border-gray-100 bg-gray-50/50">
                          <th className="px-5 py-3 font-medium">Date</th>
                          <th className="px-5 py-3 font-medium">Type</th>
                          <th className="px-5 py-3 font-medium">Reference Item</th>
                          <th className="px-5 py-3 font-medium">Rate</th>
                          <th className="px-5 py-3 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.ledger.map(log => {
                          const isNegative = parseFloat(log.amount) < 0;
                          return (
                            <tr key={log.id} className="hover:bg-[#F7F8F8]">
                              <td className="px-5 py-3 text-[#565959]">
                                {new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-5 py-3 font-medium capitalize">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  log.type === 'sale' ? 'bg-green-100 text-green-800' :
                                  log.type === 'commission' ? 'bg-orange-100 text-orange-800' :
                                  log.type === 'payout' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {log.type}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-[#565959]">
                                {log.orderItemId ? `Order Item #${log.orderItemId}` : '—'}
                              </td>
                              <td className="px-5 py-3 text-[#565959]">
                                {log.rateApplied != null
                                  ? <span className="bg-[#FFF3CD] text-[#856404] text-[11px] font-semibold px-1.5 py-0.5 rounded">
                                      {(parseFloat(log.rateApplied) * 100).toFixed(1)}%
                                    </span>
                                  : '—'}
                              </td>
                              <td className={`px-5 py-3 font-bold ${isNegative ? 'text-[#B12704]' : 'text-[#007600]'}`}>
                                {isNegative ? '-' : '+'}₹{Math.abs(parseFloat(log.amount)).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Payout Requests History */}
                <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-[#F7F8F8]">
                    <h3 className="text-[15px] font-bold text-[#0F1111]">Payout History</h3>
                  </div>
                  {data.payoutRequests.length === 0 ? (
                    <p className="text-center text-[#565959] py-12 text-[13px]">No payout requests submitted yet.</p>
                  ) : (
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="text-left text-[11px] text-[#565959] uppercase border-b border-gray-100 bg-gray-50/50">
                          <th className="px-5 py-3 font-medium">Date</th>
                          <th className="px-5 py-3 font-medium">Amount</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.payoutRequests.map(req => (
                          <tr key={req.id} className="hover:bg-[#F7F8F8]">
                            <td className="px-5 py-3 text-[#565959]">
                              {new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-3 font-bold text-gray-900">₹{parseFloat(req.amount).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {req.status.toUpperCase()}
                              </span>
                              {req.rejectionReason && (
                                <p className="text-[11px] text-[#CC0C39] mt-1 max-w-[200px] truncate" title={req.rejectionReason}>
                                  Reason: {req.rejectionReason}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
