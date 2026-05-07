import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Search, Filter, RefreshCw, FileText, Download } from 'lucide-react';

const API = 'http://localhost:8080/api';

const CustomerBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const customerId = localStorage.getItem('customerId');
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bills/customer/${customerId}`, getHeaders());
      setBills(response.data || []);
    } catch (error) {
      console.error("Error fetching bills", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Receipt download function — only this will added, rest of the code is same as before
  const downloadReceipt = async (billId) => {
    try {
      const response = await axios.get(`${API}/bills/${billId}/receipt`, getHeaders());
      const receipt = response.data;

      const html = `
        <html>
          <head>
            <title>Receipt - BILL-${receipt.billId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 600px; margin: auto; }
              .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
              .header h1 { margin: 0; color: #2563eb; font-size: 1.8rem; }
              .header h2 { margin: 4px 0 0; color: #555; font-size: 1rem; font-weight: normal; }
              .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; }
              .total { font-size: 1.4rem; font-weight: bold; color: #2563eb; margin-top: 24px; text-align: right; }
              .status { display: inline-block; padding: 4px 14px; background: #dcfce7; color: #16a34a; border-radius: 20px; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 0.85rem; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏨 LuxeStay</h1>
              <h2>Official Payment Receipt</h2>
            </div>
            <div class="row"><span class="label">Bill ID</span><span class="value">#BILL-${receipt.billId}</span></div>
            <div class="row"><span class="label">Customer Name</span><span class="value">${receipt.customerName || 'N/A'}</span></div>
            <div class="row"><span class="label">Service Type</span><span class="value">${receipt.serviceType || 'General'}</span></div>
            <div class="row"><span class="label">Reference ID</span><span class="value">#${receipt.referenceId || 'N/A'}</span></div>
            <div class="row"><span class="label">Date</span><span class="value">${receipt.billDate ? new Date(receipt.billDate).toLocaleDateString() : 'N/A'}</span></div>
            <div class="row"><span class="label">Payment Status</span><span class="value"><span class="status">${receipt.paymentStatus}</span></span></div>
            <div class="total">Total Paid: $${Number(receipt.totalAmount || 0).toFixed(2)}</div>
            <div class="footer">Thank you for choosing LuxeStay! 🙏</div>
          </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-BILL-${billId}.html`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Receipt download failed", error);
      alert("Receipt download failed. Please try again.");
    }
  };

  useEffect(() => {
    if (customerId) fetchBills();
  }, [customerId]);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billId.toString().includes(searchTerm) || 
                         (bill.serviceType && bill.serviceType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || bill.serviceType?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getReferenceId = (bill) => {
    if (bill.bookingId) return `#BOOK-${bill.bookingId}`;
    if (bill.orderId) return `#ORD-${bill.orderId}`;
    if (bill.serviceRequestId) return `#SVC-${bill.serviceRequestId}`;
    if (bill.eventBookingId) return `#EVT-${bill.eventBookingId}`;
    return 'N/A';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="flex items-center gap-2 m-0 text-2xl font-bold"><DollarSign className="text-primary" /> My Bills</h2>
          <p className="text-text-muted m-0">View and track all your payment receipts</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2" onClick={fetchBills}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="card mb-6 p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by Bill ID or Service..." 
            className="form-control w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-text-muted" />
          <select 
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Services</option>
            <option value="room">Room Booking</option>
            <option value="order">Restaurant Order</option>
            <option value="service">Service Request</option>
            <option value="event">Event Booking</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <RefreshCw className="animate-spin mb-4" size={48} />
          <p>Loading your bills...</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bill ID</th>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Service Type</th>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reference ID</th>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Amount Paid</th>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? filteredBills.map((bill) => (
                  <tr key={bill.billId} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-surface-hover">
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>#BILL-{bill.billId}</td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        {bill.serviceType || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {getReferenceId(bill)}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>
                      {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                      ${(bill.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span className={`status-badge ${bill.paymentStatus === 'paid' ? 'status-green' : 'status-yellow'}`} style={{ textTransform: 'capitalize' }}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                      {/* ✅ FIXED: onClick added*/}
                      <button 
                        className="btn btn-sm btn-ghost text-primary" 
                        title="Download Receipt"
                        onClick={() => downloadReceipt(bill.billId)}
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div className="flex flex-col items-center">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No bills found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBills;