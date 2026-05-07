import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X, User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

const WebsiteLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  let userName = localStorage.getItem('userName');
  if (userName === 'undefined' || userName === 'null') userName = null;
  const isLoggedIn = !!token && !!role;

  const dashboardPath = role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/staff' : '/customer';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('customerId');
    setProfileOpen(false);
    navigate('/home');
  };

  return (
    <div className="website-wrapper">
      <nav className="website-nav glass">
        <div className="nav-container">
          <Link to="/home" className="nav-brand">
            <Hotel size={28} />
            <span>LuxeStay</span>
          </Link>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <Link to="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/rooms" className={`nav-item ${isActive('/rooms') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Rooms</Link>
            <Link to="/menu" className={`nav-item ${isActive('/menu') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Menu</Link>
            <Link to="/services" className={`nav-item ${isActive('/services') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Services</Link>
            <Link to="/event-booking" className={`nav-item ${isActive('/event-booking') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Plan Event</Link>
            <Link to="/booking" className={`nav-item ${isActive('/booking') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Booking</Link>
            <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contact</Link>
          </div>

          <div className="nav-right">
            {isLoggedIn ? (
              <div className="profile-dropdown-wrapper">
                <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                  <div className="profile-avatar">
                    {(userName || role || 'G').charAt(0).toUpperCase()}
                  </div>
                  <span className="profile-role">{userName || (role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Guest')}</span>
                  <ChevronDown size={16} className={`profile-chevron ${profileOpen ? 'rotated' : ''}`} />
                </button>

                {profileOpen && (
                  <>
                    <div className="profile-backdrop" onClick={() => setProfileOpen(false)} />
                    <div className="profile-dropdown animate-fade-in">
                      <div className="profile-dropdown-header">
                        <div className="profile-avatar-lg">{(userName || role || 'G').charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{userName || (role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Guest')}</strong>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Guest'}</p>
                        </div>
                      </div>
                      <div className="profile-dropdown-divider" />
                      <Link to={dashboardPath} className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard size={16} /> My Dashboard
                      </Link>
                      <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            )}
            <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="website-main">
        <Outlet />
      </main>

      <footer className="website-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="nav-brand mb-4"><Hotel size={24} /><span>LuxeStay</span></div>
              <p>Experience the art of luxury living with our world-class hotel and restaurant.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <Link to="/rooms">Rooms & Suites</Link>
              <Link to="/menu">Restaurant Menu</Link>
              <Link to="/booking">Book a Room</Link>
              <Link to="/services">Our Services</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Guest Login</Link>
              <a href="#">Privacy Policy</a>
            </div>
            <div className="footer-col">
              <h4>Contact Info</h4>
              <p>123 Luxury Avenue</p>
              <p>Paradise City, PC 10001</p>
              <p>+1 (555) 123-4567</p>
              <p>info@luxestay.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 LuxeStay Hotel & Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;