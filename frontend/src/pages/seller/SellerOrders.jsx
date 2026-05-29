import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import StatusBadge from '../../components/common/StatusBadge';

const TABS = ['all', 'pending', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrders() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [shipModal, setShipModal] = useState(null);
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/seller/orders')
      .then(r => {
        setItems(r.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const updateStatus = async (itemId, status, metadata = {}) => {
    try {
      await api.put(`/seller/orders/items/${itemId}/fulfillment`, { status, ...metadata });
      flash(`Item status updated to ${status}`);
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Status update failed');
    }
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    const cleanCarrier = carrier.trim();
    const cleanTracking = tracking.trim();

    if (!cleanCarrier || !cleanTracking) {
      alert('Please fill in both carrier and tracking number');
      return;
    }

    if (cleanCarrier.length < 2 || cleanCarrier.length > 50 || !/^[a-zA-Z0-9\s\.\-]+$/.test(cleanCarrier)) {
      alert('Carrier name must be between 2 and 50 characters and contain only alphanumeric characters, spaces, dots, or hyphens.');
      return;
    }

    if (cleanTracking.length < 5 || cleanTracking.length > 30 || !/^[a-zA-Z0-9]+$/.test(cleanTracking)) {
      alert('Tracking number must be alphanumeric (letters and numbers only) and between 5 and 30 characters.');
      return;
    }

    await updateStatus(shipModal.id, 'shipped', { carrierName: cleanCarrier, trackingNumber: cleanTracking });
    setShipModal(null);
    setCarrier('');
    setTracking('');
  };

  const filteredItems = items.filter(item => {
    if (tab === 'all') return true;
    return item.status === tab;
  });

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Seller Order Fulfillment</h1>
          <button onClick={load} className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline">Refresh</button>
        </div>

        {msg && (
          <div className="p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded shadow-sm">
            {msg}
          </div>
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

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF9900]" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-12 text-center">
            <p className="text-[14px] text-[#565959]">No orders found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => {
              const orderDate = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              const shipping = item.order?.shippingAddress || {};
              const itemTotal = parseFloat(item.priceAtPurchase) * item.quantity;

              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col md:flex-row">
                  {/* Left Col: Product & Order Details */}
                  <div className="p-5 flex-1 flex gap-4 border-r border-gray-100">
                    <img src={item.product?.imageUrl || 'https://via.placeholder.com/100'} alt={item.product?.name} className="w-20 h-20 object-contain border rounded p-1 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="text-[12px] text-[#565959] flex gap-3">
                        <span>Order Date: {orderDate}</span>
                        <span>|</span>
                        <span>Item ID: #{item.id}</span>
                      </div>
                      <h4 className="text-[14px] font-bold text-[#0F1111] hover:text-[#C7511F]">{item.product?.name}</h4>
                      {item.variantLabel && (
                        <p className="text-[12px] text-[#565959] font-medium">{item.variantLabel}</p>
                      )}
                      <div className="text-[13px] pt-1">
                        <span className="text-[#B12704] font-semibold">₹{parseFloat(item.priceAtPurchase).toLocaleString('en-IN')}</span>
                        <span className="text-gray-500 ml-1">x {item.quantity}</span>
                        <span className="font-bold ml-3 text-gray-900">Total: ₹{itemTotal.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Ship details if shipped */}
                      {(item.status === 'shipped' || item.status === 'delivered') && (
                        <div className="mt-3 p-2 bg-[#F7F8F8] border rounded text-[12px] text-[#565959] space-y-0.5">
                          <div><strong>Carrier:</strong> {item.carrierName}</div>
                          <div><strong>Tracking:</strong> {item.trackingNumber}</div>
                          {item.shippedAt && <div><strong>Shipped At:</strong> {new Date(item.shippedAt).toLocaleString()}</div>}
                          {item.deliveredAt && <div><strong>Delivered At:</strong> {new Date(item.deliveredAt).toLocaleString()}</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mid Col: Buyer & Shipping Address */}
                  <div className="p-5 md:w-64 border-r border-gray-100 flex flex-col justify-between bg-[#FDFDFD]">
                    <div className="text-[12px] text-[#565959] space-y-1">
                      <p className="font-bold text-[#0f1111] mb-1">Shipping Details</p>
                      <p className="text-[#0f1111] font-semibold">{shipping.name || item.order?.user?.name}</p>
                      <p>{shipping.addressLine1 || shipping.address || ''}</p>
                      {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                      <p>{shipping.city}, {shipping.state} - {shipping.zipCode || shipping.postalCode}</p>
                      <p>{shipping.country}</p>
                      {shipping.phone && <p>Ph: {shipping.phone}</p>}
                    </div>
                  </div>

                  {/* Right Col: Actions & Status */}
                  <div className="p-5 md:w-56 flex flex-col justify-between items-start md:items-end bg-gray-50/50">
                    <div className="mb-3">
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="w-full space-y-2 flex flex-col items-stretch md:items-end">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(item.id, 'packed')}
                            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-4 py-1.5 rounded shadow-sm text-[13px] font-medium text-center"
                          >
                            Mark as Packed
                          </button>
                          <button
                            onClick={() => {
                              if(confirm('Are you sure you want to cancel this item?')) {
                                updateStatus(item.id, 'cancelled');
                              }
                            }}
                            className="w-full text-center text-[12px] text-[#CC0C39] hover:underline mt-1"
                          >
                            Cancel Order Item
                          </button>
                        </>
                      )}

                      {item.status === 'packed' && (
                        <>
                          <button
                            onClick={() => setShipModal(item)}
                            className="w-full bg-[#FF9900] hover:bg-[#e68a00] text-white px-4 py-1.5 rounded shadow-sm text-[13px] font-semibold text-center"
                          >
                            Enter Shipping Info
                          </button>
                          <button
                            onClick={() => {
                              if(confirm('Are you sure you want to cancel this item?')) {
                                updateStatus(item.id, 'cancelled');
                              }
                            }}
                            className="w-full text-center text-[12px] text-[#CC0C39] hover:underline mt-1"
                          >
                            Cancel Order Item
                          </button>
                        </>
                      )}

                      {item.status === 'shipped' && (
                        <button
                          onClick={() => updateStatus(item.id, 'delivered')}
                          className="w-full bg-[#007600] hover:bg-[#006000] text-white px-4 py-1.5 rounded shadow-sm text-[13px] font-semibold text-center"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      <a
                        href={`${api.defaults.baseURL}/seller/orders/items/${item.id}/packingslip`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center block text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline font-medium pt-1"
                      >
                        📄 Packing Slip
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shipping details modal */}
      {shipModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form onSubmit={handleShipSubmit} className="bg-white border border-gray-300 rounded shadow-xl p-6 w-full max-w-sm space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#0F1111] mb-1">Enter Carrier & Tracking Details</h3>
              <p className="text-[12px] text-[#565959]">{shipModal.product?.name}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Carrier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHL, FedEx, BlueDart"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#0F1111] mb-1">Tracking Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234567890"
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShipModal(null)}
                className="text-[13px] text-[#565959] border border-gray-300 px-4 py-1.5 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[13px] font-medium px-4 py-1.5 rounded"
              >
                Ship Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
