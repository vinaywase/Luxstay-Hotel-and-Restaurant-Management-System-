import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bed, Plus, Trash2, Edit2, X } from 'lucide-react';

const API = 'http://localhost:8080/api';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', roomType: 'Standard', pricePerNight: '', status: 'available', capacity: 2 });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchRooms = () => axios.get(`${API}/rooms`, getHeaders()).then(r => setRooms(r.data || [])).catch(() => {});
  useEffect(() => { fetchRooms(); }, []);

  const resetForm = () => { setForm({ roomNumber: '', roomType: 'Standard', pricePerNight: '', status: 'available', capacity: 2 }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/rooms/${editing}`, form, getHeaders());
      } else {
        await axios.post(`${API}/rooms`, form, getHeaders());
      }
      fetchRooms();
      resetForm();
    } catch (err) { alert('Error saving room: ' + (err.response?.data?.message || err.response?.data || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try { 
      await axios.delete(`${API}/rooms/${id}`, getHeaders()); 
      alert('Room deleted successfully.');
      fetchRooms(); 
    } catch (err) { alert('Error deleting room: ' + (err.response?.data?.message || err.message)); }
  };

  const handleEdit = (room) => {
    setForm({ roomNumber: room.roomNumber, roomType: room.roomType, pricePerNight: room.pricePerNight, status: room.status, capacity: room.capacity });
    setEditing(room.roomId);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 m-0"><Bed className="text-primary" /> Manage Rooms</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> Add Room</button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0">{editing ? 'Edit Room' : 'Add New Room'}</h3>
            <button className="btn btn-ghost" onClick={resetForm}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Room Number</label><input required value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} placeholder="e.g. 101" /></div>
              <div className="form-group"><label>Room Type</label>
                <select value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})}>
                  <option>Standard</option><option>Deluxe</option><option>Suite</option><option>Presidential</option><option>Single</option><option>Double</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Price Per Night ($)</label><input type="number" step="0.01" required value={form.pricePerNight} onChange={e => setForm({...form, pricePerNight: e.target.value})} /></div>
              <div className="form-group"><label>Capacity</label><input type="number" required value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option></select>
            </div>
            <button type="submit" className="btn btn-primary">{editing ? 'Update Room' : 'Add Room'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Room #</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Type</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Price/Night</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Capacity</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {rooms.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{r.roomNumber}</td>
                  <td style={{ padding: '1rem' }}>{r.roomType}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>${r.pricePerNight}</td>
                  <td style={{ padding: '1rem' }}>{r.capacity}</td>
                  <td style={{ padding: '1rem' }}><span className={`status-badge ${r.status === 'available' ? 'status-green' : 'status-red'}`}>{r.status}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(r)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(r.roomId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No rooms found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRooms;
