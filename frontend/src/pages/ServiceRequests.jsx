import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Plus, CreditCard, CheckCircle, Trash2, X, Smartphone, Lock } from 'lucide-react';
import QRCode from 'qrcode';

const SERVICE_TYPES = [
  { name: 'Room Cleaning', price: 25.00 },
  { name: 'Extra Towels', price: 5.00 },
  { name: 'Extra Pillows', price: 5.00 },
  { name: 'Room Service', price: 15.00 },
  { name: 'Maintenance', price: 0.00 },
  { name: 'Wake Up Call', price: 0.00 },
  { name: 'Taxi Booking', price: 30.00 },
  { name: 'Luggage Assistance', price: 10.00 },
  { name: 'Laundry Service', price: 20.00 },
  { name: 'Other', price: 0.00 }
];

const UPI_ID = 'vinaywase03@okaxis';

/* ─── Modal Styles (Booking.jsx sarkhe ch) ─── */
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

/* ─── Card Modal (Credit + Debit) ─── */
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
    await new Promise(r => setTimeout(r, 2000));
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

/* ─── UPI Modal ─── */
const UpiModal = ({ amount, onClose, onSuccess }) => {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Hotel&am=${amount}&cu=INR&tn=ServiceRequest`;

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

        {/* UPI ID */}
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
          After paying, click below to confirm your request
        </p>

        <button style={payBtnStyle(verifying)} onClick={handleVerify} disabled={verifying}>
          <CheckCircle size={15} />
          {verifying ? 'Verifying...' : "I've Paid — Confirm Request"}
        </button>
      </div>
    </div>
  );
};

/* ─── Payment Method Selector Modal ─── */
const PaymentSelectorModal = ({ amount, onClose, onMethodSelect }) => {
  const methods = [
    { id: 'credit_card', label: 'Credit Card', icon: <CreditCard size={22} color="#818cf8" />, desc: 'Visa, Mastercard, Amex', color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
    { id: 'debit_card', label: 'Debit Card', icon: <CreditCard size={22} color="#06b6d4" />, desc: 'Any bank debit card', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { id: 'upi', label: 'UPI / QR Code', icon: <Smartphone size={22} color="#10b981" />, desc: 'GPay, PhonePe, Paytm', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <button style={closeBtnStyle} onClick={onClose}><X size={14} /></button>

        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.15rem', fontWeight: 700 }}>Choose Payment Method</h3>
        <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Service charge: <span style={{ color: '#10b981', fontWeight: 700 }}>${amount}</span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {methods.map(m => (
            <button
              key={m.id}
              onClick={() => onMethodSelect(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                background: m.bg,
                border: `1px solid ${m.color}40`,
                borderRadius: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#e2e8f0',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = m.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${m.color}40`}
            >
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0.6rem', padding: '0.5rem', display: 'flex' }}>
                {m.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: m.color }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{m.desc}</p>
              </div>
              <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '1.1rem' }}>›</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569', marginTop: '1.25rem' }}>
          🔒 Secure & encrypted payment
        </p>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [requestType, setRequestType] = useState('Room Cleaning');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState('');

  // Payment modal state
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showCardModal, setShowCardModal] = useState(null); // 'credit_card' | 'debit_card'
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState('credit_card');

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const getServicePrice = (type) => {
    const svc = SERVICE_TYPES.find(s => s.name === type);
    return svc ? svc.price : 0;
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/service-requests', getHeaders());
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching service requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const currentPrice = getServicePrice(requestType);

  // "Pay & Submit" click — open selector modal if price > 0
  const handlePayClick = (e) => {
    e.preventDefault();
    if (currentPrice > 0) {
      setShowPaymentSelector(true);
    } else {
      submitRequest('free');
    }
  };

  // Payment method selected from selector
  const handleMethodSelect = (method) => {
    setShowPaymentSelector(false);
    setPendingPaymentMethod(method);
    if (method === 'upi') {
      setShowUpiModal(true);
    } else {
      setShowCardModal(method);
    }
  };

  // Called after payment modal success
  const handlePaymentSuccess = () => {
    setShowCardModal(null);
    setShowUpiModal(false);
    submitRequest(pendingPaymentMethod);
  };

  const submitRequest = async (paymentMethod) => {
    setSubmitting(true);
    try {
      const storedCustomerId = localStorage.getItem('customerId');
      const payload = {
        customerId: storedCustomerId ? parseInt(storedCustomerId) : 1,
        requestType,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };
      const svcRes = await axios.post('http://localhost:8080/api/service-requests', payload, getHeaders());
      const newService = svcRes.data;

      const price = getServicePrice(requestType);
      if (price > 0) {
        const billGenPayload = {
          customerId: storedCustomerId ? parseInt(storedCustomerId) : 1,
          serviceType: 'Service',
          referenceId: newService.serviceRequestId,
          amount: price
        };
        const billRes = await axios.post('http://localhost:8080/api/bills/generate', billGenPayload, getHeaders());
        const newBill = billRes.data;

        const paymentPayload = {
          billId: newBill.billId,
          paymentDate: new Date().toISOString(),
          paymentMethod,
          amountPaid: price
        };
        await axios.post('http://localhost:8080/api/payments', paymentPayload, getHeaders());
      }

      setSuccessType(requestType);
      setSuccess(true);
      setShowForm(false);
      setRequestType('Room Cleaning');
      fetchRequests();
    } catch (err) {
      console.error("Failed to submit request", err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service request?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/service-requests/${id}`, getHeaders());
      alert("Service request deleted successfully.");
      fetchRequests();
    } catch (error) {
      alert("Error deleting request: " + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
      case 'pending': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
      case 'in-progress': return { bg: 'rgba(79,70,229,0.15)', color: '#4F46E5' };
      default: return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
    }
  };

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="flex items-center gap-2 m-0"><Bell className="text-primary" /> Service Requests</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setSuccess(false); }}>
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-6 rounded-lg animate-fade-in text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
          </div>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Request Submitted Successfully! ✅</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            Your <strong>{successType}</strong> request has been sent to our staff.
            {successType === 'Room Cleaning' && ' Our housekeeping team will arrive at your room within 15-20 minutes.'}
            {successType === 'Extra Towels' && ' Fresh towels will be delivered to your room in 10 minutes.'}
            {successType === 'Extra Pillows' && ' Extra pillows will be delivered to your room in 10 minutes.'}
            {successType === 'Room Service' && ' Our room service team will attend to you within 15-20 minutes.'}
            {successType === 'Maintenance' && ' Our maintenance team will be at your room shortly.'}
            {successType === 'Wake Up Call' && ' Your wake up call has been scheduled.'}
            {successType === 'Taxi Booking' && ' Your taxi will be arranged and you will be notified when it arrives.'}
            {successType === 'Luggage Assistance' && ' A porter will be at your room within 5-10 minutes.'}
            {successType === 'Laundry Service' && ' Our laundry team will collect your items within 20 minutes.'}
            {successType === 'Other' && ' Our staff will attend to your request shortly.'}
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handlePayClick} className="mb-6 p-6 rounded-lg" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Raise a Service Request</h3>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Request Type</label>
            <select
              value={requestType}
              onChange={e => setRequestType(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
            >
              {SERVICE_TYPES.map(svc => (
                <option key={svc.name} value={svc.name}>{svc.name} {svc.price > 0 ? `— $${svc.price.toFixed(2)}` : '— Free'}</option>
              ))}
            </select>
          </div>

          {/* Service charge display */}
          {currentPrice > 0 && (
            <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Service Charge:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>${currentPrice.toFixed(2)}</span>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                💳 You'll choose your payment method on the next step
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : currentPrice > 0 ? `Pay $${currentPrice.toFixed(2)} & Submit` : 'Submit Request'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* ── Payment Modals ── */}
      {showPaymentSelector && (
        <PaymentSelectorModal
          amount={currentPrice.toFixed(2)}
          onClose={() => setShowPaymentSelector(false)}
          onMethodSelect={handleMethodSelect}
        />
      )}
      {showCardModal && (
        <CardModal
          type={showCardModal}
          amount={currentPrice.toFixed(2)}
          onClose={() => setShowCardModal(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {showUpiModal && (
        <UpiModal
          amount={currentPrice.toFixed(2)}
          onClose={() => setShowUpiModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-text-muted py-8">Loading requests...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Request Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map((r, idx) => {
                const sc = getStatusColor(r.status);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>#{r.serviceRequestId}</td>
                    <td style={{ padding: '1rem' }}>{r.requestType}</td>
                    <td style={{ padding: '1rem' }}>{r.requestDate ? new Date(r.requestDate).toLocaleString() : 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px' }} onClick={() => handleDeleteRequest(r.serviceRequestId)} title="Delete Request">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No service requests found. Click "New Request" to raise one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;