import React from 'react';
import { Award, Users, Clock, Star, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
        <h1>About LuxeStay</h1>
        <p>A legacy of excellence in hospitality since 2010</p>
      </div>
      <div className="container section">
        {/* Story Section */}
        <div className="about-story">
          <div className="about-story-text">
            <span className="section-tag">Our Story</span>
            <h2>Where Luxury Meets Comfort</h2>
            <p>
              Founded in 2010, LuxeStay Hotel & Restaurant was born from a vision to redefine hospitality. 
              What started as a boutique hotel with just 20 rooms has grown into a world-class destination 
              featuring over 100 luxury suites, three award-winning restaurants, a full-service spa, and 
              event facilities that have hosted some of the most prestigious gatherings in the city.
            </p>
            <p>
              Our commitment to excellence is reflected in every detail — from the carefully curated 
              interiors to our meticulously crafted menus. We believe that true luxury lies not just in 
              opulence, but in the warmth of genuine hospitality.
            </p>
          </div>
          <div className="about-story-visual">
            <div className="about-visual-card">
              <Award size={48} />
              <h3>15+ Awards</h3>
              <p>Including Best Luxury Hotel 2025</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="about-values">
          <div className="section-header">
            <span className="section-tag">Our Values</span>
            <h2>What Drives Us</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <Star className="value-icon" />
              <h3>Excellence</h3>
              <p>We strive for perfection in every aspect of our service, setting standards that inspire the industry.</p>
            </div>
            <div className="value-card">
              <Users className="value-icon" />
              <h3>Guest-Centric</h3>
              <p>Every decision we make is guided by our guests' comfort, safety, and satisfaction.</p>
            </div>
            <div className="value-card">
              <Clock className="value-icon" />
              <h3>Tradition</h3>
              <p>We honor timeless traditions of hospitality while embracing modern innovation.</p>
            </div>
            <div className="value-card">
              <MapPin className="value-icon" />
              <h3>Community</h3>
              <p>We are deeply rooted in our local community, supporting sustainable and ethical practices.</p>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="about-stats">
          <div className="about-stat-item">
            <span className="about-stat-number">100+</span>
            <span className="about-stat-label">Luxury Rooms</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">50+</span>
            <span className="about-stat-label">Expert Staff</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">10K+</span>
            <span className="about-stat-label">Happy Guests</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">4.9</span>
            <span className="about-stat-label">Average Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
