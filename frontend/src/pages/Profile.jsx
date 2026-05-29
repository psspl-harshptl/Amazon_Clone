import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || 'India',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        ...user
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { confirmPassword: _ignored, ...payload } = formData;
      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        login(res.data.data); // Update global user state
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error('Profile Update Error:', err.response?.data);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EAEDED] min-h-screen py-10">
      <div className="max-w-[1000px] mx-auto px-4">
        <h1 className="text-3xl font-medium mb-6">Your Account Settings</h1>

        {/* Dashboard Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/addresses" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 flex items-start gap-4 transition-colors">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#E47911] flex-shrink-0 animate-fade-in">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-[#0F1111] text-[17px] mb-1">Your Addresses</h3>
              <p className="text-gray-500 text-xs leading-normal">Edit, remove or set default addresses for your orders and deliveries.</p>
            </div>
          </Link>
          <Link to="/wishlist" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 flex items-start gap-4 transition-colors">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#E47911] flex-shrink-0 animate-fade-in">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-[#0F1111] text-[17px] mb-1">Your Wish List</h3>
              <p className="text-gray-500 text-xs leading-normal">View items you've saved to your list, move them to cart or remove them.</p>
            </div>
          </Link>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* Section 1: Basic Details */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-2">Login & Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Details */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-2">Shipping Address</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">State / Province / Region</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Password Update */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-2">Update Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Current Password (Required for changes)</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-[#0F1111]">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
