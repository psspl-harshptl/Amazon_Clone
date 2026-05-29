import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SellerNavbar from '../../components/seller/SellerNavbar';
import { useAuth } from '../../context/AuthContext';

const PREDEFINED_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Union Bank of India',
  'Canara Bank',
  'Yes Bank',
  'IDFC First Bank',
  'Bank of India',
  'Central Bank of India',
  'Indian Bank',
  'UCO Bank'
];

export default function LinkBankAccount() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Load existing bank details if any
  useEffect(() => {
    if (user?.bankDetails) {
      setBankName(user.bankDetails.bankName || '');
      setAccountNumber(user.bankDetails.accountNumber || '');
      setConfirmAccountNumber(user.bankDetails.accountNumber || '');
      setIfsc(user.bankDetails.ifsc || '');
      setAccountHolderName(user.bankDetails.accountHolderName || '');
    }
  }, [user]);

  const hasLinkedBank = user?.bankDetails?.accountNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    // Predefined list check warning or suggestion fallback
    if (!bankName.trim()) {
      return setErr('Bank name is required');
    }

    // Account number validation
    const cleanAcc = accountNumber.trim();
    if (!/^\d{9,18}$/.test(cleanAcc)) {
      return setErr('Account number must be between 9 and 18 digits (numbers only)');
    }

    if (cleanAcc !== confirmAccountNumber.trim()) {
      return setErr('Account numbers do not match');
    }

    // IFSC validation
    const cleanIfsc = ifsc.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      return setErr('Invalid IFSC code format (e.g., HDFC0001234)');
    }

    // Holder name validation
    const cleanHolderName = accountHolderName.trim();
    if (cleanHolderName.length < 3) {
      return setErr('Account holder name must be at least 3 characters');
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanHolderName)) {
      return setErr('Account holder name must contain only letters and spaces');
    }

    setLoading(true);
    try {
      const response = await api.put('/seller/bank-details', {
        bankName: bankName.trim(),
        accountNumber: cleanAcc,
        ifsc: cleanIfsc,
        accountHolderName: cleanHolderName
      });

      // Update AuthContext user state so the blocking redirect turns off
      const updatedUser = {
        ...user,
        bankDetails: response.data.data.bankDetails
      };
      login(updatedUser);

      setMsg('Bank details linked successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 1500);
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to link bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <SellerNavbar />
      <div className="max-w-md mx-auto px-4 py-10">
        
        {/* Blocker alert if they haven't linked their bank account yet */}
        {!hasLinkedBank && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 text-[13px] rounded shadow-sm">
            <h4 className="font-bold text-[14px] mb-1">⚠️ Action Required: Link Bank Account</h4>
            <p className="leading-relaxed">
              Your seller account is approved, but you must link a bank account before accessing Seller Central dashboards. This account will be used directly for all payout withdrawals.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
          <h1 className="text-[21px] font-bold text-[#0F1111] mb-2">
            {hasLinkedBank ? 'Linked Bank Account' : 'Link Your Bank Account'}
          </h1>
          <p className="text-[13px] text-[#565959] mb-5">
            Provide a valid bank account for receiving direct payout withdrawals in Rupees (₹).
          </p>

          {msg && (
            <div className="mb-4 p-3 bg-[#DFF2BF] border border-[#4F8A10] text-[#4F8A10] text-[13px] rounded">
              {msg}
            </div>
          )}
          {err && (
            <div className="mb-4 p-3 bg-[#FFBABA] border border-[#D8000C] text-[#D8000C] text-[13px] rounded">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Bank Name autocomplete field */}
            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">
                Bank Name
              </label>
              <input
                type="text"
                list="indian-banks"
                required
                placeholder="Type or select your bank..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
              />
              <datalist id="indian-banks">
                {PREDEFINED_BANKS.map((bank) => (
                  <option key={bank} value={bank} />
                ))}
              </datalist>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">
                Account Number
              </label>
              <input
                type="text"
                required
                pattern="\d*"
                placeholder="9-18 digits"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">
                Confirm Account Number
              </label>
              <input
                type="password"
                required
                pattern="\d*"
                placeholder="Re-enter account number"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-[13px] font-bold text-[#0F1111] mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SBIN0001234"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] uppercase"
              />
              <p className="text-[11px] text-[#565959] mt-0.5">
                Must be an 11-digit code starting with 4 letters, then a 0, followed by 6 alphanumeric characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] py-2 rounded shadow-sm text-sm font-medium transition-all disabled:opacity-60 text-center"
            >
              {loading ? 'Linking Account...' : hasLinkedBank ? 'Update Linked Account' : 'Link Account & Proceed'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
