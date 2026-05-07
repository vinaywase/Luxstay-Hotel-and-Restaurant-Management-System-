import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, X, Pencil, Trash2 } from 'lucide-react';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', position: '', hireDate: '', username: '', password: '', role: 'STAFF'
  });
  const [errors, setErrors] = useState({});

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/staff', getHeaders());
      setStaff(response.data || []);
    } catch (error) {
      console.error("Error fetching staff", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', position: '', hireDate: new Date().toISOString().substring(0, 10), username: '', password: '', role: 'STAFF' });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingStaff(s);
    setForm({
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      email: s.email || '',
      phoneNumber: s.phoneNumber || '',
      position: s.position || '',
      hireDate: s.hireDate ? s.hireDate.substring(0, 10) : '',
      username: '',
      password: '',
      role: s.role || 'STAFF'
    });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', position: '', hireDate: '', username: '', password: '', role: 'STAFF' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    if (!form.position) newErrors.position = 'Position is required';
    if (!form.hireDate) newErrors.hireDate = 'Hire date is required';
    if (!form.role) newErrors.role = 'Role is required';

    if (!editingStaff) {
      if (!form.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (form.username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters';
      }
      
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editingStaff) {
        await axios.put(`http://localhost:8080/api/staff/${editingStaff.staffId}`, payload, getHeaders());
      } else {
        await axios.post('http://localhost:8080/api/staff', payload, getHeaders());
      }
      closeModal();
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff", error);
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save staff member.';
      alert(typeof msg === 'string' ? msg : 'Failed to save staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/staff/${staffId}`, getHeaders());
      alert('Staff member deleted successfully.');
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff", error);
      alert('Failed to delete staff member: ' + (error.response?.data?.message || error.message));
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--border)', background: 'var(--background)',
    color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s',
    borderColor: 'var(--border)'
  };

  const errorStyle = {
    color: 'var(--danger)',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    display: 'block'
  };

  const positions = ['Manager', 'Receptionist', 'Chef', 'Waiter', 'Housekeeping', 'Bartender', 'Security', 'Valet', 'Concierge', 'Event Coordinator'];

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="flex items-center gap-2 m-0"><Users className="text-primary" /> Staff & System Access</h2>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Add New Account
        </button>
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-8">Loading staff directory...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hire Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? staff.map((s) => (
                <tr key={s.staffId} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{s.staffId}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{s.firstName} {s.lastName}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: 'rgba(79,70,229,0.12)', color: 'var(--primary)',
                      border: '1px solid rgba(79,70,229,0.25)',
                      padding: '0.2rem 0.65rem', borderRadius: '0.35rem',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>{s.position}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: s.role === 'ADMIN' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', 
                      color: s.role === 'ADMIN' ? '#ef4444' : '#22c55e',
                      border: s.role === 'ADMIN' ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(34,197,94,0.25)',
                      padding: '0.2rem 0.65rem', borderRadius: '0.35rem',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>{s.role}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{s.email}</td>
                  <td style={{ padding: '1rem' }}>{s.phoneNumber}</td>
                  <td style={{ padding: '1rem' }}>{s.hireDate ? s.hireDate.substring(0, 10) : 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        style={{
                          background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                          border: '1px solid rgba(59,130,246,0.3)',
                          padding: '0.35rem 0.6rem', borderRadius: '0.4rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                          fontSize: '0.78rem', transition: 'all 0.2s'
                        }}
                        title="Edit"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.staffId)}
                        style={{
                          background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '0.35rem 0.6rem', borderRadius: '0.4rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                          fontSize: '0.78rem', transition: 'all 0.2s'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No staff members found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Staff Modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.2s ease'
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: '1rem',
            padding: '2rem', width: '100%', maxWidth: '520px',
            maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease'
          }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingStaff ? 'Edit Account' : 'Add New Account'}
              </h3>
              <button onClick={closeModal} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '0.25rem'
              }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" style={{...inputStyle, borderColor: errors.firstName ? 'var(--danger)' : 'var(--border)'}} required />
                  {errors.firstName && <span style={errorStyle}>{errors.firstName}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" style={{...inputStyle, borderColor: errors.lastName ? 'var(--danger)' : 'var(--border)'}} required />
                  {errors.lastName && <span style={errorStyle}>{errors.lastName}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@staff.com" style={{...inputStyle, borderColor: errors.email ? 'var(--danger)' : 'var(--border)'}} required disabled={!!editingStaff} />
                {errors.email && <span style={errorStyle}>{errors.email}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Phone Number *</label>
                  <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="1234567890" style={{...inputStyle, borderColor: errors.phoneNumber ? 'var(--danger)' : 'var(--border)'}} required disabled={!!editingStaff} />
                  {errors.phoneNumber && <span style={errorStyle}>{errors.phoneNumber}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Position *</label>
                  <select name="position" value={form.position} onChange={handleChange} style={{...inputStyle, borderColor: errors.position ? 'var(--danger)' : 'var(--border)'}} required>
                    <option value="">Select Position</option>
                    {positions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.position && <span style={errorStyle}>{errors.position}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Hire Date *</label>
                <input name="hireDate" type="date" value={form.hireDate} onChange={handleChange} style={{...inputStyle, borderColor: errors.hireDate ? 'var(--danger)' : 'var(--border)'}} required />
                {errors.hireDate && <span style={errorStyle}>{errors.hireDate}</span>}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>System Role *</label>
                <select name="role" value={form.role} onChange={handleChange} style={{...inputStyle, borderColor: errors.role ? 'var(--danger)' : 'var(--border)'}} required>
                  <option value="STAFF">Staff (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
                {errors.role && <span style={errorStyle}>{errors.role}</span>}
              </div>

              {!editingStaff && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Username *</label>
                    <input name="username" value={form.username} onChange={handleChange} placeholder="staff_user" style={{...inputStyle, borderColor: errors.username ? 'var(--danger)' : 'var(--border)'}} required />
                    {errors.username && <span style={errorStyle}>{errors.username}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password *</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="********" style={{...inputStyle, borderColor: errors.password ? 'var(--danger)' : 'var(--border)'}} required />
                    {errors.password && <span style={errorStyle}>{errors.password}</span>}
                  </div>
                </div>
              )}

              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} className="btn" style={{
                  background: 'var(--surface-hover)', color: 'var(--text-main)',
                  border: '1px solid var(--border)', padding: '0.6rem 1.5rem'
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '0.6rem 1.5rem' }}>
                  {submitting ? 'Saving...' : (editingStaff ? 'Update Account' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default StaffList;
