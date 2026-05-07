import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const StaffServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const updateStatus = async (req, newStatus) => {
    try {
      const payload = {
        customerId: req.customerId,
        staffId: req.staffId,
        requestType: req.requestType,
        requestDate: req.requestDate,
        status: newStatus
      };
      await axios.put(`http://localhost:8080/api/service-requests/${req.serviceRequestId}`, payload, getHeaders());
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      alert('Failed to update. Please try again.');
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
        <h2 className="flex items-center gap-2 m-0"><Bell className="text-primary" /> Manage Service Requests</h2>
      </div>

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
                      <div className="flex gap-2">
                        {r.status?.toLowerCase() !== 'completed' && (
                          <button
                            onClick={() => updateStatus(r, 'completed')}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        {r.status?.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => updateStatus(r, 'in-progress')}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            In Progress
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(r.serviceRequestId)}
                        className="btn btn-sm"
                        style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginTop: '0.5rem' }}
                        title="Delete Request"
                      >
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

export default StaffServiceRequests;
