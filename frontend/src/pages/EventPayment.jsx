import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Smartphone, CheckCircle, ArrowLeft, DollarSign, Calendar, MapPin, Sparkles, Lock, X, Clock } from 'lucide-react';
import QRCode from 'qrcode';

const API = 'http://localhost:8080/api';
const UPI_ID = 'vinaywase03@okaxis';

/* ─── Standard Modal Styles (Project standardized pattern) ─── */
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: isDebit ? 'rgba(6,182,212,0.15)' : 'rgba(99,102,241,0.15)', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CreditCard size={16} color={isDebit ? '#06b6d4' : '#818cf8'} />
                        <span style={{ color: isDebit ? '#06b6d4' : '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
                            {isDebit ? 'Debit Card' : 'Credit Card'}
                        </span>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>${amount}</span>
                </div>
                <div style={{
                    background: isDebit ? 'linear-gradient(135deg, #0e7490, #164e63)' : 'linear-gradient(135deg, #4338ca, #312e81)',
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
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Hotel&am=${amount}&cu=INR&tn=EventBookingPayment`;

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, upiUrl, {
                width: 200, margin: 2,
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '0.85rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <canvas ref={canvasRef} />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>Scan with any UPI app</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.65rem', padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>Pay to UPI ID</p>
                        <p style={{ fontWeight: 700, color: '#e2e8f0', margin: '0.2rem 0 0', fontFamily: 'monospace' }}>{UPI_ID}</p>
                    </div>
                    <a href={upiUrl} style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', padding: '0.45rem 0.85rem', borderRadius: '0.45rem', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Open App</a>
                </div>
                <button style={payBtnStyle(verifying)} onClick={handleVerify} disabled={verifying}>
                    <CheckCircle size={15} />
                    {verifying ? 'Verifying...' : "I've Paid — Confirm Request"}
                </button>
            </div>
        </div>
    );
};

/* ─── Main Component ─── */
const EventPayment = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [activeModal, setActiveModal] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const res = await axios.get(`${API}/event-bookings/${bookingId}`);
            setBooking(res.data);
        } catch (err) {
            console.error('Failed to fetch booking', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = () => {
        setActiveModal(paymentMethod);
    };

    const handlePaymentSuccess = async () => {
        setActiveModal(null);
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Update Booking Status to PAYMENT_DONE
            await axios.patch(`${API}/event-bookings/${bookingId}/status`, {
                status: 'PAYMENT_DONE'
            }, headers);

            // 2. Generate Bill (using standardized /generate endpoint)
            const billRes = await axios.post(`${API}/bills/generate`, {
                customerId: booking.customerId,
                serviceType: 'Event',
                referenceId: booking.bookingId,
                amount: booking.totalCost
            }, headers);

            // 3. Create Payment Record
            await axios.post(`${API}/payments`, {
                billId: billRes.data.billId,
                paymentDate: new Date().toISOString(),
                paymentMethod: paymentMethod,
                amountPaid: booking.totalCost
            }, headers);

            setSuccess(true);
            setTimeout(() => {
                navigate('/customer/my-events');
            }, 3000);
        } catch (err) {
            alert('Payment processing failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading booking details...</div>;
    if (!booking) return <div className="p-8 text-center">Booking not found.</div>;

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
                <div className="card glass p-8 max-w-md w-full">
                    <CheckCircle size={64} className="text-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                    <p className="text-text-muted mb-6">Your event booking is now confirmed. Redirecting you to your bookings...</p>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <div className="bg-success h-full animate-[progress_3s_linear]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto py-8 px-4">
            {/* Modals */}
            {activeModal === 'credit_card' && (
                <CardModal type="credit_card" amount={booking.totalCost} onClose={() => setActiveModal(null)} onSuccess={handlePaymentSuccess} />
            )}
            {activeModal === 'debit_card' && (
                <CardModal type="debit_card" amount={booking.totalCost} onClose={() => setActiveModal(null)} onSuccess={handlePaymentSuccess} />
            )}
            {activeModal === 'upi' && (
                <UpiModal amount={booking.totalCost} onClose={() => setActiveModal(null)} onSuccess={handlePaymentSuccess} />
            )}

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back to Bookings
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card glass p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Sparkles size={20} className="text-primary" /> Event Summary
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Event Type</p>
                                    <p className="font-semibold text-lg">{booking.eventType}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Date & Time</p>
                                    <p className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {booking.eventDate}</p>
                                    <p className="flex items-center gap-2 mt-1"><Clock size={16} className="text-primary" /> {booking.eventTime}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Venue</p>
                                    <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {booking.venuePreference}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Cost</p>
                                    <p className="text-2xl font-bold text-success flex items-center gap-1"><DollarSign size={24} /> {booking.totalCost}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass p-6">
                        <h3 className="text-xl font-bold mb-6">Payment Method</h3>
                        <div className="space-y-3">
                            {[
                                { id: 'credit_card', label: 'Credit Card', icon: <CreditCard size={20} />, color: '#818cf8', desc: 'Visa, Mastercard, Amex' },
                                { id: 'debit_card', label: 'Debit Card', icon: <CreditCard size={20} />, color: '#06b6d4', desc: 'Any bank debit card' },
                                { id: 'upi', label: 'UPI / QR Code', icon: <Smartphone size={20} />, color: '#10b981', desc: 'GPay, PhonePe, Paytm' }
                            ].map((method) => (
                                <label 
                                    key={method.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                    onClick={() => setPaymentMethod(method.id)}
                                >
                                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === method.id} onChange={() => {}} />
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: method.color + '20', color: method.color }}>
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{method.label}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{method.desc}</p>
                                    </div>
                                    {paymentMethod === method.id && <CheckCircle size={20} className="text-primary" />}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Checkout */}
                <div className="space-y-6">
                    <div className="card glass p-6 sticky top-24">
                        <h3 className="text-lg font-bold mb-4">Price Breakdown</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Event Service Fee</span>
                                <span>${(booking.totalCost * 0.9).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Taxes & Charges (10%)</span>
                                <span>${(booking.totalCost * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                                <span>Total Amount</span>
                                <span className="text-success">${booking.totalCost}</span>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary w-full py-4 font-bold text-lg gap-3"
                            onClick={handlePayClick}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : <><Lock size={20} /> Pay Now</>}
                        </button>
                        
                        <p className="text-[10px] text-center text-text-muted mt-4 uppercase tracking-tighter">
                            🔒 256-bit SSL Secure Payment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPayment;
