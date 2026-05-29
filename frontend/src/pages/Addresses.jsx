import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // null for create, ID for edit
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      fullName: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditId(addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault
    });
    setFormError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      if (editId) {
        // Edit address
        const res = await api.put(`/addresses/${editId}`, formData);
        if (res.data.success) {
          showToast('Address updated successfully!');
          setShowModal(false);
          fetchAddresses();
        }
      } else {
        // Create address
        const res = await api.post('/addresses', formData);
        if (res.data.success) {
          showToast('Address saved successfully!');
          setShowModal(false);
          fetchAddresses();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/addresses/${id}`);
      if (res.data.success) {
        showToast('Address deleted successfully!');
        fetchAddresses();
      }
    } catch (err) {
      setError('Failed to delete address.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/addresses/${id}/set-default`);
      if (res.data.success) {
        showToast('Default address updated!');
        fetchAddresses();
      }
    } catch (err) {
      setError('Failed to update default address.');
    }
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="bg-[#EAEDED] min-h-screen py-8 pb-20">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-[12px] text-[#565959] mb-4">
          <Link to="/profile" className="hover:underline text-[#007185]">Your Account</Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-[#C7511F] font-medium">Your Addresses</span>
        </div>

        <h1 className="text-[28px] font-medium text-[#0F1111] mb-6">Your Addresses</h1>

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium shadow-sm animate-fade-in flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e77600] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Add Address Card */}
            <div 
              onClick={handleOpenCreate}
              className="border-2 border-dashed border-[#D5D9D9] hover:border-gray-400 bg-white rounded-lg p-6 flex flex-col justify-center items-center text-center cursor-pointer min-h-[260px] group transition-colors shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-gray-100 transition-colors">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <h3 className="text-[17px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Add Address</h3>
            </div>

            {/* Address Cards */}
            {addresses.map(addr => (
              <div 
                key={addr.id}
                className={`bg-white border rounded-lg flex flex-col justify-between shadow-sm min-h-[260px]
                  ${addr.isDefault ? 'border-[#E47911] ring-1 ring-[#E47911]' : 'border-[#D5D9D9]'}`}
              >
                {/* Header default banner */}
                {addr.isDefault && (
                  <div className="bg-[#FCF5EE] border-b border-[#E47911] px-5 py-2 text-xs font-bold text-gray-500 rounded-t-lg">
                    Default
                  </div>
                )}

                {/* Body info */}
                <div className="p-5 flex-grow space-y-1.5 text-[13px] text-gray-800">
                  <p className="font-bold text-[15px] text-[#0F1111]">{addr.fullName}</p>
                  <p>{addr.streetAddress}</p>
                  <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p>{addr.country}</p>
                  <p className="pt-2 text-gray-600">Phone: <span className="font-semibold text-gray-800">{addr.phone}</span></p>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 border-t border-gray-100 flex gap-4 text-xs font-medium text-[#007185]">
                  <button onClick={() => handleOpenEdit(addr)} className="hover:underline hover:text-[#C7511F]">Edit</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDelete(addr.id)} className="hover:underline hover:text-[#C7511F]">Remove</button>
                  {!addr.isDefault && (
                    <>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => handleSetDefault(addr.id)} className="hover:underline hover:text-[#C7511F]">Set as Default</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Backdrop & Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="bg-[#F0F2F2] px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
              <h2 className="text-lg font-bold text-[#0F1111]">
                {editId ? 'Edit Address' : 'Add a new address'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-[13px]">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-bold text-[#0F1111] mb-1">Full name (First and Last name)</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block font-bold text-[#0F1111] mb-1">Mobile number</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number without prefixes"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  required
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block font-bold text-[#0F1111] mb-1">Flat, House no., Building, Company, Apartment / Street address</label>
                <textarea 
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Town/City */}
                <div>
                  <label className="block font-bold text-[#0F1111] mb-1">Town/City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block font-bold text-[#0F1111] mb-1">State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* PIN Code */}
                <div>
                  <label className="block font-bold text-[#0F1111] mb-1">PIN code</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                    required
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block font-bold text-[#0F1111] mb-1">Country/Region</label>
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              {/* Set Default Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-[#e77600]"
                />
                <label htmlFor="isDefault" className="font-medium text-[#0F1111] cursor-pointer">Make this my default address</label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-white border border-[#D5D9D9] hover:bg-gray-50 rounded-lg font-medium shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg font-medium shadow-sm disabled:opacity-50 transition-colors"
                >
                  {formSubmitting ? 'Saving...' : 'Add address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
