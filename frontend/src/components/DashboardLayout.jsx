import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { Hotel, LogOut, LayoutDashboard, Calendar, Users, Bed, Utensils, Coffee, ClipboardList, Globe, DollarSign, Shield, Bell, Star } from 'lucide-react';

const DashboardLayout = ({ allowedRoles }) => {
  const role = localStorage.getItem('role');
  const [userName, setUserName] = useState(() => {
    let storedName = localStorage.getItem('userName');
    return (storedName === 'undefined' || storedName === 'null') ? null : storedName;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncName = () => {
      let storedName = localStorage.getItem('userName');
      if (storedName === 'undefined' || storedName === 'null') storedName = null;
      setUserName(storedName);
    };
    syncName();
    // Also listen for potential manual updates in the same window
    window.addEventListener('storage-update', syncName);
    return () => window.removeEventListener('storage-update', syncName);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  if (!role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('customerId');
    navigate('/home');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand"><Hotel /><span>LuxeStay</span></div>
        </div>

        <nav className="flex-col gap-2" style={{ flex: 1 }}>
          <Link to={`/${role.toLowerCase()}`} className={`nav-link ${isActive(`/${role.toLowerCase()}`) ? 'active' : ''}`}><LayoutDashboard size={20} /> Dashboard</Link>

          {role === 'CUSTOMER' && (
            <>
              <Link to="/customer/bookings" className={`nav-link ${isActive('/customer/bookings') ? 'active' : ''}`}><Calendar size={20} /> My Bookings</Link>
              <Link to="/customer/place-order" className={`nav-link ${isActive('/customer/place-order') ? 'active' : ''}`}><Utensils size={20} /> Place Order</Link>
              <Link to="/customer/orders" className={`nav-link ${isActive('/customer/orders') ? 'active' : ''}`}><Coffee size={20} /> Orders</Link>
              <Link to="/customer/services" className={`nav-link ${isActive('/customer/services') ? 'active' : ''}`}><Bell size={20} /> Service Requests</Link>
              <Link to="/customer/my-events" className={`nav-link ${isActive('/customer/my-events') ? 'active' : ''}`}><Calendar size={20} /> My Events</Link>
              <Link to="/customer/bills" className={`nav-link ${isActive('/customer/bills') ? 'active' : ''}`}><DollarSign size={20} /> Bills</Link>
              {/* ✅ NEW: Feedback link for Customer */}
              <Link to="/customer/feedback" className={`nav-link ${isActive('/customer/feedback') ? 'active' : ''}`}><Star size={20} /> Feedback</Link>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <Link to="/admin/reservations" className={`nav-link ${isActive('/admin/reservations') ? 'active' : ''}`}><Calendar size={20} /> Reservations</Link>
              <Link to="/admin/rooms" className={`nav-link ${isActive('/admin/rooms') ? 'active' : ''}`}><Bed size={20} /> Manage Rooms</Link>
              <Link to="/admin/menu" className={`nav-link ${isActive('/admin/menu') ? 'active' : ''}`}><Utensils size={20} /> Manage Menu</Link>
              <Link to="/admin/customers" className={`nav-link ${isActive('/admin/customers') ? 'active' : ''}`}><Users size={20} /> Customers</Link>
              <Link to="/admin/staff" className={`nav-link ${isActive('/admin/staff') ? 'active' : ''}`}><ClipboardList size={20} /> Staff & System Access</Link>
              <Link to="/admin/events" className={`nav-link ${isActive('/admin/events') ? 'active' : ''}`}><Calendar size={20} /> Events Management</Link>
              <Link to="/admin/service-packages" className={`nav-link ${isActive('/admin/service-packages') ? 'active' : ''}`}><Shield size={20} /> Event Packages</Link>
              <Link to="/admin/event-staff" className={`nav-link ${isActive('/admin/event-staff') ? 'active' : ''}`}><Users size={20} /> Event Staff</Link>
              <Link to="/admin/refunds" className={`nav-link ${isActive('/admin/refunds') ? 'active' : ''}`}><DollarSign size={20} /> Event Refunds</Link>
              <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders') ? 'active' : ''}`}><Coffee size={20} /> Manage Orders</Link>
              <Link to="/admin/billing" className={`nav-link ${isActive('/admin/billing') ? 'active' : ''}`}><DollarSign size={20} /> Billing</Link>
              <Link to="/admin/services" className={`nav-link ${isActive('/admin/services') ? 'active' : ''}`}><Bell size={20} /> Service Requests</Link>

              {/* ✅ NEW: Feedback link for Admin */}
              <Link to="/admin/feedback" className={`nav-link ${isActive('/admin/feedback') ? 'active' : ''}`}><Star size={20} /> Feedback</Link>
            </>
          )}

          {role === 'STAFF' && (
            <>
              <Link to="/staff/reservations" className={`nav-link ${isActive('/staff/reservations') ? 'active' : ''}`}><Calendar size={20} /> Reservations</Link>
              <Link to="/staff/orders" className={`nav-link ${isActive('/staff/orders') ? 'active' : ''}`}><Coffee size={20} /> Manage Orders</Link>
              <Link to="/staff/rooms" className={`nav-link ${isActive('/staff/rooms') ? 'active' : ''}`}><Bed size={20} /> Manage Rooms</Link>
              <Link to="/staff/menu" className={`nav-link ${isActive('/staff/menu') ? 'active' : ''}`}><Utensils size={20} /> Manage Menu</Link>
              <Link to="/staff/billing" className={`nav-link ${isActive('/staff/billing') ? 'active' : ''}`}><DollarSign size={20} /> Billing</Link>
              <Link to="/staff/services" className={`nav-link ${isActive('/staff/services') ? 'active' : ''}`}><Bell size={20} /> Service Requests</Link>
              <Link to="/staff/event-tasks" className={`nav-link ${isActive('/staff/event-tasks') ? 'active' : ''}`}><ClipboardList size={20} /> Event Tasks</Link>

              {/* ✅ NEW: Feedback link for Staff */}
              <Link to="/staff/feedback" className={`nav-link ${isActive('/staff/feedback') ? 'active' : ''}`}><Star size={20} /> Feedback</Link>
            </>
          )}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
          <Link to="/home" className="nav-link"><Globe size={20} /> View Website</Link>
          <button onClick={handleLogout} className="btn btn-ghost w-full justify-start" style={{ color: 'var(--danger)' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar card mb-6 p-4 rounded-xl flex justify-between glass">
          <h3>Welcome, {userName || (role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Guest')}!</h3>
          <div className="flex items-center gap-4">
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
              {(userName || role || 'G').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="animate-fade-in flex-col" style={{ flex: 1 }}><Outlet /></div>
      </div>
    </div>
  );
};

export default DashboardLayout;
