import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    activeGuests: 0,
    occupancyRate: 85,
    newBookings: 0,
    transactions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        // Fetch real data from the Spring Boot database endpoints
        const [customersRes, paymentsRes, reservationsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/customers', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/payments', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/reservations', { headers }).catch(() => ({ data: [] }))
        ]);

        const customers = customersRes.data || [];
        const payments = paymentsRes.data || [];
        const reservations = reservationsRes.data || [];

        const totalRevenue = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        
        setStats({
          revenue: totalRevenue || 0,
          activeGuests: customers.length,
          occupancyRate: Math.min(100, 50 + (reservations.length * 2)), // Mock calculation
          newBookings: reservations.length,
          transactions: payments.slice(0, 5) // Get latest 5
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Admin Overview</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary">Generate Report</button>
          <button className="btn btn-primary">Add Staff</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon bg-secondary bg-opacity-20 text-secondary"><DollarSign /></div>
          <div className="stat-info">
            <h4>Total Revenue</h4>
            <p>${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users /></div>
          <div className="stat-info">
            <h4>Total Customers</h4>
            <p>{stats.activeGuests}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><Activity /></div>
          <div className="stat-info">
            <h4>Occupancy Rate</h4>
            <p>{stats.occupancyRate}%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><TrendingUp /></div>
          <div className="stat-info">
            <h4>Total Bookings</h4>
            <p>{stats.newBookings}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 card">
        <h3 className="mb-4">Recent Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Transaction ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Payment Method</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.transactions.length > 0 ? stats.transactions.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>#TRX-{t.paymentId || (1000 + idx)}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{(t.paymentMethod || 'Credit Card').replace('_', ' ')}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${(t.amountPaid || 0).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}><span className="text-secondary">{t.paymentStatus || 'Completed'}</span></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No transactions found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
