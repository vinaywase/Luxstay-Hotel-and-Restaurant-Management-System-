import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, XCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';

const API = 'http://localhost:8080/api';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchData = async () => {
    setLoading(true);
    const [resRes, roomRes] = await Promise.all([
      axios.get(`${API}/reservations`, getHeaders()).catch(() => ({ data: [] })),
      axios.get(`${API}/rooms`, getHeaders()).catch(() => ({ data: [] })),
    ]);
    setReservations(resRes.data || []);
    setRooms(roomRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getRoomInfo = (roomId) => rooms.find(r => r.roomId === roomId);

  const handleStatusUpdate = async (res, newStatus) => {
    try {
      await axios.put(`${API}/reservations/${res.reservationId}`, { ...res, status: newStatus }, getHeaders());
      fetchData();
    } catch (err) {
      alert('Error updating: ' + (err.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await axios.delete(`${API}/reservations/${id}`, getHeaders());
      alert('Reservation deleted successfully.');
      fetchData();
    } catch (err) {
      alert('Error deleting reservation: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);
  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 m-0">
          <Calendar className="text-primary" /> Reservations
          {pendingCount > 0 && <span className="status-badge status-red" style={{ fontSize: '0.8rem' }}>{pendingCount} pending</span>}
        </h2>
        <button className="btn btn-secondary" onClick={fetchData}><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="filter-bar" style={{ justifyContent: 'flex-start' }}>
        {['all', 'pending', 'booked', 'checked-in', 'checked-out', 'canceled'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      {loading ? <p className="text-text-muted text-center mt-8">Loading reservations...</p> : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Guest</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Room</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Check-in</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Check-out</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>In Time</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Out Time</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cost</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const room = getRoomInfo(r.roomId);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: r.status === 'pending' ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                      <td style={{ padding: '1rem' }}>#RES-{r.reservationId}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>Guest #{r.customerId}</td>
                      <td style={{ padding: '1rem' }}>{room ? `${room.roomNumber} (${room.roomType})` : `Room ${r.roomId}`}</td>
                      <td style={{ padding: '1rem' }}>{r.checkInDate}</td>
                      <td style={{ padding: '1rem' }}>{r.checkOutDate}</td>
                      <td style={{ padding: '1rem' }}>
                        {r.checkInTime ? <span style={{ color: 'var(--secondary)', fontWeight: 500 }}>{r.checkInTime.substring(0, 5)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {r.checkOutTime ? <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{r.checkOutTime.substring(0, 5)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>${r.totalCost}</td>
                      <td style={{ padding: '1rem' }}><span className="status-badge status-blue" style={{ fontSize: '0.7rem' }}>{r.bookingType || 'Full Day'}</span></td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status-badge ${r.status === 'pending' ? 'status-yellow' : r.status === 'booked' || r.status === 'checked-in' ? 'status-green' : r.status === 'canceled' ? 'status-red' : 'status-blue'}`}>
                          {r.status === 'pending' && <Clock size={12} />} {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex gap-2">
                          {r.status === 'pending' && (
                            <>
                              <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--secondary)', border: '1px solid rgba(16,185,129,0.3)' }} onClick={() => handleStatusUpdate(r, 'booked')} title="Accept">
                                <CheckCircle size={14} /> Accept
                              </button>
                              <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }} onClick={() => handleStatusUpdate(r, 'canceled')} title="Reject">
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                          {r.status === 'booked' && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(r, 'checked-in')}>Check In</button>
                          )}
                          {r.status === 'checked-in' && (
                            <button className="btn btn-sm btn-secondary" onClick={() => handleStatusUpdate(r, 'checked-out')}>Check Out</button>
                          )}
                          <button className="btn btn-sm" style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(r.reservationId)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan="11" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No reservations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservations;
