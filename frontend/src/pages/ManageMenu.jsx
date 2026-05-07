import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, Plus, Trash2, Edit2, X } from 'lucide-react';

const API = 'http://localhost:8080/api';

const ManageMenu = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Main Course', availability: true });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchItems = () => axios.get(`${API}/food-items`, getHeaders()).then(r => setItems(r.data || [])).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => { setForm({ name: '', description: '', price: '', category: 'Main Course', availability: true }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/food-items/${editing}`, form, getHeaders()); }
      else { await axios.post(`${API}/food-items`, form, getHeaders()); }
      fetchItems(); resetForm();
    } catch (err) { alert('Error saving item: ' + (err.response?.data?.message || err.response?.data || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { 
      await axios.delete(`${API}/food-items/${id}`, getHeaders()); 
      alert('Menu item deleted successfully.');
      fetchItems(); 
    } catch (err) { alert('Error deleting item: ' + (err.response?.data?.message || err.message)); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, availability: item.availability });
    setEditing(item.foodItemId); setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 m-0"><Utensils className="text-primary" /> Manage Menu</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> Add Item</button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0">{editing ? 'Edit Item' : 'Add New Menu Item'}</h3>
            <button className="btn btn-ghost" onClick={resetForm}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dish name" /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Main Course</option><option>Appetizer</option><option>Dessert</option><option>Beverage</option><option>Soup</option><option>Salad</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description</label><textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" /></div>
            <div className="form-row">
              <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              <div className="form-group"><label>Available</label>
                <select value={form.availability} onChange={e => setForm({...form, availability: e.target.value === 'true'})}>
                  <option value="true">Yes</option><option value="false">No</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editing ? 'Update Item' : 'Add Item'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Price</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Available</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{i.name}</td>
                  <td style={{ padding: '1rem' }}><span className="status-badge status-blue">{i.category}</span></td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>${i.price}</td>
                  <td style={{ padding: '1rem' }}><span className={`status-badge ${i.availability ? 'status-green' : 'status-red'}`}>{i.availability ? 'Yes' : 'No'}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(i)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(i.foodItemId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageMenu;
