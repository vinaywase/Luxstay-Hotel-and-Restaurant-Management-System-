import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, Trash2 } from 'lucide-react';

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ customerId: 1, requestType: 'Room Cleaning', status: 'pending' });
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/service-requests', getHeaders());
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching service requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customerId: parseInt(formData.customerId),
        requestType: formData.requestType,
        requestDate: new Date().toISOString(),
        status: formData.status
      };
      await axios.post('http://localhost:8080/api/service-requests', payload, getHeaders());
      setShowForm(false);
      setFormData({ customerId: 1, requestType: 'Room Cleaning', status: 'pending' });
      fetchRequests();
    } catch (err) {
      console.error("Failed to create request", err);
      alert('Failed to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/service-requests/${id}`, getHeaders());
      alert('Service request deleted successfully.');
      fetchRequests();
    } catch (err) {
      console.error("Failed to delete", err);
      alert('Failed to delete request.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
      case 'pending': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
      case 'in-progress': return { bg: 'rgba(79,70,229,0.15)', color: '#4F46E5' };
      default: return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
    }
  };

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="flex items-center gap-2 m-0"><Bell className="text-primary" /> Service Requests (Admin)</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-6 rounded-lg" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Create Service Request</h3>
          <div className="form-row mb-4">
            <div>
              <label className="block mb-2 font-medium">Customer ID</label>
              <input type="number" min="1" value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2 font-medium">Request Type</label>
              <select value={formData.requestType} onChange={e => setFormData({ ...formData, requestType: e.target.value })}>
                {['Room Cleaning', 'Extra Towels', 'Extra Pillows', 'Room Service', 'Maintenance', 'Wake Up Call', 'Taxi Booking', 'Luggage Assistance', 'Laundry Service', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-text-muted py-8">Loading requests...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Customer</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Request Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map((r, idx) => {
                const sc = getStatusStyle(r.status);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>#{r.serviceRequestId}</td>
                    <td style={{ padding: '1rem' }}>Customer #{r.customerId}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{r.requestType}</td>
                    <td style={{ padding: '1rem' }}>{r.requestDate ? new Date(r.requestDate).toLocaleString() : 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleDelete(r.serviceRequestId)} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No service requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServiceRequests;
