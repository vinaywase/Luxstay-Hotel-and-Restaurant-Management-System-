import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Hotel, User, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      const { token, role, customerId, staffId, name } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      if (name) {
        localStorage.setItem('userName', name);
        window.dispatchEvent(new Event('storage-update'));
      }
      if (customerId) localStorage.setItem('customerId', customerId);
      if (staffId) localStorage.setItem('staffId', staffId);

      // Check if user was trying to book before login
      const redirect = localStorage.getItem('redirectAfterLogin');
      if (redirect) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirect);
        return;
      }

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STAFF') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="app-container items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--background), var(--surface))' }}>
      <div className="card glass max-w-md w-full animate-fade-in text-center">
        <div className="flex justify-center mb-6 text-primary"><Hotel size={48} /></div>
        <h2>Welcome Back</h2>
        <p className="mb-8">Sign in to your account</p>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div className="form-group">
            <label>Username</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 text-text-muted" size={20} />
              <input type="text" placeholder="Enter your username" style={{ paddingLeft: '2.5rem' }} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 text-text-muted" size={20} />
              <input type="password" placeholder="Enter your password" style={{ paddingLeft: '2.5rem' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-4 w-full justify-center">Sign In</button>
        </form>
        <div className="mt-6 text-sm text-text-muted">
          <p className="mb-2">Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register here</Link></p>
          <Link to="/home" style={{ color: 'var(--primary)' }}>← Back to Website</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
