import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function SellerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, token } = res.data;
        if (user.role !== 'seller') {
          setError('This portal is for sellers only.');
          return;
        }
        sessionStorage.setItem('amazon_token', token);
        login(user);
        navigate('/seller/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8">
      <Link to="/">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="w-28 mb-6" />
      </Link>

      <div className="w-full max-w-[350px] p-6 border border-gray-300 rounded-lg shadow-sm">
        <h1 className="text-[24px] font-normal mb-1 text-[#0F1111]">Seller Sign-In</h1>
        <p className="text-[13px] text-[#565959] mb-4">Access your Seller Central account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#CC0C39] text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold mb-1 text-[#0F1111]">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold mb-1 text-[#0F1111]">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none text-[13px]"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] py-2 rounded shadow-sm text-sm font-medium transition-all disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-[12px] mt-4 leading-snug text-gray-600">
          By continuing, you agree to Amazon's{' '}
          <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and{' '}
          <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
        </p>
      </div>

      <div className="mt-6 w-full max-w-[350px]">
        <div className="relative flex items-center justify-center mb-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="flex-shrink mx-4 text-xs text-gray-500">New seller?</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
        <Link
          to="/seller/register"
          className="w-full block text-center bg-[#F0F2F2] hover:bg-[#E3E6E6] border border-gray-300 py-1.5 rounded shadow-sm text-sm font-medium transition-all"
        >
          Apply to become a seller
        </Link>
      </div>

      <p className="text-xs text-[#565959] mt-5">
        <Link to="/login" className="text-[#0066c0] hover:underline">Back to buyer sign-in</Link>
      </p>
    </div>
  );
}
