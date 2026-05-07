import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Utensils, Plus, Minus, ShoppingCart, LogIn, X, AlertTriangle, CreditCard, Smartphone } from 'lucide-react';
import { getFoodImage } from '../../utils/imageMap';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const API = 'http://localhost:8080/api';
const UPI_ID = 'vinaywase03@okaxis'; // 🔁 Replace with your actual UPI ID

// ─────────────────────────────────────────────────────────────────────────────
// Shared inline styles
// ─────────────────────────────────────────────────────────────────────────────
const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200, padding: '1rem',
};
const modalBox = {
  background: 'var(--surface)',
  borderRadius: '1rem',
  padding: '2rem',
  width: '100%',
  position: 'relative',
  border: '1px solid var(--border)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
};
const closeBtn = {
  position: 'absolute', top: 16, right: 16,
  background: 'none', border: 'none',
  color: 'var(--text-muted)', cursor: 'pointer',
  display: 'flex', padding: 4, borderRadius: 6,
};
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.65rem 0.85rem', borderRadius: '0.5rem',
  border: '1px solid var(--border)',
  background: 'var(--background)', color: 'var(--text-main)',
  fontSize: '0.9rem', outline: 'none',
};
const errText = { margin: '4px 0 0', fontSize: '0.75rem', color: '#ef4444' };

// ─────────────────────────────────────────────────────────────────────────────
// PaymentMethodModal  — choose UPI / Debit / Credit
// ─────────────────────────────────────────────────────────────────────────────
function PaymentMethodModal({ total, onSelect, onClose }) {
  const methods = [
    { id: 'online', label: 'UPI', sub: 'GPay, PhonePe, Paytm & more', icon: <Smartphone size={22} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: '#7c3aed' },
    { id: 'debit_card', label: 'Debit Card', sub: 'Visa, Mastercard, RuPay', icon: <CreditCard size={22} />, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: '#2563eb' },
    { id: 'credit_card', label: 'Credit Card', sub: 'All major cards accepted', icon: <CreditCard size={22} />, color: '#ea580c', bg: 'rgba(234,88,12,0.08)', border: '#ea580c' },
  ];

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 400 }}>
        <button onClick={onClose} style={closeBtn}><X size={20} /></button>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: 'var(--text-main)' }}>Select Payment Method</h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Total: <strong style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {methods.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1.5px solid var(--border)', background: 'var(--background)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${m.border}`; e.currentTarget.style.background = m.bg; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid var(--border)'; e.currentTarget.style.background = 'var(--background)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UpiModal — QR code + "I have paid"
// ─────────────────────────────────────────────────────────────────────────────
function UpiModal({ total, onSuccess, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const upiString = `upi://pay?pa=${UPI_ID}&am=${total.toFixed(2)}&cu=INR&tn=HotelFoodOrder`;
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, upiString, {
        width: 210, margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      });
    }
  }, [total]);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 380, textAlign: 'center' }}>
        <button onClick={onClose} style={closeBtn}><X size={20} /></button>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Smartphone size={26} style={{ color: '#7c3aed' }} />
        </div>
        <h2 style={{ margin: '0 0 4px', color: 'var(--text-main)' }}>Pay via UPI</h2>
        <p style={{ margin: '0 0 20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Scan with any UPI app · clicking QR opens payment app directly</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ padding: 12, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'inline-block' }}>
            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', color: '#7c3aed', padding: '4px 14px', borderRadius: 999, fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>
          ${total.toFixed(2)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{UPI_ID}</span>
          <button onClick={copyUPI} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        <button onClick={onSuccess} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', background: '#10b981', borderColor: '#10b981' }}>
          ✓ I have paid
        </button>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>Only tap after payment is confirmed in your UPI app</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CardModal — shared for debit_card and credit_card
// ─────────────────────────────────────────────────────────────────────────────
function CardModal({ type, total, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const isCredit = type === 'credit_card';
  const accentColor = isCredit ? '#ea580c' : '#2563eb';
  const gradFrom = isCredit ? '#ea580c' : '#1d4ed8';
  const gradTo = isCredit ? '#9f1239' : '#312e81';

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const validate = () => {
    const e = {};
    if (cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Enter a valid 16-digit card number';
    if (!name.trim()) e.name = 'Cardholder name is required';
    if (expiry.length !== 5) e.expiry = 'Enter valid expiry MM/YY';
    if (cvv.length !== 3) e.cvv = 'Enter valid 3-digit CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onSuccess(); }, 2000);
  };

  const displayNum = cardNumber || '•••• •••• •••• ••••';

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 400 }}>
        <button onClick={onClose} style={closeBtn}><X size={20} /></button>
        <h2 style={{ margin: '0 0 4px', color: 'var(--text-main)' }}>{isCredit ? 'Credit Card' : 'Debit Card'} Payment</h2>
        <p style={{ margin: '0 0 20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Total: <strong style={{ color: accentColor }}>${total.toFixed(2)}</strong>
        </p>

        {/* Live card preview */}
        <div
          onClick={() => setFlipped(f => !f)}
          style={{ height: 160, borderRadius: 16, padding: '1.25rem', background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, color: '#fff', cursor: 'pointer', marginBottom: 6, userSelect: 'none', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${accentColor}55` }}
        >
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          {!flipped ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ width: 36, height: 26, background: 'rgba(255,220,100,0.7)', borderRadius: 4 }} />
                <CreditCard size={20} style={{ opacity: 0.7 }} />
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.18em', margin: '0 0 14px' }}>{displayNum}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85 }}>
                <span>{name || 'CARDHOLDER NAME'}</span>
                <span>{expiry || 'MM/YY'}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', height: 36, borderRadius: 4, marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>CVV</span>
                <div style={{ background: '#fff', color: '#1e293b', fontFamily: 'monospace', padding: '4px 14px', borderRadius: 6, fontSize: '0.9rem', letterSpacing: '0.2em' }}>
                  {cvv || '•••'}
                </div>
              </div>
            </div>
          )}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 18 }}>Tap card to flip and see CVV</p>

        {/* Input form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} style={{ ...inputStyle, fontFamily: 'monospace', borderColor: errors.cardNumber ? '#ef4444' : undefined }} />
            {errors.cardNumber && <p style={errText}>{errors.cardNumber}</p>}
          </div>
          <div>
            <input placeholder="Cardholder Name" value={name} onChange={e => setName(e.target.value.toUpperCase())} style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : undefined }} />
            {errors.name && <p style={errText}>{errors.name}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} style={{ ...inputStyle, borderColor: errors.expiry ? '#ef4444' : undefined }} />
              {errors.expiry && <p style={errText}>{errors.expiry}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <input placeholder="CVV" type="password" maxLength={3} value={cvv}
                onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                style={{ ...inputStyle, borderColor: errors.cvv ? '#ef4444' : undefined }} />
              {errors.cvv && <p style={errText}>{errors.cvv}</p>}
            </div>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={processing}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem', fontSize: '1rem', background: accentColor, borderColor: accentColor, opacity: processing ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {processing ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.3" />
                <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Processing…
            </>
          ) : `Pay $${total.toFixed(2)}`}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main MenuPage
// ─────────────────────────────────────────────────────────────────────────────
const MenuPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [checkedInReservation, setCheckedInReservation] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showNotCheckedIn, setShowNotCheckedIn] = useState(false);

  // Payment modal state
  const [showPaymentChooser, setShowPaymentChooser] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    axios.get(`${API}/food-items`).then(res => setFoodItems(res.data || [])).catch(() => { });
    if (isLoggedIn) {
      const headers = { Authorization: `Bearer ${token}` };
      axios.get(`${API}/reservations`, { headers })
        .then(res => {
          const active = (res.data || []).find(r => r.status === 'checked-in');
          setCheckedInReservation(active || null);
        })
        .catch(() => { });
    }
  }, []);

  const categories = ['all', ...new Set(foodItems.map(i => i.category?.toLowerCase()).filter(Boolean))];
  const filtered = filter === 'all' ? foodItems : foodItems.filter(i => i.category?.toLowerCase() === filter);

  const handleAddToCart = (item) => {
    if (!isLoggedIn) { setShowLoginPrompt(true); return; }
    if (!checkedInReservation) { setShowNotCheckedIn(true); return; }
    setCart(prev => ({ ...prev, [item.foodItemId]: (prev[item.foodItemId] || 0) + 1 }));
  };
  const handleRemoveFromCart = (item) => {
    setCart(prev => {
      const n = { ...prev };
      if (n[item.foodItemId] > 1) n[item.foodItemId] -= 1;
      else delete n[item.foodItemId];
      return n;
    });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = foodItems.find(f => f.foodItemId === parseInt(id));
    return item ? { ...item, qty } : null;
  }).filter(Boolean);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  // Step 1 — open chooser
  const handlePayClick = () => {
    if (cartTotal === 0) return;
    setShowCart(false);
    setShowPaymentChooser(true);
  };

  // Step 2 — route to correct modal
  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setShowPaymentChooser(false);
    if (method === 'online') setShowUpiModal(true);
    else setShowCardModal(true);
  };

  // Step 3 — submit to backend
  const handlePaymentSuccess = async () => {
    setShowUpiModal(false);
    setShowCardModal(false);
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const storedCustomerId = localStorage.getItem('customerId');
      const foodItemIds = Object.keys(cart).flatMap(id => Array(cart[id]).fill(parseInt(id)));

      const orderRes = await axios.post(`${API}/orders`, {
        customerId: storedCustomerId ? parseInt(storedCustomerId) : 1,
        restaurantTableId: 1,
        orderDate: new Date().toISOString(),
        totalCost: parseFloat(cartTotal),
        status: 'pending',
        diningLocation: 'room',
        foodItemIds,
      }, { headers });

      await axios.post(`${API}/payments`, {
        billId: orderRes.data.billId,
        paymentDate: new Date().toISOString(),
        paymentMethod: selectedMethod,   // "online" | "debit_card" | "credit_card"
        amountPaid: parseFloat(cartTotal),
      }, { headers });

      setCart({});
      setOrderSuccess(true);
    } catch (err) {
      console.error('Failed to place order', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #78350f, #92400e)' }}>
        <h1>Our Menu</h1>
        <p>Discover culinary excellence crafted by our world-class chefs</p>
      </div>

      <div className="container section">
        {/* Filter bar */}
        <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          {cartCount > 0 && (
            <button onClick={() => setShowCart(true)} className="btn btn-primary" style={{ position: 'relative', padding: '0.6rem 1.2rem' }}>
              <ShoppingCart size={18} /> Cart
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {cartCount}
              </span>
            </button>
          )}
        </div>

        {/* Menu grid */}
        <div className="menu-page-grid">
          {filtered.map((item, idx) => (
            <div key={idx} className="menu-page-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="menu-page-icon" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={getFoodImage(item.name)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="menu-page-body">
                <span className="menu-item-category">{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.description || 'A delicious culinary creation made with the finest ingredients.'}</p>
                <div className="menu-page-footer">
                  <span className="menu-item-price">${item.price}</span>
                  {item.availability ? (
                    <div>
                      {cart[item.foodItemId] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(79,70,229,0.1)', borderRadius: '0.5rem', padding: '0.25rem 0.5rem' }}>
                          <button onClick={() => handleRemoveFromCart(item)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }}><Minus size={16} /></button>
                          <span style={{ fontWeight: 'bold', minWidth: '1.2rem', textAlign: 'center' }}>{cart[item.foodItemId]}</span>
                          <button onClick={() => handleAddToCart(item)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex' }}><Plus size={16} /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleAddToCart(item)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Add to Cart</button>
                      )}
                    </div>
                  ) : (
                    <span className="menu-item-badge unavailable">✗ Unavailable</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-text-muted mt-8">No items in this category.</p>}
      </div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div style={overlay}>
          <div style={{ ...modalBox, maxWidth: 420, textAlign: 'center' }}>
            <LogIn size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Login Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You need to be logged in to place an order. Please login or create an account first.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => setShowLoginPrompt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Not Checked-In */}
      {showNotCheckedIn && (
        <div style={overlay}>
          <div style={{ ...modalBox, maxWidth: 420, textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Active Stay Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You need to have an active checked-in room reservation to place a food order.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/booking')}>Book a Room</button>
              <button className="btn btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => setShowNotCheckedIn(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setShowCart(false)}>
          <div
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '420px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Your Order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            {cartItems.length > 0 ? (
              <>
                <div style={{ flex: 1 }}>
                  {cartItems.map(item => (
                    <div key={item.foodItemId} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                      <img src={getFoodImage(item.name)} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>${item.price.toFixed(2)} each</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid var(--border)' }}>
                        <button onClick={() => handleRemoveFromCart(item)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }}><Minus size={16} /></button>
                        <span style={{ fontWeight: 'bold', minWidth: '1.2rem', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => handleAddToCart(item)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex' }}><Plus size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Cart footer — clean, no payment tabs */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Total:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                    onClick={handlePayClick}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Pay $${cartTotal.toFixed(2)} & Order`}
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>Your cart is empty.</p>
            )}
          </div>
        </div>
      )}

      {/* Order Success */}
      {orderSuccess && (
        <div style={overlay}>
          <div style={{ ...modalBox, maxWidth: 420, textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Utensils size={40} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Order Placed! 🎉</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your delicious meal is being prepared and will reach your room in approximately <strong>15–20 minutes</strong>!
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/customer/orders')}>View Orders</button>
              <button className="btn btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => setOrderSuccess(false)}>Continue Browsing</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modals ── */}
      {showPaymentChooser && (
        <PaymentMethodModal total={cartTotal} onSelect={handleSelectMethod} onClose={() => setShowPaymentChooser(false)} />
      )}
      {showUpiModal && (
        <UpiModal total={cartTotal} onSuccess={handlePaymentSuccess} onClose={() => setShowUpiModal(false)} />
      )}
      {showCardModal && (
        <CardModal type={selectedMethod} total={cartTotal} onSuccess={handlePaymentSuccess} onClose={() => setShowCardModal(false)} />
      )}
    </div>
  );
};

export default MenuPage;
