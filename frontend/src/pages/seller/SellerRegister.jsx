import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function SellerRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await api.post('/auth/seller/register', { name: form.name, email: form.email, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center pt-8">
        <Link to="/">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="w-28 mb-6" />
        </Link>
        <div className="w-full max-w-[350px] p-6 border border-gray-300 rounded-lg shadow-sm text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-[21px] font-normal text-[#0F1111] mb-2">Application Submitted</h2>
          <p className="text-[13px] text-[#565959] leading-snug mb-5">
            Your seller account is under review. You'll be able to sign in once an admin approves your application.
          </p>
          <Link
            to="/seller/login"
            className="w-full block text-center bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] py-2 rounded shadow-sm text-sm font-medium transition-all"
          >
            Go to Seller Sign-In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 pb-10">
      <Link to="/">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="w-28 mb-6" />
      </Link>

      <div className="w-full max-w-[350px] p-6 border border-gray-300 rounded-lg shadow-sm">
        <h1 className="text-[24px] font-normal mb-1 text-[#0F1111]">Become a Seller</h1>
        <p className="text-[13px] text-[#565959] mb-4">Your account will be reviewed before activation</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#CC0C39] text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Your name', field: 'name', type: 'text' },
            { label: 'Email', field: 'email', type: 'email' },
            { label: 'Password', field: 'password', type: 'password', hint: 'At least 8 characters' },
            { label: 'Re-enter password', field: 'confirm', type: 'password' },
          ].map(({ label, field, type, hint }) => (
            <div key={field}>
              <label className="block text-[13px] font-bold mb-1 text-[#0F1111]">{label}</label>
              {hint && <p className="text-[11px] text-[#565959] mb-1">{hint}</p>}
              <input
                type={type} value={form[field]} onChange={set(field)} required
                className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none text-[13px]"
              />
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] py-2 rounded shadow-sm text-sm font-medium transition-all disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p className="text-[12px] mt-4 leading-snug text-gray-600">
          By creating an account, you agree to Amazon's{' '}
          <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and{' '}
          <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
        </p>
      </div>

      <div className="mt-6 w-full max-w-[350px] text-center">
        <span className="text-[13px] text-[#565959]">Already have a seller account? </span>
        <Link to="/seller/login" className="text-[13px] text-[#0066c0] hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
