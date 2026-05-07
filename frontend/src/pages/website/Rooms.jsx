import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bed, Users, ChevronRight, X, Wifi, Wind, Tv, Coffee, Bath, ShieldCheck, Sparkles, Star, MapPin, ArrowRight, ChevronLeft } from 'lucide-react';

const API = 'http://localhost:8080/api';

/* ── room metadata keyed by type (lowercase) ── */
const ROOM_DATA = {
  single: {
    headline: 'Cozy Comfort for One',
    description: 'Our Single rooms offer a refined retreat for solo travelers. Enjoy a queen-size bed with premium linens, a sleek workspace, and floor-to-ceiling windows with stunning city views. Perfect for business trips or peaceful getaways.',
    sqft: '320 sq ft',
    bedType: 'Queen Bed',
    images: ['/images/rooms/single.png', '/images/rooms/bathroom.png'],
    amenities: [
      { icon: Wifi, label: 'High-Speed WiFi' },
      { icon: Wind, label: 'Climate Control' },
      { icon: Tv, label: '50" Smart TV' },
      { icon: Coffee, label: 'Mini Coffee Bar' },
      { icon: Bath, label: 'Rain Shower' },
      { icon: ShieldCheck, label: 'In-Room Safe' },
    ],
    highlights: ['City View', 'Work Desk', 'Blackout Curtains', 'Complimentary Toiletries', '24/7 Room Service'],
  },
  double: {
    headline: 'Spacious Luxury for Two',
    description: 'Our Double rooms provide generous space with elegant furnishings. Featuring a king-size bed or two double beds, a comfortable sitting area, and a marble-accented bathroom with both shower and soaking tub. Ideal for couples or those who appreciate extra room.',
    sqft: '480 sq ft',
    bedType: 'King / Twin Beds',
    images: ['/images/rooms/double.png', '/images/rooms/bathroom.png', '/images/rooms/lounge.png'],
    amenities: [
      { icon: Wifi, label: 'High-Speed WiFi' },
      { icon: Wind, label: 'Climate Control' },
      { icon: Tv, label: '55" Smart TV' },
      { icon: Coffee, label: 'Nespresso Machine' },
      { icon: Bath, label: 'Soaking Tub & Shower' },
      { icon: ShieldCheck, label: 'In-Room Safe' },
    ],
    highlights: ['Skyline View', 'Sitting Area', 'Bathrobe & Slippers', 'Premium Toiletries', 'Mini Fridge', 'Iron & Board'],
  },
  suite: {
    headline: 'Ultimate Five-Star Suite',
    description: 'Experience unparalleled luxury in our Suites. A separate living room with plush seating, a grand bedroom with king canopy bed, panoramic floor-to-ceiling windows, marble bathroom with freestanding tub, and premium amenities throughout. The pinnacle of refined hospitality.',
    sqft: '750 sq ft',
    bedType: 'King Canopy Bed',
    images: ['/images/rooms/suite.png', '/images/rooms/lounge.png', '/images/rooms/bathroom.png'],
    amenities: [
      { icon: Wifi, label: 'Premium WiFi' },
      { icon: Wind, label: 'Dual-Zone Climate' },
      { icon: Tv, label: '65" OLED TV' },
      { icon: Coffee, label: 'Full Minibar' },
      { icon: Bath, label: 'Freestanding Tub' },
      { icon: Sparkles, label: 'Butler Service' },
    ],
    highlights: ['Panoramic View', 'Separate Living Room', 'Walk-in Closet', 'Luxury Toiletries', 'Champagne Welcome', 'Private Check-in', 'Turn-Down Service'],
  },
};

const getMeta = (type) => ROOM_DATA[type?.toLowerCase()] || ROOM_DATA.single;

/* ===================================================================
   Room Detail Modal
   =================================================================== */
const RoomDetailModal = ({ room, onClose }) => {
  const meta = getMeta(room.roomType);
  const [activeImg, setActiveImg] = useState(0);
  const navigate = useNavigate();

  /* Prevent body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const nextImg = () => setActiveImg((p) => (p + 1) % meta.images.length);
  const prevImg = () => setActiveImg((p) => (p - 1 + meta.images.length) % meta.images.length);

  return (
    <>
      {/* Backdrop */}
      <div className="rd-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="rd-modal">
        {/* Close button */}
        <button className="rd-close" onClick={onClose}><X size={20} /></button>

        {/* ── Image Gallery ── */}
        <div className="rd-gallery">
          <img src={meta.images[activeImg]} alt={`${room.roomType} view ${activeImg + 1}`} className="rd-hero-img" />
          <div className="rd-gallery-overlay">
            {meta.images.length > 1 && (
              <>
                <button className="rd-arrow rd-arrow-left" onClick={prevImg}><ChevronLeft size={20} /></button>
                <button className="rd-arrow rd-arrow-right" onClick={nextImg}><ChevronRight size={20} /></button>
              </>
            )}
            <div className="rd-gallery-dots">
              {meta.images.map((_, i) => (
                <span key={i} className={`rd-dot ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
              ))}
            </div>
          </div>
          <span className={`room-badge ${room.status === 'available' ? '' : room.status === 'maintenance' ? 'room-badge-occupied' : ''}`}>{room.status === 'maintenance' ? 'Maintenance' : 'Available'}</span>
        </div>

        {/* ── Content ── */}
        <div className="rd-body">
          {/* Header */}
          <div className="rd-header">
            <div>
              <span className="room-type">{room.roomType}</span>
              <h2 className="rd-title">Room {room.roomNumber} — {meta.headline}</h2>
              <div className="rd-meta">
                <span><MapPin size={14} /> Floor {room.roomNumber?.charAt(0)}</span>
                <span><Bed size={14} /> {meta.bedType}</span>
                <span><Users size={14} /> Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''}</span>
                <span><Sparkles size={14} /> {meta.sqft}</span>
              </div>
            </div>
            <div className="rd-price-box">
              <span className="rd-price">${room.pricePerNight}</span>
              <span className="rd-price-sub">per night</span>
              <div className="rd-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="rd-desc">{meta.description}</p>

          {/* Thumbnail Gallery */}
          <div className="rd-thumbs">
            {meta.images.map((src, i) => (
              <img key={i} src={src} alt={`Gallery ${i + 1}`} className={`rd-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
            ))}
          </div>

          {/* Amenities */}
          <div className="rd-section">
            <h3>Room Amenities</h3>
            <div className="rd-amenities-grid">
              {meta.amenities.map((a, i) => (
                <div key={i} className="rd-amenity">
                  <div className="rd-amenity-icon"><a.icon size={18} /></div>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="rd-section">
            <h3>Room Highlights</h3>
            <div className="rd-highlights">
              {meta.highlights.map((h, i) => (
                <span key={i} className="rd-highlight-tag">✓ {h}</span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rd-cta">
            <div className="rd-cta-info">
              <span className="rd-cta-price">${room.pricePerNight}<small>/night</small></span>
              {room.status !== 'maintenance' && <span className="rd-cta-avail">✓ Available for booking</span>}
            </div>
            {room.status !== 'maintenance' ? (
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/booking', { state: { roomId: room.roomId } })}>
                Book This Room <ArrowRight size={18} />
              </button>
            ) : (
              <button className="btn btn-lg" disabled style={{ opacity: 0.5 }}>Under Maintenance</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ===================================================================
   Rooms Page
   =================================================================== */
const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    axios.get(`${API}/rooms`).then(res => setRooms(res.data || [])).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.roomType?.toLowerCase() === filter);
  const types = ['all', ...new Set(rooms.map(r => r.roomType?.toLowerCase()).filter(Boolean))];

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
        <h1>Our Rooms & Suites</h1>
        <p>Find the perfect accommodation for your stay</p>
      </div>
      <div className="container section">
        <div className="filter-bar">
          {types.map(t => (
            <button key={t} className={`filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="rooms-grid">
          {filtered.map((room, idx) => {
            const meta = getMeta(room.roomType);
            return (
              <div key={idx} className="room-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="room-image" style={{ backgroundImage: `url(${meta.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <span className={`room-badge ${room.status === 'available' ? '' : room.status === 'maintenance' ? 'room-badge-occupied' : ''}`}>
                    {room.status === 'maintenance' ? 'Maintenance' : 'Available'}
                  </span>
                </div>
                <div className="room-info">
                  <div className="room-type">{room.roomType}</div>
                  <h3>Room {room.roomNumber}</h3>
                  <div className="room-details">
                    <span><Users size={14} /> {room.capacity} Guests</span>
                    <span><Bed size={14} /> {meta.bedType}</span>
                    <span>{meta.sqft}</span>
                  </div>
                  <div className="room-footer">
                    <span className="room-price">${room.pricePerNight}<small>/night</small></span>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedRoom(room)}>
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-center text-text-muted mt-8">No rooms found for this category.</p>}
      </div>

      {/* Detail Modal */}
      {selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
    </div>
  );
};

export default Rooms;
