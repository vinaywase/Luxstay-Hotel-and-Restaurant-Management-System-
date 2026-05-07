import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coffee, Utensils, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = 'http://localhost:8080/api';
  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, getHeaders());
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.patch(`${API}/orders/${id}/status`, { status: 'canceled' }, getHeaders());
      alert("Order cancelled successfully.");
      fetchOrders();
    } catch (error) {
      alert("Error cancelling order: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteOrder = async (id) => {
    console.log("delete id" + id);
    // if (!window.confirm("Are you sure you want to delete this order history record?")) return;
    try {
      await axios.delete(`${API}/orders/${id}`, getHeaders());
      alert("Order record deleted successfully.");
      fetchOrders();
    } catch (error) {
      alert("Error deleting order: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' },
      preparing: { background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' },
      served: { background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' },
      completed: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' },
      canceled: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
      rejected: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ ...s, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', display: 'inline-block' }}>
        {status}
      </span>
    );
  };

  const getDiningBadge = (order) => {
    if (order.diningLocation === 'cafeteria') {
      return (
        <span style={{
          background: 'rgba(16,185,129,0.12)', color: '#10b981',
          border: '1px solid rgba(16,185,129,0.3)',
          padding: '0.2rem 0.6rem', borderRadius: '0.35rem',
          fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex',
          alignItems: 'center', gap: '0.3rem'
        }}>
          <Utensils size={12} /> Table {order.restaurantTableId || '—'}
        </span>
      );
    }
    return (
      <span style={{
        background: 'rgba(79,70,229,0.12)', color: '#4f46e5',
        border: '1px solid rgba(79,70,229,0.3)',
        padding: '0.2rem 0.6rem', borderRadius: '0.35rem',
        fontSize: '0.75rem', fontWeight: 600
      }}>
        🏨 In Room
      </span>
    );
  };

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="flex items-center gap-2 m-0"><Coffee className="text-primary" /> Order History</h2>
        <button className="btn btn-primary" onClick={() => navigate('/customer/place-order')}>New Order</button>
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-8">Loading orders...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dining</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((o, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>#{o.restaurantOrderId}</td>
                  <td style={{ padding: '1rem' }}>{getDiningBadge(o)}</td>
                  <td style={{ padding: '1rem' }}>{o.orderDate ? o.orderDate.substring(0, 10) : 'N/A'}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${(o.totalCost || 0).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(o.status)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                      {o.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--warning)', padding: '4px' }} onClick={() => handleCancelOrder(o.restaurantOrderId)} title="Cancel Order">
                          <XCircle size={18} style={{ pointerEvents: 'none' }} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px' }} onClick={() => handleDeleteOrder(o.restaurantOrderId)} title="Delete Record">
                        <Trash2 size={18} style={{ pointerEvents: 'none' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;
