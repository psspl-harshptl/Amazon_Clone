import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 🚀 REAL LOGIN FLOW
      const res = await api.post('/auth/login', { email, password });

      if (res.data.success) {
        const { user, token } = res.data;
        localStorage.setItem('amazon_token', token);
        login(user);
        if (user.role === 'super_admin') navigate('/admin/dashboard');
        else if (user.role === 'seller') navigate('/seller/dashboard');
        else navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err);
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
        <h1 className="text-3xl font-normal mb-4 text-[#0F1111]">Sign in</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#CC0C39] text-xs rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold mb-1 text-[#0F1111]">Email or mobile phone number</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
              required
            />
          </div>
          <div>
            <label className="flex justify-between text-[13px] font-bold mb-1 text-[#0F1111]">
              Password
              <span className="text-[#0066c0] font-normal hover:underline cursor-pointer">Forgot Password?</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] py-2 rounded shadow-sm text-sm font-medium transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-[12px] mt-4 leading-snug text-gray-600">
          By continuing, you agree to Amazon's <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
        </p>
      </div>
      <div className="mt-6 w-full max-w-[350px]">
        <div className="relative flex items-center justify-center mb-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-500">New to Amazon?</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <Link to="/register" className="w-full block text-center bg-[#F0F2F2] hover:bg-[#E3E6E6] border border-gray-300 py-1.5 rounded shadow-sm text-sm font-medium transition-all">
          Create your Amazon account
        </Link>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Want to sell?{' '}
          <Link to="/seller/register" className="text-[#0066c0] hover:underline font-medium">Apply as a Seller</Link>
          {' · '}
          <Link to="/seller/login" className="text-[#0066c0] hover:underline">Seller Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;