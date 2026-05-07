import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Trash2, Edit2, X } from 'lucide-react';

const API = 'http://localhost:8080/api';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '', loyaltyPoints: 0 });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchCustomers = () => axios.get(`${API}/customers`, getHeaders()).then(r => setCustomers(r.data || [])).catch(() => { });
  useEffect(() => { fetchCustomers(); }, []);

  const resetForm = () => { setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '', loyaltyPoints: 0 }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/customers/${editing}`, form, getHeaders()); }
      else { await axios.post(`${API}/customers`, form, getHeaders()); }
      fetchCustomers(); resetForm();
    } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await axios.delete(`${API}/customers/${id}`, getHeaders());
      alert('Customer deleted successfully.');
      fetchCustomers();
    } catch (err) { alert('Error deleting customer: ' + (err.response?.data?.message || err.message)); }
  };

  const handleEdit = (c) => {
    setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phoneNumber: c.phoneNumber, address: c.address, loyaltyPoints: c.loyaltyPoints });
    setEditing(c.customerId); setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 m-0"><Users className="text-primary" /> Manage Customers</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> Add Customer</button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0">{editing ? 'Edit Customer' : 'Add New Customer'}</h3>
            <button className="btn btn-ghost" onClick={resetForm}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>First Name</label><input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="form-group"><label>Last Name</label><input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input required value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="form-group"><label>Loyalty Points</label><input type="number" value={form.loyaltyPoints} onChange={e => setForm({ ...form, loyaltyPoints: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Customer'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Phone</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Points</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{c.customerId}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: '1rem' }}>{c.email}</td>
                  <td style={{ padding: '1rem' }}>{c.phoneNumber}</td>
                  <td style={{ padding: '1rem' }}><span className="status-badge status-blue">{c.loyaltyPoints}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(c.customerId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageCustomers;
