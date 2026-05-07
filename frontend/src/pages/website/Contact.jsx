import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8080/api/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out anytime.</p>
      </div>
      <div className="container section">
        <div className="contact-layout">
          {/* Contact Info */}
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>Have questions or need help? Our team is here for you.</p>
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon"><MapPin size={20} /></div>
                <div>
                  <strong>Address</strong>
                  <p>123 Luxury Avenue, Paradise City, PC 10001</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><Phone size={20} /></div>
                <div>
                  <strong>Phone</strong>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><Mail size={20} /></div>
                <div>
                  <strong>Email</strong>
                  <p>info@luxestay.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><Clock size={20} /></div>
                <div>
                  <strong>Working Hours</strong>
                  <p>24/7 — Always Open</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card glass">
            <h3 className="mb-6">Send a Message</h3>
            {submitted && <div className="success-message animate-fade-in mb-4" style={{ padding: '1rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '0.5rem', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Message sent successfully! We'll get back to you soon.</div>}
            {error && <div className="error-message animate-fade-in mb-4" style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Write your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                <Send size={16} /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
