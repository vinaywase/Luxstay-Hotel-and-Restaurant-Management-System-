import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Plus, Minus, Utensils, CreditCard, Hotel, UtensilsCrossed,
  Users, Check, X, Smartphone, ShoppingCart, ArrowLeft, Calendar, Clock, ChefHat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFoodImage } from '../utils/imageMap';

const API = 'http://localhost:8080/api';
const UPI_ID = 'vinaywase03@okaxis';

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepBar = ({ steps, currentStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
    {steps.map((s, i) => {
      const done = currentStep > s.n;
      const active = currentStep === s.n;
      return (
        <React.Fragment key={s.n}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
              background: done ? '#10b981' : active ? 'var(--primary)' : 'var(--surface)',
              color: done || active ? '#fff' : 'var(--text-muted)',
              border: done || active ? 'none' : '2px solid var(--border)',
              boxShadow: active ? '0 0 0 4px rgba(79,70,229,0.18)' : 'none'
            }}>
              {done ? <Check size={15} /> : s.n}
            </div>
            <span style={{
              fontSize: '0.7rem', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400,
              color: active ? 'var(--primary)' : done ? '#10b981' : 'var(--text-muted)'
            }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: '2px', margin: '0 0.4rem', marginBottom: '1.3rem',
              background: done ? '#10b981' : 'var(--border)', transition: 'background 0.3s'
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Payment Method Modal ─────────────────────────────────────────────────────
const PaymentMethodModal = ({ total, onSelect, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: 'var(--surface)', borderRadius: '1.25rem', padding: '2rem',
      width: '100%', maxWidth: '420px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      border: '1px solid var(--border)', position: 'relative'
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
        border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
      }}><X size={20} /></button>
      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>Choose Payment</h3>
      <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        Total: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{total.toFixed(2)}</strong>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {[
          { id: 'upi', label: 'UPI / QR Code', icon: <Smartphone size={22} />, color: '#6366f1', desc: 'PhonePe, GPay, Paytm, any UPI app' },
          { id: 'debit_card', label: 'Debit Card', icon: <CreditCard size={22} />, color: '#10b981', desc: 'Visa, Mastercard, RuPay' },
          { id: 'credit_card', label: 'Credit Card', icon: <CreditCard size={22} />, color: '#f59e0b', desc: 'Visa, Mastercard, Amex' },
        ].map(m => (
          <button key={m.id} onClick={() => onSelect(m.id)} style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
            borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--background)',
            cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${m.color}`; e.currentTarget.style.background = `${m.color}12`; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.background = 'var(--background)'; }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '0.6rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${m.color}18`, color: m.color
            }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── UPI Modal ────────────────────────────────────────────────────────────────
const UpiModal = ({ total, onSuccess, onBack }) => {
  const canvasRef = useRef(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    const upiString = `upi://pay?pa=${UPI_ID}&pn=HotelDining&am=${total.toFixed(2)}&cu=INR`;
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current, upiString, {
        width: 200, margin: 2, color: { dark: '#1e1b4b', light: '#ffffff' }
      }, () => setQrReady(true));
    }).catch(() => setQrReady(true));
  }, [total]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '1.25rem', padding: '2rem',
        width: '100%', maxWidth: '360px', textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)'
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
        }}><Smartphone size={26} style={{ color: '#6366f1' }} /></div>
        <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-main)' }}>Scan & Pay</h3>
        <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Open any UPI app and scan this code</p>
        <div style={{
          display: 'inline-block', padding: '1rem', borderRadius: '0.75rem',
          background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginBottom: '1rem'
        }}>
          <canvas ref={canvasRef} style={{ display: 'block' }} />
          {!qrReady && <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', width: '200px' }}>Generating QR...</p>}
        </div>
        <div style={{
          padding: '0.6rem 1rem', borderRadius: '0.5rem', background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.5rem', fontSize: '0.85rem'
        }}>UPI ID: <strong style={{ color: '#6366f1' }}>{UPI_ID}</strong></div>
        <div style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toFixed(2)}</div>
        <button onClick={onSuccess} style={{
          width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '0.75rem'
        }}>✅ I Have Paid</button>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline'
        }}>← Go Back</button>
      </div>
    </div>
  );
};

// ─── Card Modal ───────────────────────────────────────────────────────────────
const iStyle = {
  padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.95rem',
  border: '1px solid var(--border)', background: 'var(--background)',
  color: 'var(--text-main)', width: '100%', boxSizing: 'border-box', outline: 'none'
};

const CardModal = ({ type, total, onSuccess, onBack }) => {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fmt = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const handlePay = async () => {
    if (!card.number || !card.name || !card.expiry || !card.cvv) return alert('Please fill all card details.');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    onSuccess();
  };

  const accent = type === 'credit_card' ? '#f59e0b' : '#10b981';
  const label = type === 'credit_card' ? 'Credit Card' : 'Debit Card';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '1.25rem', padding: '2rem',
        width: '100%', maxWidth: '440px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)'
      }}>
        <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} style={{ color: accent }} /> Pay with {label}
        </h3>
        <div style={{ perspective: '1000px', marginBottom: '1.5rem', height: '160px' }}>
          <div style={{
            position: 'relative', width: '100%', height: '100%',
            transformStyle: 'preserve-3d', transition: 'transform 0.5s ease',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)'
          }}>
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '0.75rem', padding: '1.25rem',
              background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`, color: '#fff',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: `0 8px 24px ${accent}44`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.9rem' }}>{label.toUpperCase()}</span>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', marginLeft: '-10px' }} />
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', letterSpacing: '0.15em' }}>
                {card.number || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{card.name || 'CARDHOLDER NAME'}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{card.expiry || 'MM/YY'}</span>
              </div>
            </div>
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
              borderRadius: '0.75rem', background: `linear-gradient(135deg, ${accent}dd, ${accent}88)`,
              color: '#fff', overflow: 'hidden'
            }}>
              <div style={{ height: '40px', background: 'rgba(0,0,0,0.4)', marginTop: '1.5rem' }} />
              <div style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.9)', color: '#333', padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 700,
                  letterSpacing: '0.1em', minWidth: '60px', textAlign: 'center'
                }}>{card.cvv || 'CVV'}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input placeholder="Card Number" value={card.number}
            onChange={e => setCard(p => ({ ...p, number: fmt(e.target.value) }))} style={iStyle} />
          <input placeholder="Cardholder Name" value={card.name}
            onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))} style={iStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input placeholder="MM/YY" value={card.expiry}
              onChange={e => setCard(p => ({ ...p, expiry: fmtExp(e.target.value) }))} style={iStyle} />
            <input placeholder="CVV" value={card.cvv} maxLength={4}
              onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
              onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} style={iStyle} />
          </div>
        </div>
        <button onClick={handlePay} disabled={submitting} style={{
          width: '100%', marginTop: '1.25rem', padding: '0.9rem', borderRadius: '0.75rem',
          border: 'none', fontWeight: 700, fontSize: '1rem', color: '#fff',
          cursor: submitting ? 'not-allowed' : 'pointer',
          background: submitting ? '#999' : `linear-gradient(135deg, ${accent}, ${accent}cc)`
        }}>{submitting ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}</button>
        <button onClick={onBack} style={{
          width: '100%', marginTop: '0.6rem', background: 'transparent', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem',
          textDecoration: 'underline', padding: '0.4rem'
        }}>← Go Back</button>
      </div>
    </div>
  );
};

// ─── Main PlaceOrder ──────────────────────────────────────────────────────────
const PlaceOrder = () => {
  // step: 1=Location, 2=Restaurant(cafeteria only), 3=Table+DateTime(cafeteria only), 4=Menu, 5=Payment
  const [step, setStep] = useState(1);
  const [diningLocation, setDiningLocation] = useState(null);

  // ── Cafeteria: Restaurant selection ──
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // ── Cafeteria: Table + booking details ──
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [persons, setPersons] = useState(1);
  const [availability, setAvailability] = useState(null); // null | true | false
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingTable, setBookingTable] = useState(false);
  const [bookedTable, setBookedTable] = useState(null);
  const [tableBookingId, setTableBookingId] = useState(null);

  // ── Menu & Cart ──
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState({});

  // ── Payment ──
  const [showPaymentChooser, setShowPaymentChooser] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardType, setCardType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  // Today's date string for min date picker
  const todayStr = new Date().toISOString().split('T')[0];

  // ── Load food items once ──
  useEffect(() => {
    axios.get(`${API}/food-items`)
      .then(res => setFoodItems(res.data || []))
      .catch(() => { });
  }, []);

  // ── Load restaurants when cafeteria selected ──
  useEffect(() => {
    if (diningLocation === 'cafeteria') {
      setRestaurantsLoading(true);
      axios.get(`${API}/restaurants`)
        .then(res => { setRestaurants(res.data || []); setRestaurantsLoading(false); })
        .catch(() => { setRestaurants([]); setRestaurantsLoading(false); });
    }
  }, [diningLocation]);

  // ── Load tables when restaurant selected ──
  useEffect(() => {
    if (selectedRestaurant) {
      setTablesLoading(true);
      setSelectedTableId(null);
      setAvailability(null);
      axios.get(`${API}/tables/restaurant/${selectedRestaurant.restaurantId}`)
        .then(res => { setTables(res.data || []); setTablesLoading(false); })
        .catch(() => { setTables([]); setTablesLoading(false); });
    }
  }, [selectedRestaurant]);

  // ── Check availability when table + date + time all selected ──
  useEffect(() => {
    if (selectedTableId && bookingDate && bookingTime) {
      setAvailabilityLoading(true);
      setAvailability(null);
      axios.post(`${API}/tables/check-availability`, {
        tableId: selectedTableId,
        bookingDate,
        bookingTime,
        durationHours: 2
      })
        .then(res => { setAvailability(res.data.available); setAvailabilityLoading(false); })
        .catch(() => { setAvailability(null); setAvailabilityLoading(false); });
    } else {
      setAvailability(null);
    }
  }, [selectedTableId, bookingDate, bookingTime]);

  const addToCart = item => setCart(p => ({ ...p, [item.foodItemId]: (p[item.foodItemId] || 0) + 1 }));
  const removeFromCart = item => setCart(p => {
    const n = { ...p };
    if (n[item.foodItemId] > 1) n[item.foodItemId]--; else delete n[item.foodItemId];
    return n;
  });
  const cartTotal = () => Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = foodItems.find(f => f.foodItemId === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);

  const selectedTable = tables.find(t => t.restaurantTableId === selectedTableId);
  const personsExceedsCapacity = selectedTable && persons > selectedTable.seatingCapacity;

  // ── Step 1: location chosen ──
  const handleSelectLocation = (loc) => {
    setDiningLocation(loc);
    if (loc === 'room') setStep(4); // room goes directly to menu (step 4)
    else setStep(2);                // cafeteria goes to restaurant picker (step 2)
  };

  // ── Step 2 → Step 3: restaurant chosen ──
  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setStep(3);
  };

  // ── Step 3: Book table then proceed to menu ──
  const handleBookTable = async () => {
    if (!selectedTableId) return alert('Please select a table.');
    if (!bookingDate) return alert('Please select a booking date.');
    if (!bookingTime) return alert('Please select a booking time.');
    if (personsExceedsCapacity) return alert(`Table capacity is ${selectedTable.seatingCapacity} persons.`);
    if (!availability) return alert('Table is not available for the selected time slot.');

    setBookingTable(true);
    const customerId = localStorage.getItem('customerId');
    try {
      const res = await axios.post(`${API}/tables/book`, {
        tableId: selectedTableId,
        restaurantId: selectedRestaurant.restaurantId,
        customerId: customerId ? parseInt(customerId) : 1,
        bookingDate,
        bookingTime,
        durationHours: 2,
        personsCount: persons,
      }, { headers: authHeaders });

      setTableBookingId(res.data.bookingId);
      setBookedTable(selectedTable);
      setStep(4); // proceed to menu
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Could not book table.';
      alert(`Booking failed: ${msg}`);
    } finally {
      setBookingTable(false);
    }
  };

  // ── Step 4 → open payment ──
  const handleProceedToPayment = () => {
    if (cartTotal() === 0) return alert('Please add at least one item.');
    setShowPaymentChooser(true);
  };

  const handleSelectPayment = (method) => {
    setShowPaymentChooser(false);
    if (method === 'upi') setShowUpiModal(true);
    else { setCardType(method); setShowCardModal(true); }
  };

  // ── After payment: create order + bill + payment record ──
  const handlePaymentSuccess = async (paymentMethod) => {
    setShowUpiModal(false);
    setShowCardModal(false);
    setSubmitting(true);
    const total = cartTotal();
    const customerId = localStorage.getItem('customerId');
    const foodItemIds = Object.keys(cart).flatMap(id => Array(cart[id]).fill(parseInt(id)));

    try {
      // 1. Create order
      const orderRes = await axios.post(`${API}/orders`, {
        customerId: customerId ? parseInt(customerId) : 1,
        restaurantTableId: diningLocation === 'cafeteria' ? selectedTableId : null,
        tableBookingId: diningLocation === 'cafeteria' ? tableBookingId : null,
        orderDate: new Date().toISOString(),
        totalCost: parseFloat(total),
        status: 'pending',
        diningLocation,
        foodItemIds
      }, { headers: authHeaders });
      const newOrder = orderRes.data;

      // 3. Generate bill
      const billRes = await axios.post(`${API}/bills/generate`, {
        customerId: customerId ? parseInt(customerId) : 1,
        serviceType: 'Order',
        referenceId: newOrder.restaurantOrderId,
        amount: parseFloat(total)
      }, { headers: authHeaders });
      const newBill = billRes.data;

      // 4. Record payment
      await axios.post(`${API}/payments`, {
        billId: newBill.billId,
        paymentDate: new Date().toISOString(),
        paymentMethod,
        amountPaid: parseFloat(total)
      }, { headers: authHeaders });

      setSuccess(true);
      setTimeout(() => navigate('/customer/orders'), 4000);
    } catch (err) {
      console.error('Order failed', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTableStyle = (table) => {
    if (table.status === 'occupied' || table.availableSeats <= 0)
      return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.35)', color: '#ef4444', label: 'Occupied' };
    if (table.occupiedSeats === 0)
      return { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.35)', color: '#10b981', label: 'Available' };
    return { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b', label: `${table.availableSeats} seats free` };
  };

  // Step bar config
  // Room:      Location(1) → Menu(4) → Payment(5)
  // Cafeteria: Location(1) → Restaurant(2) → Table(3) → Menu(4) → Payment(5)
  const allSteps = diningLocation === 'room'
    ? [{ n: 1, label: 'Location' }, { n: 4, label: 'Menu' }, { n: 5, label: 'Payment' }]
    : [{ n: 1, label: 'Location' }, { n: 2, label: 'Restaurant' }, { n: 3, label: 'Table' }, { n: 4, label: 'Menu' }, { n: 5, label: 'Payment' }];

  // Map internal step number to display step number for StepBar
  const displayStep = (() => {
    if (diningLocation === 'room') {
      if (step === 1) return 1;
      if (step === 4) return 4;
      return 5;
    }
    return step;
  })();

  // ── Success screen ──
  if (success) return (
    <div className="card w-full animate-fade-in text-center py-16 flex flex-col items-center justify-center">
      <div style={{
        width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
      }}><Check size={44} style={{ color: '#10b981' }} /></div>
      <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.75rem' }}>Order Placed! 🎉</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
        {diningLocation === 'cafeteria'
          ? <>Head to <strong>{selectedRestaurant?.name}</strong> — Table <strong>{bookedTable?.tableNumber}</strong>. Your meal arrives in <strong>15–20 min</strong>.</>
          : <>Your meal will be <strong>delivered to your room</strong> in <strong>15–20 min</strong>.</>}
      </p>
      <button className="btn btn-primary px-8 py-3" onClick={() => navigate('/customer/orders')}>
        View Order History
      </button>
    </div>
  );

  return (
    <div className="card w-full animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem'
      }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Utensils style={{ color: 'var(--primary)' }} /> Place New Order
        </h2>
        {cartCount() > 0 && step >= 4 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem',
            borderRadius: '2rem', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)'
          }}>
            <ShoppingCart size={15} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem' }}>
              {cartCount()} item{cartCount() > 1 ? 's' : ''} · ₹{cartTotal().toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <StepBar steps={allSteps} currentStep={displayStep} />

      {/* ══ STEP 1: Location ══ */}
      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', color: 'var(--text-main)' }}>
            🍽️ Where would you like to dine?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: '540px' }}>
            {[
              { id: 'room', label: 'In Room', desc: 'Delivered to your hotel room', icon: <Hotel size={30} />, color: 'var(--primary)', activeBg: 'rgba(79,70,229,0.08)', shadow: '0 4px 20px rgba(79,70,229,0.15)' },
              { id: 'cafeteria', label: 'Cafeteria', desc: 'Dine at a restaurant table', icon: <UtensilsCrossed size={30} />, color: 'var(--secondary)', activeBg: 'rgba(16,185,129,0.08)', shadow: '0 4px 20px rgba(16,185,129,0.15)' }
            ].map(opt => (
              <div key={opt.id} onClick={() => handleSelectLocation(opt.id)} style={{
                padding: '2rem 1.5rem', borderRadius: '1rem', cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${diningLocation === opt.id ? opt.color : 'var(--border)'}`,
                background: diningLocation === opt.id ? opt.activeBg : 'var(--surface)',
                transition: 'all 0.25s ease',
                transform: diningLocation === opt.id ? 'scale(1.03)' : 'scale(1)',
                boxShadow: diningLocation === opt.id ? opt.shadow : 'none'
              }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: diningLocation === opt.id ? `${opt.color}22` : 'rgba(100,116,139,0.1)',
                  color: diningLocation === opt.id ? opt.color : 'var(--text-muted)', transition: 'all 0.25s'
                }}>{opt.icon}</div>
                <h4 style={{ margin: '0 0 0.3rem', color: diningLocation === opt.id ? opt.color : 'var(--text-main)' }}>{opt.label}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</p>
                {diningLocation === opt.id && <div style={{ marginTop: '0.75rem' }}><Check size={18} style={{ color: opt.color }} /></div>}
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            👆 Tap a location to continue
          </p>
        </div>
      )}

      {/* ══ STEP 2: Restaurant Selection (cafeteria only) ══ */}
      {step === 2 && diningLocation === 'cafeteria' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button onClick={() => { setStep(1); setDiningLocation(null); setSelectedRestaurant(null); }} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem',
              padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem'
            }}><ArrowLeft size={14} /> Back</button>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChefHat size={18} style={{ color: 'var(--secondary)' }} /> Select a Restaurant
            </h3>
          </div>

          {restaurantsLoading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading restaurants...</p>
          ) : restaurants.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No restaurants available.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {restaurants.map(r => {
                const isSelected = selectedRestaurant?.restaurantId === r.restaurantId;
                return (
                  <div key={r.restaurantId} onClick={() => handleSelectRestaurant(r)} style={{
                    padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer', position: 'relative',
                    border: `2px solid ${isSelected ? 'var(--secondary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(16,185,129,0.08)' : 'var(--surface)',
                    transition: 'all 0.25s',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 20px rgba(16,185,129,0.2)' : 'none'
                  }}>
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '10px', right: '10px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}><Check size={13} style={{ color: '#fff' }} /></div>
                    )}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '0.75rem', marginBottom: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.1)',
                      color: isSelected ? 'var(--secondary)' : 'var(--text-muted)'
                    }}><ChefHat size={24} /></div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                      {r.name}
                    </div>
                    {r.location && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        📍 {r.location}
                      </div>
                    )}
                    {r.openingTime && r.closingTime && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        🕐 {r.openingTime} – {r.closingTime}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ STEP 3: Table + Date / Time / Persons (cafeteria only) ══ */}
      {step === 3 && diningLocation === 'cafeteria' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button onClick={() => { setStep(2); setSelectedTableId(null); setAvailability(null); setBookingDate(''); setBookingTime(''); }} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem',
              padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem'
            }}><ArrowLeft size={14} /> Back</button>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--secondary)' }} /> Book a Table at {selectedRestaurant?.name}
            </h3>
          </div>

          {/* Date / Time / Persons row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem',
            marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '0.875rem',
            background: 'var(--background)', border: '1px solid var(--border)'
          }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Calendar size={13} /> Date
              </label>
              <input type="date" min={todayStr} value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                style={{ ...iStyle, fontSize: '0.88rem', padding: '0.6rem 0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Clock size={13} /> Time
              </label>
              <input type="time" value={bookingTime}
                onChange={e => setBookingTime(e.target.value)}
                style={{ ...iStyle, fontSize: '0.88rem', padding: '0.6rem 0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Users size={13} /> Persons
              </label>
              <select value={persons} onChange={e => setPersons(parseInt(e.target.value))}
                style={{ ...iStyle, fontSize: '0.88rem', padding: '0.6rem 0.75rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n =>
                  <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>
                )}
              </select>
            </div>
          </div>

          {/* Tables grid */}
          {tablesLoading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading tables...</p>
          ) : tables.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No tables found for this restaurant.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {tables.map(table => {
                const ts = getTableStyle(table);
                const isOccupied = table.status === 'occupied' || table.availableSeats <= 0;
                const isSelected = selectedTableId === table.restaurantTableId;

                return (
                  <div key={table.restaurantTableId}
                    onClick={() => !isOccupied && setSelectedTableId(table.restaurantTableId)}
                    style={{
                      padding: '1.25rem', borderRadius: '0.875rem', position: 'relative', transition: 'all 0.2s',
                      border: isSelected ? '2px solid var(--primary)' : `1px solid ${ts.border}`,
                      background: isSelected ? 'rgba(79,70,229,0.08)' : ts.bg,
                      cursor: isOccupied ? 'not-allowed' : 'pointer', opacity: isOccupied ? 0.5 : 1,
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: isSelected ? '0 4px 20px rgba(79,70,229,0.2)' : 'none'
                    }}>
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px',
                        borderRadius: '50%', background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}><Check size={12} style={{ color: '#fff' }} /></div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '0.5rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.08)', color: ts.color, fontSize: '0.95rem'
                      }}>T{table.tableNumber}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>Table {table.tableNumber}</div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: ts.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          ● {ts.label}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {Array.from({ length: table.seatingCapacity }).map((_, i) => (
                        <div key={i} style={{
                          width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.55rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: i < table.occupiedSeats ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                          border: `1px solid ${i < table.occupiedSeats ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`
                        }}>🪑</div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 700, color: ts.color }}>{table.availableSeats ?? table.seatingCapacity}</span> / {table.seatingCapacity} seats free
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Availability feedback */}
          {selectedTableId && bookingDate && bookingTime && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '0.65rem', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 500,
              background: availabilityLoading
                ? 'rgba(100,116,139,0.08)' : availability
                  ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${availabilityLoading ? 'var(--border)' : availability ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
              color: availabilityLoading ? 'var(--text-muted)' : availability ? '#10b981' : '#ef4444'
            }}>
              {availabilityLoading
                ? '⏳ Checking availability...'
                : availability
                  ? '✅ Table is available for the selected time slot'
                  : '❌ Table is already booked for this time slot — please choose another'}
            </div>
          )}

          {/* Persons capacity warning */}
          {personsExceedsCapacity && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '0.65rem', marginBottom: '1rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#ef4444', fontSize: '0.88rem', fontWeight: 500
            }}>
              ⚠️ This table fits only {selectedTable?.seatingCapacity} persons. Please reduce persons count or choose a bigger table.
            </div>
          )}

          {/* Selected summary */}
          {selectedTableId && bookingDate && bookingTime && (
            <div style={{
              padding: '0.85rem 1.1rem', borderRadius: '0.65rem', marginBottom: '1.25rem',
              background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.2)',
              fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500
            }}>
              📋 Table {selectedTable?.tableNumber} · {bookingDate} at {bookingTime} · {persons} person{persons > 1 ? 's' : ''} · 2 hrs
            </div>
          )}

          <button onClick={handleBookTable}
            disabled={!selectedTableId || !bookingDate || !bookingTime || !availability || personsExceedsCapacity || bookingTable}
            style={{
              padding: '0.9rem 2rem', borderRadius: '0.75rem', border: 'none',
              background: (!selectedTableId || !bookingDate || !bookingTime || !availability || personsExceedsCapacity || bookingTable)
                ? 'var(--border)' : 'linear-gradient(135deg, var(--primary), #7c3aed)',
              color: (!selectedTableId || !bookingDate || !bookingTime || !availability || personsExceedsCapacity || bookingTable)
                ? 'var(--text-muted)' : '#fff',
              fontWeight: 700, fontSize: '1rem',
              cursor: (!selectedTableId || !bookingDate || !bookingTime || !availability || personsExceedsCapacity || bookingTable)
                ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}>
            {bookingTable ? 'Booking...' : <><Check size={17} /> Book Table & Continue to Menu</>}
          </button>
        </div>
      )}

      {/* ══ STEP 4: Menu ══ */}
      {step === 4 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => diningLocation === 'cafeteria' ? setStep(3) : setStep(1)} style={{
                background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem',
                padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem'
              }}><ArrowLeft size={14} /> Back</button>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
                🍜 Choose Your Food
                {bookedTable && <span style={{ fontSize: '0.78rem', color: '#10b981', marginLeft: '0.75rem', fontWeight: 500 }}>
                  · {selectedRestaurant?.name} — Table {bookedTable.tableNumber} ✓
                </span>}
                {diningLocation === 'room' && <span style={{ fontSize: '0.78rem', color: 'var(--primary)', marginLeft: '0.75rem', fontWeight: 500 }}>· In-Room Delivery</span>}
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {foodItems.filter(f => f.availability).map(item => (
              <div key={item.foodItemId} style={{
                borderRadius: '0.875rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                border: '1px solid var(--border)', background: 'var(--surface)',
                boxShadow: cart[item.foodItemId] ? '0 4px 20px rgba(79,70,229,0.13)' : 'none',
                transition: 'box-shadow 0.2s'
              }}>
                <div style={{ height: '165px', position: 'relative' }}>
                  <img src={getFoodImage(item.name)} alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {cart[item.foodItemId] && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px',
                      borderRadius: '50%', background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem'
                    }}>{cart[item.foodItemId]}</div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.72)',
                    color: '#fff', padding: '3px 7px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600
                  }}>★ 4.{Math.floor(Math.random() * 5) + 5} · 15–20 min</div>
                </div>
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.2rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{item.category}</div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{item.price.toFixed(2)}</span>
                    {cart[item.foodItemId] ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.2rem',
                        background: 'var(--background)', borderRadius: '0.5rem',
                        border: '1px solid var(--border)', padding: '0.2rem'
                      }}>
                        <button onClick={() => removeFromCart(item)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}><Minus size={16} /></button>
                        <span style={{ fontWeight: 700, width: '1.4rem', textAlign: 'center', fontSize: '0.88rem' }}>{cart[item.foodItemId]}</span>
                        <button onClick={() => addToCart(item)} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}><Plus size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="btn btn-primary"
                        style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}>ADD</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky bottom bar */}
          <div style={{
            position: 'sticky', bottom: '1rem', padding: '1.1rem 1.5rem', borderRadius: '0.875rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                {diningLocation === 'cafeteria'
                  ? `${selectedRestaurant?.name} · Table ${bookedTable?.tableNumber} · ${bookingDate} ${bookingTime}`
                  : '🏨 In-Room Delivery'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{cartTotal().toFixed(2)}
                {cartCount() > 0 && <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.4rem' }}>{cartCount()} item{cartCount() > 1 ? 's' : ''}</span>}
              </div>
            </div>
            <button onClick={handleProceedToPayment} disabled={cartTotal() === 0 || submitting} style={{
              padding: '0.85rem 1.75rem', borderRadius: '0.75rem', border: 'none',
              fontWeight: 700, fontSize: '0.95rem', color: '#fff',
              cursor: cartTotal() === 0 || submitting ? 'not-allowed' : 'pointer',
              background: cartTotal() === 0 || submitting ? 'var(--border)' : 'linear-gradient(135deg, var(--primary), #7c3aed)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}>
              {submitting ? 'Processing...' : <><CreditCard size={17} /> Proceed to Payment</>}
            </button>
          </div>
        </div>
      )}

      {/* ══ Payment Modals ══ */}
      {showPaymentChooser && <PaymentMethodModal total={cartTotal()} onSelect={handleSelectPayment} onClose={() => setShowPaymentChooser(false)} />}
      {showUpiModal && <UpiModal total={cartTotal()} onSuccess={() => handlePaymentSuccess('upi')} onBack={() => { setShowUpiModal(false); setShowPaymentChooser(true); }} />}
      {showCardModal && <CardModal type={cardType} total={cartTotal()} onSuccess={() => handlePaymentSuccess(cardType)} onBack={() => { setShowCardModal(false); setShowPaymentChooser(true); }} />}
    </div>
  );
};

export default PlaceOrder;
