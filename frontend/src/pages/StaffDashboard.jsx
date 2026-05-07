import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Bell } from 'lucide-react';
import axios from 'axios';

const StaffDashboard = () => {
  const [data, setData] = useState({
    pendingRequests: [],
    todayArrivals: [],
    completedTasks: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        const [requestsRes, reservationsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/service-requests', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/reservations', { headers }).catch(() => ({ data: [] }))
        ]);

        const requests = requestsRes.data || [];
        const reservations = reservationsRes.data || [];

        setData({
          pendingRequests: requests.filter(r => r.status !== 'Completed'),
          todayArrivals: reservations, // Can filter by date if needed
          completedTasks: requests.filter(r => r.status === 'Completed').length
        });
      } catch (error) {
        console.error("Failed to fetch staff data", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Staff Workspace</h2>
        <button className="btn btn-primary">Check-in Guest</button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Bell /></div>
          <div className="stat-info">
            <h4>Pending Requests</h4>
            <p>{data.pendingRequests.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar /></div>
          <div className="stat-info">
            <h4>Total Reservations</h4>
            <p>{data.todayArrivals.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-secondary bg-opacity-20 text-secondary"><CheckCircle /></div>
          <div className="stat-info">
            <h4>Tasks Completed</h4>
            <p>{data.completedTasks}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid mt-8">
        <div className="card w-full">
          <h3 className="mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Service Requests</h3>
          {data.pendingRequests.length > 0 ? data.pendingRequests.map((req, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-surface-hover rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <Clock className="text-text-muted" size={20} />
                <div>
                  <p className="m-0 font-medium text-text-main">Customer #{req.customerId} — {req.requestType || 'Service Request'}</p>
                  <p className="text-xs m-0 text-text-muted">{req.requestDate ? new Date(req.requestDate).toLocaleString() : 'N/A'} • Status: {req.status}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${req.status === 'completed' ? 'bg-secondary bg-opacity-20 text-secondary' : 'bg-primary bg-opacity-20 text-primary'}`} style={{ textTransform: 'capitalize' }}>{req.status}</span>
            </div>
          )) : (
            <p className="text-text-muted">No pending requests found.</p>
          )}
        </div>

        <div className="card w-full">
          <h3 className="mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Reservations</h3>
          <ul style={{ listStyle: 'none' }}>
            {data.todayArrivals.length > 0 ? data.todayArrivals.slice(0, 5).map((res, idx) => (
              <li key={idx} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span>Guest ID: {res.customerId || 'N/A'}</span>
                <span className="font-bold">Room {res.roomId || 'N/A'}</span>
              </li>
            )) : (
              <li className="py-2 text-text-muted">No reservations found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
