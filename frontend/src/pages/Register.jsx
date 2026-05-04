import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (res.data.success) {
        localStorage.setItem('amazon_token', res.data.token);
        login(res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 pb-12">
      {/* Logo */}
      <Link to="/" className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tighter text-[#0F1111] flex items-center">
          AmazonClone<span className="text-[#FF9900] text-4xl">.</span>
        </h1>
      </Link>

      {/* Register Card */}
      <div className="w-full max-w-[350px] border border-gray-300 rounded-lg p-6 mb-5">
        <h2 className="text-3xl font-normal mb-4 text-[#0F1111]">Create Account</h2>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0F1111] mb-1">Your name</label>
            <input
              type="text"
              name="name"
              placeholder="First and last name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0F1111] mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0F1111] mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600] text-sm"
              required
              minLength={6}
            />
            <p className="text-[11px] text-[#555] mt-1 italic">
              <span className="text-[#0066c0] font-bold">i</span> Passwords must be at least 6 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0F1111] mb-1">Re-enter password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600] text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f0c14b] hover:bg-[#edb021] border border-[#a88734] rounded-sm py-1.5 text-sm font-normal text-[#111] shadow-inner"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <p className="text-[12px] text-[#111] mt-5 leading-tight">
          By creating an account, you agree to AmazonClone's{' '}
          <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a> and{' '}
          <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice</a>.
        </p>

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-1">
          <p className="text-[13px] text-[#111]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-[13px] text-[#111]">
            Buying for work?{' '}
            <a href="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
              Create a free business account
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t border-gray-100 bg-gray-50 pt-8 flex flex-col items-center mt-auto">
        <div className="flex space-x-8 mb-4">
          <a href="#" className="text-xs text-[#0066c0] hover:underline">Conditions of Use</a>
          <a href="#" className="text-xs text-[#0066c0] hover:underline">Privacy Notice</a>
          <a href="#" className="text-xs text-[#0066c0] hover:underline">Help</a>
        </div>
        <p className="text-[11px] text-[#555]">© 1996-2024, AmazonClone.com, Inc. or its affiliates</p>
      </div>
    </div>
  );
};

export default Register;