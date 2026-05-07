import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coffee, CheckCircle, XCircle, Clock, Filter, RefreshCw, Utensils, Trash2 } from 'lucide-react';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/orders', getHeaders());
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (restaurantOrderId, newStatus) => {
    setActionLoading(restaurantOrderId);
    try {
      await axios.patch(`http://localhost:8080/api/orders/${restaurantOrderId}/status`, { status: newStatus }, getHeaders());
      setOrders(prev => prev.map(o => o.restaurantOrderId === restaurantOrderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order status", error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant order?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/orders/${id}`, getHeaders());
      alert('Restaurant order deleted successfully.');
      fetchOrders();
    } catch (err) {
      alert('Error deleting order: ' + (err.response?.data?.message || err.message));
    }
  };

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
        🏨 Room
      </span>
    );
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="flex items-center gap-2 m-0"><Coffee className="text-primary" /> Manage Orders</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="served">Served</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchOrders} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-8">Loading orders...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dining</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map((o) => (
                <tr key={o.restaurantOrderId} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>#{o.restaurantOrderId}</td>
                  <td style={{ padding: '1rem' }}>Guest #{o.customerId}</td>
                  <td style={{ padding: '1rem' }}>{getDiningBadge(o)}</td>
                  <td style={{ padding: '1rem' }}>{o.orderDate ? o.orderDate.substring(0, 10) : 'N/A'}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${(o.totalCost || 0).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(o.status)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      {o.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(o.restaurantOrderId, 'preparing')}
                            disabled={actionLoading === o.restaurantOrderId}
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(16,185,129,0.15)', color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.3)',
                              padding: '0.35rem 0.7rem', fontSize: '0.78rem',
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              borderRadius: '0.4rem', cursor: 'pointer',
                              opacity: actionLoading === o.restaurantOrderId ? 0.5 : 1,
                              transition: 'all 0.2s'
                            }}
                            title="Accept Order"
                          >
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(o.restaurantOrderId, 'rejected')}
                            disabled={actionLoading === o.restaurantOrderId}
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                              border: '1px solid rgba(239,68,68,0.3)',
                              padding: '0.35rem 0.7rem', fontSize: '0.78rem',
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              borderRadius: '0.4rem', cursor: 'pointer',
                              opacity: actionLoading === o.restaurantOrderId ? 0.5 : 1,
                              transition: 'all 0.2s'
                            }}
                            title="Reject Order"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {o.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate(o.restaurantOrderId, 'served')}
                          disabled={actionLoading === o.restaurantOrderId}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(139,92,246,0.15)', color: '#8b5cf6',
                            border: '1px solid rgba(139,92,246,0.3)',
                            padding: '0.35rem 0.7rem', fontSize: '0.78rem',
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            borderRadius: '0.4rem', cursor: 'pointer',
                            opacity: actionLoading === o.restaurantOrderId ? 0.5 : 1,
                            transition: 'all 0.2s'
                          }}
                          title="Mark as Served"
                        >
                          <Utensils size={14} /> Served
                        </button>
                      )}
                      {o.status === 'served' && (
                        <button
                          onClick={() => handleStatusUpdate(o.restaurantOrderId, 'completed')}
                          disabled={actionLoading === o.restaurantOrderId}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(16,185,129,0.15)', color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.3)',
                            padding: '0.35rem 0.7rem', fontSize: '0.78rem',
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            borderRadius: '0.4rem', cursor: 'pointer',
                            opacity: actionLoading === o.restaurantOrderId ? 0.5 : 1,
                            transition: 'all 0.2s'
                          }}
                          title="Customer Done — Release Table"
                        >
                          <CheckCircle size={14} /> Done Eating
                        </button>
                      )}
                      {(o.status === 'completed' || o.status === 'canceled' || o.status === 'rejected') && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          {o.status === 'completed' && o.diningLocation === 'cafeteria' ? '✅ Table released' : 'No actions available'}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(o.restaurantOrderId)}
                        style={{
                          background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '0.35rem 0.6rem', borderRadius: '0.4rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                          fontSize: '0.78rem', transition: 'all 0.2s'
                        }}
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No orders found{filter !== 'all' ? ` with status "${filter}"` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
