import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Search, Filter, RefreshCw, Trash2, Calendar as CalendarIcon, User } from 'lucide-react';

const API = 'http://localhost:8080/api';

const ManageBilling = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchData = async () => {
    setLoading(true);
    const [billRes, payRes] = await Promise.all([
      axios.get(`${API}/bills`, getHeaders()).catch(() => ({ data: [] })),
      axios.get(`${API}/payments`, getHeaders()).catch(() => ({ data: [] })),
    ]);
    setBills(billRes.data || []);
    setPayments(payRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getPaymentsForBill = (billId) => payments.filter(p => p.billId === billId);
  
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billId.toString().includes(searchTerm) || 
                         (bill.customerName && bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || bill.serviceType?.toLowerCase() === filterType.toLowerCase();
    const matchesDate = !filterDate || (bill.billDate && bill.billDate.startsWith(filterDate));
    return matchesSearch && matchesType && matchesDate;
  });

  const totalRevenue = payments.reduce((s, p) => s + (parseFloat(p.amountPaid) || 0), 0);
  const pendingBills = bills.filter(b => b.paymentStatus === 'pending').length;

  const handleMarkPaid = async (bill) => {
    try {
      await axios.put(`${API}/bills/${bill.billId}`, { ...bill, paymentStatus: 'paid' }, getHeaders());
      fetchData();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await axios.delete(`${API}/bills/${id}`, getHeaders());
      alert('Bill deleted successfully.');
      fetchData();
    } catch (err) {
      alert('Error deleting bill: ' + (err.response?.data?.message || err.message));
    }
  };

  const getReferenceId = (bill) => {
    if (bill.bookingId || bill.reservationId) return `#BOOK-${bill.bookingId || bill.reservationId}`;
    if (bill.orderId) return `#ORD-${bill.orderId}`;
    if (bill.serviceRequestId) return `#SVC-${bill.serviceRequestId}`;
    if (bill.eventBookingId || bill.eventId) return `#EVT-${bill.eventBookingId || bill.eventId}`;
    return '—';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 m-0 text-2xl font-bold"><DollarSign className="text-primary" /> Billing & Payments</h2>
        <button className="btn btn-secondary flex items-center gap-2" onClick={fetchData}><RefreshCw size={18} /> Refresh</button>
      </div>

      <div className="dashboard-grid mb-6">
        <div className="stat-card"><div className="stat-icon bg-secondary bg-opacity-20 text-secondary"><DollarSign /></div><div className="stat-info"><h4>Total Revenue</h4><p>${totalRevenue.toFixed(2)}</p></div></div>
        <div className="stat-card"><div className="stat-icon bg-primary bg-opacity-20 text-primary"><DollarSign /></div><div className="stat-info"><h4>Total Bills</h4><p>{bills.length}</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><DollarSign /></div><div className="stat-info"><h4>Pending</h4><p>{pendingBills}</p></div></div>
      </div>

      <div className="card mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by Bill ID or Customer..." 
              className="form-control w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-text-muted" />
            <select 
              className="form-control flex-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Service Types</option>
              <option value="room">Room Booking</option>
              <option value="order">Restaurant Order</option>
              <option value="service">Service Request</option>
              <option value="event">Event Booking</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-text-muted" />
            <input 
              type="date" 
              className="form-control flex-1"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted">
          <RefreshCw className="animate-spin mb-4 inline-block" size={48} />
          <p>Loading billing records...</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <h3 className="p-4 m-0 border-b" style={{ borderColor: 'var(--border)' }}>Billing Ledger</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Bill ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Customer</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Service</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Reference ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Payments</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr></thead>
              <tbody>
                {filteredBills.length > 0 ? filteredBills.map((b, idx) => {
                  const billPayments = getPaymentsForBill(b.billId);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-surface-hover">
                      <td style={{ padding: '1rem', fontWeight: 600 }}>#BILL-{b.billId}</td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-text-muted" />
                          <span>{b.customerName || `Guest #${b.customerId}`}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="status-badge status-blue" style={{ fontSize: '0.7rem' }}>{b.serviceType || 'Room'}</span>
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{getReferenceId(b)}</td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>${(b.totalAmount || 0).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>{b.billDate ? new Date(b.billDate).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status-badge ${b.paymentStatus === 'paid' ? 'status-green' : 'status-yellow'}`}>{b.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {billPayments.length > 0 ? billPayments.map((p, i) => (
                          <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ${p.amountPaid.toFixed(2)} via <span style={{ textTransform: 'capitalize' }}>{(p.paymentMethod || '').replace('_', ' ')}</span>
                          </div>
                        )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No payment</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex gap-2">
                          {b.paymentStatus === 'pending' && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleMarkPaid(b)}>Mark Paid</button>
                          )}
                          <button
                            className="btn btn-sm"
                            style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                            onClick={() => handleDelete(b.billId)}
                            title="Delete Bill"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bills found matching your criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBilling;
