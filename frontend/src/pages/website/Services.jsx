import React from 'react';
import { Bed, Utensils, Calendar, Sparkles, Wifi, Car, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    { icon: <Bed size={32} />, title: 'Luxury Accommodations', desc: 'Spacious rooms and suites with premium amenities, plush bedding, and breathtaking views.', color: '#4F46E5' },
    { icon: <Utensils size={32} />, title: 'Fine Dining', desc: 'Award-winning restaurants serving international cuisine prepared by renowned chefs.', color: '#10B981' },
    { icon: <Calendar size={32} />, title: 'Event Hosting', desc: 'Grand ballrooms and intimate venues for weddings, conferences, and celebrations.', color: '#f59e0b' },
    { icon: <Sparkles size={32} />, title: 'Spa & Wellness', desc: 'Full-service spa with massage therapy, yoga sessions, sauna, and wellness programs.', color: '#ec4899' },
    { icon: <Wifi size={32} />, title: 'High-Speed WiFi', desc: 'Complimentary high-speed internet throughout the hotel and all public areas.', color: '#8b5cf6' },
    { icon: <Car size={32} />, title: 'Valet Parking', desc: 'Complimentary valet parking service with secure underground parking facilities.', color: '#06b6d4' },
    { icon: <Shield size={32} />, title: '24/7 Security', desc: 'Round-the-clock security with CCTV surveillance and trained security personnel.', color: '#ef4444' },
    { icon: <Clock size={32} />, title: 'Room Service', desc: '24-hour in-room dining with an extensive menu of gourmet dishes and beverages.', color: '#14b8a6' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #581c87, #7e22ce)' }}>
        <h1>Our Services</h1>
        <p>Comprehensive hospitality services designed for your comfort</p>
      </div>
      <div className="container section">
        <div className="services-grid">
          {services.map((s, idx) => (
            <div key={idx} className="service-card animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="service-icon" style={{ color: s.color, backgroundColor: `${s.color}15` }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="cta-banner mt-8">
          <div>
            <h3>Need a Custom Service?</h3>
            <p>Our concierge team is available 24/7 to assist you with any special requests.</p>
          </div>
          <Link to="/contact" className="btn btn-primary btn-lg">Contact Concierge</Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
