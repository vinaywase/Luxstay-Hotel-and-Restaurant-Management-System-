import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API = 'http://localhost:8080/api';
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/reservations`, getHeaders());
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id, booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.put(`${API}/reservations/${id}`, { ...booking, status: 'canceled' }, getHeaders());
      alert("Booking cancelled successfully.");
      fetchBookings();
    } catch (error) {
      alert("Error cancelling booking: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    console.log("Attempting to delete reservation with ID:", id);
    if (!window.confirm("Are you sure you want to permanently delete this booking record?")) return;
    try {
      await axios.delete(`${API}/reservations/${id}`, getHeaders());
      alert("Booking record deleted successfully.");
      fetchBookings();
    } catch (error) {
      alert("Error deleting booking: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="flex items-center gap-2 m-0"><Calendar className="text-primary" /> Booking Directory</h2>
        <button className="btn btn-primary" onClick={() => navigate('/booking')}>New Booking</button>
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-8">Loading bookings...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Reservation ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Guest ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Room ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Check In</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Check Out</th>
                 <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Total Cost</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? bookings.map((b) => (
                <tr key={b.reservationId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>#RES-{b.reservationId}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>Guest #{b.customerId}</td>
                  <td style={{ padding: '1rem' }}>Room {b.roomId}</td>
                  <td style={{ padding: '1rem' }}>{b.checkInDate ? b.checkInDate.substring(0, 10) : 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{b.checkOutDate ? b.checkOutDate.substring(0, 10) : 'N/A'}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${(b.totalCost || 0).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}><span className="status-badge status-blue" style={{ fontSize: '0.7rem' }}>{b.bookingType || 'Full Day'}</span></td>
                  <td style={{ padding: '1rem' }}><span className={`bg-secondary bg-opacity-20 text-secondary px-2 py-1 rounded text-xs text-transform-capitalize ${b.status === 'canceled' ? 'bg-red-100 text-red-600' : ''}`}>{b.status}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                      {b.status !== 'canceled' && b.status !== 'checked-out' && (
                        <button 
                          className="btn btn-sm" 
                          style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '6px' }} 
                          onClick={() => handleCancel(b.reservationId, b)} 
                          title="Cancel Booking"
                        >
                          <XCircle size={18} style={{ pointerEvents: 'none' }} />
                        </button>
                      )}
                      <button 
                        className="btn btn-sm" 
                        style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px' }} 
                        onClick={() => handleDelete(b.reservationId)} 
                        title="Delete Record"
                      >
                        <Trash2 size={18} style={{ pointerEvents: 'none' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingList;
