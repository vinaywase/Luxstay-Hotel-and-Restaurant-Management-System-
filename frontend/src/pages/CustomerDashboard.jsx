import React, { useState, useEffect } from 'react';
import { Bed, Utensils, Star, Clock, User, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    bookings: [],
    orders: [],
    loyaltyPoints: 0
  });
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const customerId = localStorage.getItem('customerId');
        const headers = { Authorization: `Bearer ${token}` };

        if (!customerId) {
          console.error("No customerId found in localStorage");
          return;
        }

        const [reservationsRes, ordersRes, customerRes] = await Promise.all([
          axios.get('http://localhost:8080/api/reservations', { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/orders/customer/${customerId}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/customers/${customerId}`, { headers }).catch(() => ({ data: {} }))
        ]);

        const allReservations = reservationsRes.data || [];
        const customerOrders = (ordersRes.data || []).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        const customer = customerRes.data || { loyaltyPoints: 0 };

        console.log("Customer ID:", customerId);
        console.log("Fetched Orders:", customerOrders);
        console.log("Fetched Customer:", customer);

        const myReservations = allReservations
          .filter(r => r.customerId === parseInt(customerId))
          .sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
        
        setCurrentCustomer(customer);
        if (customer.firstName) {
          localStorage.setItem('userName', customer.firstName);
          window.dispatchEvent(new Event('storage-update'));
        }

        setData({
          bookings: myReservations,
          orders: customerOrders,
          loyaltyPoints: customer.loyaltyPoints || 0
        });
      } catch (error) {
        console.error("Failed to fetch customer data", error);
      }
    };

    fetchData();
  }, []);

  const handleOpenProfile = () => {
    if (currentCustomer) {
      setProfileForm({
        firstName: currentCustomer.firstName || '',
        lastName: currentCustomer.lastName || '',
        email: currentCustomer.email || '',
        phoneNumber: currentCustomer.phoneNumber || '',
        address: currentCustomer.address || ''
      });
    }
    setProfileError('');
    setProfileSuccess('');
    setShowProfileModal(true);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email || !profileForm.phoneNumber) {
      setProfileError('Please fill in all required fields.');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.put(
        `http://localhost:8080/api/customers/${currentCustomer.customerId}`,
        profileForm,
        { headers }
      );
      setCurrentCustomer(res.data);
      localStorage.setItem('userName', res.data.firstName);
      window.dispatchEvent(new Event('storage-update'));
      setProfileSuccess('Profile successfully updated!');
      setTimeout(() => setShowProfileModal(false), 1500);
    } catch (error) {
      if (error.response?.data?.message) {
        setProfileError(error.response.data.message);
      } else {
        setProfileError('Update failed. Please try again.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2>My Dashboard</h2>
        <div className="flex gap-3">
          <button
            className="btn btn-secondary flex items-center gap-2"
            onClick={handleOpenProfile}
          >
            <User size={16} />
            Update Profile
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/booking')}>
            Book a Room
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon"><Bed /></div>
          <div className="stat-info">
            <h4>Total Bookings</h4>
            <p>{data.bookings.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Utensils /></div>
          <div className="stat-info">
            <h4>Restaurant Orders</h4>
            <p>{data.orders.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Star /></div>
          <div className="stat-info">
            <h4>Loyalty Points</h4>
            <p>{data.loyaltyPoints}</p>
          </div>
        </div>
      </div>

      {/* Stays & Orders */}
      <div className="dashboard-grid mt-8">
        <div className="card w-full" style={{ gridColumn: 'span 2' }}>
          <h3 className="mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Stays</h3>
          {data.bookings.length > 0 ? data.bookings.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-surface-hover rounded-lg mb-2">
              <div className="flex items-center gap-4">
                <div className="bg-primary bg-opacity-20 p-3 rounded text-primary">
                  <Bed />
                </div>
                <div>
                  <h4 className="m-0">Room {b.roomId || 'N/A'}</h4>
                  <p className="text-sm m-0">Check-in: {b.checkInDate ? b.checkInDate.substring(0, 10) : ''}</p>
                </div>
              </div>
              <span className="bg-secondary bg-opacity-20 text-secondary px-3 py-1 rounded text-sm font-semibold">
                {b.status || 'Confirmed'}
              </span>
            </div>
          )) : (
            <p className="text-text-muted">No recent stays found.</p>
          )}
        </div>

        <div className="card w-full">
          <h3 className="mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Recent Orders</h3>
          {data.orders.length > 0 ? data.orders.slice(0, 3).map((o, idx) => (
            <div key={idx} className="flex gap-3 mb-3">
              <Clock className="text-text-muted mt-1" size={16} />
              <div>
                <p className="m-0 font-medium text-text-main">Order #{o.restaurantOrderId}</p>
                <p className="text-xs m-0">{o.orderDate || 'Recently'}</p>
              </div>
            </div>
          )) : (
            <p className="text-text-muted">No recent orders.</p>
          )}
        </div>
      </div>

      {/* Update Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="card w-full max-w-md p-6 relative">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0">Update Profile</h3>
              <button onClick={() => setShowProfileModal(false)}
                className="text-text-muted hover:text-text-main">
                <X size={20} />
              </button>
            </div>

            {/* Error / Success Messages */}
            {profileError && (
              <div className="mb-4 p-3 rounded text-sm"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 p-3 rounded text-sm"
                style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                {profileSuccess}
              </div>
            )}

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="input w-full"
                    placeholder="First Name"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="input w-full"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="input w-full"
                  placeholder="Email"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                  className="input w-full"
                  placeholder="Phone Number"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Address</label>
                <textarea
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  className="input w-full"
                  placeholder="Address"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="btn btn-secondary"
                onClick={() => setShowProfileModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleProfileSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;