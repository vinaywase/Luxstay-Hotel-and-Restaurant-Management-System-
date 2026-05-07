import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bed, Utensils, Star, Calendar, MapPin, Clock, ChevronRight, Sparkles, Shield, Award } from 'lucide-react';

const API = 'http://localhost:8080/api';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [roomsRes, foodRes, feedbackRes] = await Promise.all([
        axios.get(`${API}/rooms`).catch(() => ({ data: [] })),
        axios.get(`${API}/food-items`).catch(() => ({ data: [] })),
        axios.get(`${API}/feedbacks`).catch(() => ({ data: [] })),
      ]);
      setRooms(roomsRes.data || []);
      setFoodItems(foodRes.data || []);
      setFeedbacks((feedbackRes.data || []).sort((a, b) => new Date(b.feedbackDate) - new Date(a.feedbackDate)));
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge"><Sparkles size={16} /> Premium Luxury Hotel & Restaurant</div>
          <h1 className="hero-title">Experience the Art of<br /><span className="text-gradient">Luxury Living</span></h1>
          <p className="hero-subtitle">Indulge in world-class hospitality with exquisite dining, luxurious accommodations, and unforgettable experiences at LuxeStay.</p>
          <div className="hero-actions">
            <Link to="/booking" className="btn btn-primary btn-lg">Book Your Stay <ChevronRight size={20} /></Link>
            <Link to="/menu" className="btn btn-outline btn-lg">Explore Menu</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-number">{rooms.length * 10}+</span><span className="hero-stat-label">Luxury Rooms</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-number">4.9</span><span className="hero-stat-label">Guest Rating</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-number">15+</span><span className="hero-stat-label">Years of Service</span></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2>Unmatched Hospitality</h2>
            <p>Every detail is crafted to perfection for your comfort</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Shield /></div>
              <h3>Premium Security</h3>
              <p>24/7 security surveillance and advanced safety measures for your peace of mind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Award /></div>
              <h3>Award Winning</h3>
              <p>Recognized globally for exceptional service, dining, and guest experiences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Star /></div>
              <h3>5-Star Dining</h3>
              <p>Curated menus by world-renowned chefs using the finest ingredients.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Sparkles /></div>
              <h3>Spa & Wellness</h3>
              <p>Rejuvenate your body and soul with our luxury spa and wellness center.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Preview */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Accommodations</span>
            <h2>Our Luxurious Rooms</h2>
            <p>Discover the perfect room for your dream getaway</p>
          </div>
          <div className="rooms-grid">
            {rooms.slice(0, 3).map((room, idx) => {
              const roomImg = room.roomType?.toLowerCase().includes('suite') ? '/images/luxury_suite.png' : '/images/luxury_deluxe.png';
              return (
                <div key={idx} className="room-card animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="room-image" style={{ backgroundImage: `url(${roomImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <span className="room-badge">{room.status === 'available' ? 'Available' : room.status}</span>
                  </div>
                  <div className="room-info">
                    <div className="room-type">{room.roomType || 'Standard'}</div>
                    <h3>Room {room.roomNumber}</h3>
                    <div className="room-details">
                      <span>👥 {room.capacity} Guests</span>
                      <span>🛏️ {room.roomType}</span>
                    </div>
                    <div className="room-footer">
                      <span className="room-price">${room.pricePerNight}<small>/night</small></span>
                      <Link to="/booking" className="btn btn-primary btn-sm">Book Now</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link to="/rooms" className="btn btn-outline">View All Rooms <ChevronRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Restaurant</span>
            <h2>Exquisite Cuisine</h2>
            <p>Savor culinary masterpieces prepared by our award-winning chefs</p>
          </div>
          <div className="menu-grid">
            {foodItems.slice(0, 4).map((item, idx) => {
              const foodImg = (idx % 2 === 0) ? '/images/gourmet_pasta.png' : '/images/gourmet_steak.png';
              return (
                <div key={idx} className="menu-item-card animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="menu-item-icon" style={{ backgroundImage: `url(${foodImg})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100px', height: '100px', borderRadius: '12px', flexShrink: 0 }}>
                  </div>
                  <div className="menu-item-details">
                    <span className="menu-item-category">{item.category}</span>
                    <h4>{item.name}</h4>
                    <p>{item.description || 'A delightful culinary creation'}</p>
                    <div className="menu-item-footer">
                      <span className="menu-item-price">${item.price}</span>
                      {item.availability && <span className="menu-item-available">Available</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link to="/menu" className="btn btn-outline">Full Menu <ChevronRight size={16} /></Link>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2>Guest Reviews</h2>
            <p>What our valued guests say about their experience</p>
          </div>
          <div className="testimonials-grid">
            {feedbacks.slice(0, 3).map((fb, idx) => (
              <div key={idx} className="testimonial-card animate-fade-in" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < (fb.rating || 5) ? '#f59e0b' : 'none'} stroke={i < (fb.rating || 5) ? '#f59e0b' : '#475569'} />
                  ))}
                </div>
                <p className="testimonial-text">"{fb.comments || 'An absolutely wonderful experience!'}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{fb.customerId ? `G${fb.customerId}` : 'G'}</div>
                  <div>
                    <strong>{fb.customerName || `Guest #${fb.customerId || idx + 1}`}</strong>
                    <p className="testimonial-date">{fb.feedbackDate || 'Recent'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready for an Unforgettable Experience?</h2>
          <p>Book your dream stay today and enjoy world-class hospitality</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/booking" className="btn btn-primary btn-lg">Reserve Now</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
