import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bed, ChevronRight, LogIn, CreditCard, Calendar, X, CheckCircle, Smartphone, Lock } from 'lucide-react';
import QRCode from 'qrcode';

const API = 'http://localhost:8080/api';
const UPI_ID = 'vinaywase03@okaxis';

const MAX_BOOKING_NIGHTS = 30;
const MAX_ADVANCE_BOOKING_DAYS = 730;

const todayStr = () => new Date().toISOString().split('T')[0];
const maxDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + MAX_ADVANCE_BOOKING_DAYS);
  return d.toISOString().split('T')[0];
};
const minCheckoutStr = (checkIn) => {
  if (!checkIn) return todayStr();
  const d = new Date(checkIn);
  if (isNaN(d.getTime())) return todayStr();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
const maxCheckoutStr = (checkIn) => {
  if (!checkIn) return maxDateStr();
  const d = new Date(checkIn);
  if (isNaN(d.getTime())) return maxDateStr();
  d.setDate(d.getDate() + MAX_BOOKING_NIGHTS);
  const globalMax = new Date(maxDateStr());
  return (d < globalMax ? d : globalMax).toISOString().split('T')[0];
};
const validateDates = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 'Please select both check-in and check-out dates.';
  const today = new Date(todayStr());
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 'Invalid date format.';
  if (inDate < today) return 'Check-in date cannot be in the past.';
  if (inDate > new Date(maxDateStr())) return 'Check-in date cannot be more than 2 years in advance.';
  if (outDate <= inDate) return 'Check-out must be at least 1 day after check-in.';
  const nights = Math.round((outDate - inDate) / 86400000);
  if (nights > MAX_BOOKING_NIGHTS) return `Maximum booking is ${MAX_BOOKING_NIGHTS} nights.`;
  return '';
};

/* ─────────────────────────────────────────────
   MODAL STYLES (inline so no CSS file needed)
───────────────────────────────────────────── */
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1rem',
};
const modalStyle = {
  background: 'linear-gradient(145deg, #0f172a, #1e293b)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '1.25rem',
  width: '100%', maxWidth: '420px',
  padding: '2rem',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  position: 'relative',
  color: '#e2e8f0',
};
const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '0.5rem', color: '#e2e8f0',
  fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle = { fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', display: 'block' };
const rowStyle = { display: 'flex', gap: '0.75rem', marginBottom: '1rem' };
const payBtnStyle = (disabled) => ({
  width: '100%', padding: '0.85rem',
  background: disabled ? '#374151' : 'linear-gradient(135deg, #059669, #047857)',
  border: 'none', borderRadius: '0.65rem',
  color: '#fff', fontWeight: 700, fontSize: '1rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginTop: '1.25rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  transition: 'opacity 0.2s',
});
const closeBtnStyle = {
  position: 'absolute', top: '1rem', right: '1rem',
  background: 'rgba(255,255,255,0.08)', border: 'none',
  borderRadius: '50%', width: '2rem', height: '2rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#94a3b8',
};
const successOverlay = {
  position: 'absolute', inset: 0, borderRadius: '1.25rem',
  background: 'linear-gradient(145deg, #0f172a, #1e293b)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
  zIndex: 10,
};

/* ─────────────────────────────────────────────
   CARD MODAL (Credit + Debit)
───────────────────────────────────────────── */
const CardModal = ({ type, amount, onClose, onSuccess }) => {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

  const validate = () => {
    const e = {};
    if (card.number.replace(/\s/g, '').length !== 16) e.number = 'Enter valid 16-digit card number';
    if (!card.name.trim()) e.name = 'Cardholder name required';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Use MM/YY format';
    if (card.cvv.length < 3) e.cvv = 'Enter 3-digit CVV';
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000)); // simulate processing
    setProcessing(false);
    setDone(true);
    setTimeout(() => onSuccess(), 1200);
  };

  const isDebit = type === 'debit_card';

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <button style={closeBtnStyle} onClick={onClose}><X size={14} /></button>

        {done && (
          <div style={successOverlay}>
            <CheckCircle size={52} color="#10b981" />
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>Payment Successful!</p>
          </div>
        )}

        {/* Card type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{ background: isDebit ? 'rgba(6,182,212,0.15)' : 'rgba(99,102,241,0.15)', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CreditCard size={16} color={isDebit ? '#06b6d4' : '#818cf8'} />
            <span style={{ color: isDebit ? '#06b6d4' : '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
              {isDebit ? 'Debit Card' : 'Credit Card'}
            </span>
          </div>
          <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>${amount}</span>
        </div>

        {/* Visual card preview */}
        <div style={{
          background: isDebit
            ? 'linear-gradient(135deg, #0e7490, #164e63)'
            : 'linear-gradient(135deg, #4338ca, #312e81)',
          borderRadius: '0.85rem', padding: '1.1rem 1.25rem',
          marginBottom: '1.5rem', fontFamily: 'monospace',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem' }}>{isDebit ? 'DEBIT' : 'CREDIT'}</div>
          <div style={{ fontSize: '1.05rem', letterSpacing: '0.15em', marginBottom: '0.75rem', color: '#fff' }}>
            {card.number || '•••• •••• •••• ••••'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85 }}>
            <span>{card.name || 'CARDHOLDER NAME'}</span>
            <span>{card.expiry || 'MM/YY'}</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Card Number</label>
          <input style={{ ...inputStyle, ...(errors.number ? { borderColor: '#ef4444' } : {}) }}
            placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={e => { setCard({ ...card, number: formatCardNumber(e.target.value) }); setErrors({ ...errors, number: '' }); }}
          />
          {errors.number && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.number}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Cardholder Name</label>
          <input style={{ ...inputStyle, ...(errors.name ? { borderColor: '#ef4444' } : {}) }}
            placeholder="John Doe"
            value={card.name}
            onChange={e => { setCard({ ...card, name: e.target.value.toUpperCase() }); setErrors({ ...errors, name: '' }); }}
          />
          {errors.name && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.name}</span>}
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Expiry (MM/YY)</label>
            <input style={{ ...inputStyle, ...(errors.expiry ? { borderColor: '#ef4444' } : {}) }}
              placeholder="08/27"
              value={card.expiry}
              onChange={e => { setCard({ ...card, expiry: formatExpiry(e.target.value) }); setErrors({ ...errors, expiry: '' }); }}
            />
            {errors.expiry && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.expiry}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>CVV</label>
            <input style={{ ...inputStyle, ...(errors.cvv ? { borderColor: '#ef4444' } : {}) }}
              placeholder="•••" type="password" maxLength={4}
              value={card.cvv}
              onChange={e => { setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') }); setErrors({ ...errors, cvv: '' }); }}
            />
            {errors.cvv && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.cvv}</span>}
          </div>
        </div>

        <button style={payBtnStyle(processing)} onClick={handlePay} disabled={processing}>
          <Lock size={15} />
          {processing ? 'Processing...' : `Pay $${amount} Securely`}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', marginTop: '0.6rem' }}>
          🔒 256-bit SSL encrypted · Your card data is never stored
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   UPI MODAL
───────────────────────────────────────────── */
const UpiModal = ({ amount, onClose, onSuccess }) => {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Build UPI deep-link
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Hotel&am=${amount}&cu=INR&tn=HotelRoomBooking`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, upiUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#0f172a', light: '#f8fafc' },
      });
    }
  }, [upiUrl]);

  const handleVerify = async () => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1800));
    setVerifying(false);
    setDone(true);
    setTimeout(() => onSuccess(), 1200);
  };

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <button style={closeBtnStyle} onClick={onClose}><X size={14} /></button>

        {done && (
          <div style={successOverlay}>
            <CheckCircle size={52} color="#10b981" />
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>Payment Verified!</p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Smartphone size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>UPI Payment</span>
          </div>
          <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>${amount}</span>
        </div>

        {/* QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '0.85rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <canvas ref={canvasRef} />
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
            Scan with any UPI app<br />(GPay, PhonePe, Paytm, BHIM…)
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* UPI ID + tap to open */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.65rem', padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>Pay to UPI ID</p>
            <p style={{ fontWeight: 700, color: '#e2e8f0', margin: '0.2rem 0 0', fontFamily: 'monospace' }}>{UPI_ID}</p>
          </div>
          <a
            href={upiUrl}
            style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', padding: '0.45rem 0.85rem', borderRadius: '0.45rem', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}
          >
            Open App
          </a>
        </div>

        <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginBottom: '0.75rem' }}>
          After paying, click below to confirm your booking
        </p>

        <button style={payBtnStyle(verifying)} onClick={handleVerify} disabled={verifying}>
          <CheckCircle size={15} />
          {verifying ? 'Verifying...' : "I've Paid — Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN BOOKING COMPONENT
───────────────────────────────────────────── */
const Booking = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomId: '', checkIn: '', checkOut: '',
    checkInTime: '14:00', checkOutTime: '11:00',
    guests: 1, bookingType: 'Full Day'
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [guestError, setGuestError] = useState(''); {/* ✅ CHANGE 1: नवीन state */ }
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [activeModal, setActiveModal] = useState(null); // 'credit_card' | 'debit_card' | 'upi'
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const storedCustomerId = localStorage.getItem('customerId');

  useEffect(() => {
    axios.get(`${API}/rooms/available`).then(res => {
      const fetchedRooms = res.data || [];
      setRooms(fetchedRooms);
      if (location.state?.roomId) {
        const room = fetchedRooms.find(r => r.roomId === location.state.roomId);
        if (room && room.status !== 'maintenance') {
          setSelectedRoom(room);
          setForm(prev => ({ ...prev, roomId: room.roomId }));
          setStep(2);
        }
      }
    }).catch(() => { });
  }, [location.state]);

  const calcNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000);
    return diff > 0 && diff <= MAX_BOOKING_NIGHTS ? diff : 0;
  };
  const nights = calcNights();
  const totalCost = (selectedRoom && nights > 0)
    ? (nights * parseFloat(selectedRoom.pricePerNight || 0)).toFixed(2)
    : '0.00';

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    const newCheckOut = (form.checkOut && form.checkOut <= newCheckIn) ? '' : form.checkOut;
    setForm({ ...form, checkIn: newCheckIn, checkOut: newCheckOut });
    setDateError('');
  };

  // ✅ CHANGE 2: guest capacity check added
  const handleContinueToPayment = () => {
    const err = validateDates(form.checkIn, form.checkOut);
    if (err) { setDateError(err); return; }
    setDateError('');

    const capacity = selectedRoom?.capacity || 1;
    if (parseInt(form.guests) > capacity) {
      setGuestError(`This room allows maximum ${capacity} guest${capacity > 1 ? 's' : ''}. Please select ${capacity} or fewer.`);
      return;
    }
    setGuestError('');

    setStep(3);
  };

  // Called when a payment method button is clicked in step 3
  const handlePayClick = () => {
    if (!isLoggedIn) { localStorage.setItem('redirectAfterLogin', '/booking'); navigate('/login'); return; }
    setActiveModal(paymentMethod);
  };

  // Called after modal confirms payment — now actually POST to backend
  const handlePaymentSuccess = async () => {
    setActiveModal(null);
    setError('');
    setSubmitting(true);
    try {
      // 1. Reservation
      const resPayload = {
        customerId: storedCustomerId ? parseInt(storedCustomerId) : 1,
        roomId: selectedRoom.roomId,
        checkInDate: form.checkIn,
        checkOutDate: form.checkOut,
        checkInTime: form.checkInTime + ':00',
        checkOutTime: form.checkOutTime + ':00',
        totalCost: parseFloat(totalCost),
        status: 'pending',
        bookingType: form.bookingType
      };
      const resResponse = await axios.post(`${API}/rooms/book`, resPayload);
      const newReservation = resResponse.data;

      // 2. Bill
      const billResponse = await axios.post(`${API}/bills/generate`, {
        customerId: parseInt(storedCustomerId),
        serviceType: 'Room',
        referenceId: newReservation.reservationId,
        amount: parseFloat(totalCost)
      });
      const newBill = billResponse.data;

      // 3. Payment — paymentMethod stored as-is: 'credit_card' | 'debit_card' | 'upi'
      await axios.post(`${API}/payments`, {
        billId: newBill.billId,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod,   // e.g. "upi", "credit_card", "debit_card"
        amountPaid: parseFloat(totalCost),
      });

      setSubmitted(true);
      setStep(1);
      setSelectedRoom(null);
      setGuestError('');
      setForm({ roomId: '', checkIn: '', checkOut: '', checkInTime: '14:00', checkOutTime: '11:00', guests: 1, bookingType: 'Full Day' });
    } catch (err) {
      setError('Booking failed: ' + (err.response?.data?.message || err.response?.data || err.message));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ CHANGE 3: room बदलल्यावर guestError reset
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setForm({ ...form, roomId: room.roomId });
    setGuestError('');
  };

  const paymentOptions = [
    { id: 'credit_card', label: 'Credit Card', icon: '💳', color: '#818cf8' },
    { id: 'debit_card', label: 'Debit Card', icon: '🏦', color: '#06b6d4' },
    { id: 'upi', label: 'UPI / QR', icon: '📱', color: '#10b981' },
  ];

  return (
    <div className="page-wrapper">
      {/* Modals */}
      {activeModal === 'credit_card' && (
        <CardModal type="credit_card" amount={totalCost} onClose={() => setActiveModal(null)} onSuccess={handlePaymentSuccess} />
      )}
      {activeModal === 'debit_card' && (
        <CardModal type="debit_card" amount={totalCost} onClose={() => setActiveModal(null)} onSuccess={handlePaymentSuccess} />
      )}
      {activeModal === 'upi' && (
        <UpiModal amount={totalCost} onClose={() => setActiveModal(null)} onSuccess={handlePaymentSuccess} />
      )}

      <div className="page-hero" style={{ background: 'linear-gradient(135deg, #064e3b, #047857)' }}>
        <h1>Book Your Stay</h1>
        <p>Reserve your perfect room and experience luxury at its finest</p>
      </div>

      <div className="container section">
        {!isLoggedIn && (
          <div className="card glass mb-6 animate-fade-in" style={{ textAlign: 'center', padding: '2rem', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
            <LogIn size={32} style={{ color: '#f59e0b', marginBottom: '0.75rem' }} />
            <h3 style={{ color: '#f59e0b' }}>Login Required</h3>
            <p>You need to be logged in to book a room. Your selection will be saved.</p>
            <button className="btn btn-primary mt-4" onClick={() => { localStorage.setItem('redirectAfterLogin', '/booking'); navigate('/login'); }}>
              <LogIn size={16} /> Login to Book
            </button>
          </div>
        )}

        {submitted && (
          <div className="success-message animate-fade-in mb-6" style={{ textAlign: 'center', padding: '2rem' }}>
            ✓ <strong>Reservation submitted successfully!</strong><br />
            Your booking is pending approval by our staff. You'll receive confirmation shortly.
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <div className="booking-steps mb-6">
          <div className={`booking-step ${step >= 1 ? 'active' : ''}`}><span>1</span> Select Room</div>
          <div className="booking-step-line" />
          <div className={`booking-step ${step >= 2 ? 'active' : ''}`}><span>2</span> Details</div>
          <div className="booking-step-line" />
          <div className={`booking-step ${step >= 3 ? 'active' : ''}`}><span>3</span> Payment</div>
        </div>

        <div className="booking-layout">
          <div className="booking-rooms">
            <h3 className="mb-4">
              {step === 1 ? 'Select a Room' : step === 2 ? 'Reservation Details' : 'Payment'}
            </h3>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="booking-room-list">
                {rooms.map((room, idx) => (
                  <div key={idx}
                    className={`booking-room-item ${selectedRoom?.roomId === room.roomId ? 'selected' : ''} ${room.status === 'maintenance' ? 'room-unavailable' : ''}`}
                    onClick={() => room.status !== 'maintenance' && handleRoomSelect(room)}>
                    <div className="booking-room-icon"><Bed size={24} /></div>
                    <div className="booking-room-info">
                      <h4>Room {room.roomNumber} — {room.roomType}</h4>
                      <p>Capacity: {room.capacity} guests</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="booking-room-price">${room.pricePerNight}/night</span>
                      <div className={`room-status-tag ${room.status === 'maintenance' ? 'tag-occupied' : 'tag-available'}`}>
                        {room.status === 'maintenance' ? '✗ Maintenance' : '✓ Available'}
                      </div>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && <p className="text-text-muted">Loading rooms...</p>}
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="card mb-4" style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.2)' }}>
                  <div className="flex items-center gap-4">
                    <Bed size={24} className="text-primary" />
                    <div>
                      <strong>Room {selectedRoom?.roomNumber} — {selectedRoom?.roomType}</strong>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>${selectedRoom?.pricePerNight}/night · {selectedRoom?.capacity} guests</p>
                    </div>
                  </div>
                </div>

                <div className="form-row mb-4">
                  <div className="form-group">
                    <label>Check-in Date</label>
                    <input type="date" value={form.checkIn} min={todayStr()} max={maxDateStr()} onChange={handleCheckInChange} required />
                  </div>
                  <div className="form-group">
                    <label>Check-out Date</label>
                    <input type="date" value={form.checkOut} min={minCheckoutStr(form.checkIn)} max={maxCheckoutStr(form.checkIn)} onChange={e => { setForm({ ...form, checkOut: e.target.value }); setDateError(''); }} required />
                  </div>
                </div>

                {dateError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    ⚠ {dateError}
                  </div>
                )}

                {nights > 0 && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', padding: '0.6rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    ✓ {nights} night{nights > 1 ? 's' : ''} · Estimated total: <strong>${(nights * parseFloat(selectedRoom?.pricePerNight || 0)).toFixed(2)}</strong>
                  </div>
                )}

                <div className="form-row mb-4">
                  <div className="form-group">
                    <label>Check-in Time</label>
                    <input type="time" value={form.checkInTime} onChange={e => setForm({ ...form, checkInTime: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Check-out Time</label>
                    <input type="time" value={form.checkOutTime} onChange={e => setForm({ ...form, checkOutTime: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group mb-4">
                  <label>Booking Type</label>
                  <select value={form.bookingType} onChange={e => setForm({ ...form, bookingType: e.target.value })} required>
                    {['Day', 'Night', 'Full Day', 'Half Day', 'Full Night'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ CHANGE 4: Number of Guests — inline validation */}
                <div className="form-group">
                  <label>Number of Guests</label>
                  <select
                    value={form.guests}
                    onChange={e => {
                      const selected = parseInt(e.target.value);
                      const capacity = selectedRoom?.capacity || 1;
                      setForm({ ...form, guests: selected });
                      if (selected > capacity) {
                        setGuestError(`This room allows maximum ${capacity} guest${capacity > 1 ? 's' : ''}. Please select ${capacity} or fewer.`);
                      } else {
                        setGuestError('');
                      }
                    }}
                    style={{ borderColor: guestError ? '#ef4444' : '' }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>

                  {/* Capacity hint — always visible */}
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', marginBottom: 0 }}>
                    Room capacity: <strong style={{ color: '#94a3b8' }}>{selectedRoom?.capacity} guest{selectedRoom?.capacity > 1 ? 's' : ''}</strong>
                  </p>

                  {/* Error — only when guests > capacity */}
                  {guestError && (
                    <div style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '0.5rem',
                      marginTop: '0.5rem',
                      fontSize: '0.85rem',
                    }}>
                      ⚠ {guestError}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" disabled={!form.checkIn || !form.checkOut} onClick={handleContinueToPayment}>
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h4 className="mb-4">Select Payment Method</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {paymentOptions.map(m => (
                    <label
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: `2px solid ${paymentMethod === m.id ? m.color : 'rgba(255,255,255,0.08)'}`,
                        background: paymentMethod === m.id ? `rgba(${m.color === '#818cf8' ? '129,140,248' : m.color === '#06b6d4' ? '6,182,212' : '16,185,129'},0.08)` : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ display: 'none' }} />
                      <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                      <span style={{ fontWeight: 600, color: paymentMethod === m.id ? m.color : '#e2e8f0' }}>{m.label}</span>
                      {paymentMethod === m.id && (
                        <span style={{ marginLeft: 'auto', background: m.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px' }}>Selected</span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={handlePayClick}
                    disabled={submitting}
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Processing...' : `Pay $${totalCost} →`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── SUMMARY SIDEBAR ── */}
          <div className="booking-form-wrapper">
            <div className="card glass">
              <h3 className="mb-6"><Calendar size={20} /> Booking Summary</h3>
              {selectedRoom ? (
                <>
                  <div className="summary-row"><span>Room</span><span>{selectedRoom.roomType} #{selectedRoom.roomNumber}</span></div>
                  {form.checkIn && <div className="summary-row"><span>Check-in</span><span>{form.checkIn} at {form.checkInTime}</span></div>}
                  {form.checkOut && <div className="summary-row"><span>Check-out</span><span>{form.checkOut} at {form.checkOutTime}</span></div>}
                  {nights > 0 && <div className="summary-row"><span>Nights</span><span>{nights}</span></div>}
                  <div className="summary-row"><span>Price/Night</span><span>${selectedRoom.pricePerNight}</span></div>
                  <div className="summary-row"><span>Booking Type</span><span className="font-bold text-primary">{form.bookingType}</span></div>
                  {nights > 0
                    ? <div className="summary-row total"><span>Total</span><span>${totalCost}</span></div>
                    : form.checkIn && form.checkOut && (
                      <div className="summary-row" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                        <span>Total</span><span>— (invalid dates)</span>
                      </div>
                    )
                  }
                  {step === 3 && (
                    <div className="summary-row">
                      <span>Payment</span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {paymentOptions.find(p => p.id === paymentMethod)?.label}
                      </span>
                    </div>
                  )}
                  {step === 1 && selectedRoom.status !== 'maintenance' && (
                    <button
                      className="btn btn-primary w-full mt-4"
                      onClick={() => isLoggedIn ? setStep(2) : (localStorage.setItem('redirectAfterLogin', '/booking'), navigate('/login'))}
                    >
                      {isLoggedIn ? 'Continue Booking' : 'Login to Book'} <ChevronRight size={16} />
                    </button>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  Select a room to see booking details
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;