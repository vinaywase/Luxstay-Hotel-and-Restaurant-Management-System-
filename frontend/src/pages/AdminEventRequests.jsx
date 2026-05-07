import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, DollarSign, Filter, Search, User, Mail, Phone, MessageSquare, Info } from 'lucide-react';

const API = 'http://localhost:8080/api';

const AdminEventRequests = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [filter, setFilter] = useState('PENDING');
    const [showStatusModal, setShowStatusModal] = useState(false);
    
    // Status update state
    const [newStatus, setNewStatus] = useState('');
    const [cost, setCost] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API}/event-bookings`);
            setBookings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            const payload = {
                status: newStatus,
                rejectionReason: reason,
                totalCost: cost ? parseFloat(cost) : null
            };
            await axios.patch(`${API}/event-bookings/${selectedBooking.bookingId}/status`, payload);
            setShowStatusModal(false);
            fetchBookings();
            setSelectedBooking(null);
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const openStatusModal = (booking, status) => {
        setSelectedBooking(booking);
        setNewStatus(status);
        setCost(booking.totalCost || '');
        setReason(booking.rejectionReason || '');
        setShowStatusModal(true);
    };

    const filteredBookings = filter === 'ALL' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'var(--warning)';
            case 'APPROVED': return 'var(--primary)';
            case 'CONFIRMED': return 'var(--success)';
            case 'REJECTED': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };

    if (loading) return <div className="p-8 text-center">Loading event requests...</div>;

    return (
        <div className="animate-fade-in relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Event Requests Management</h2>
                    <p className="text-text-muted">Review and process customer event bookings</p>
                </div>
                <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
                    {['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'REJECTED'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5'}`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map((booking) => (
                    <div key={booking.bookingId} className="card glass hover:border-primary/50 transition-colors">
                        <div className="p-5">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                {/* Left: Basic Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary">
                                            {booking.eventType}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: getStatusColor(booking.status) }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusColor(booking.status) }}></span>
                                            {booking.status}
                                        </div>
                                        <span className="text-xs text-text-muted ml-auto lg:ml-0">Submitted: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                                            {booking.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{booking.fullName}</h3>
                                            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                                                <span className="text-xs text-text-muted flex items-center gap-1"><Mail size={12} /> {booking.email}</span>
                                                <span className="text-xs text-text-muted flex items-center gap-1"><Phone size={12} /> {booking.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Event Specs */}
                                <div className="flex-1 grid grid-cols-2 gap-4 border-l border-r border-border/30 px-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Date & Time</p>
                                        <p className="text-sm flex items-center gap-2"><Calendar size={14} className="text-primary" /> {booking.eventDate}</p>
                                        <p className="text-sm flex items-center gap-2 mt-1"><Clock size={14} className="text-primary" /> {booking.eventTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Venue & Guests</p>
                                        <p className="text-sm flex items-center gap-2"><MapPin size={14} className="text-primary" /> {booking.venuePreference}</p>
                                        <p className="text-sm flex items-center gap-2 mt-1"><User size={14} className="text-primary" /> {booking.guestCount} Guests</p>
                                    </div>
                                </div>

                                {/* Right: Actions & Financials */}
                                <div className="lg:w-64 flex flex-col justify-between">
                                    <div className="text-right mb-4">
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Budget / Cost</p>
                                        <p className="text-lg font-bold text-success">
                                            {booking.totalCost ? `$${booking.totalCost}` : booking.budgetRange}
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => openStatusModal(booking, 'APPROVED')}
                                                    className="btn btn-primary flex-1 py-1.5 text-xs gap-1.5"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => openStatusModal(booking, 'REJECTED')}
                                                    className="btn btn-ghost flex-1 py-1.5 text-xs gap-1.5 border border-danger/30 text-danger hover:bg-danger/10"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'APPROVED' && (
                                            <button 
                                                onClick={() => openStatusModal(booking, 'CONFIRMED')}
                                                className="btn btn-primary w-full py-1.5 text-xs gap-1.5"
                                            >
                                                <CheckCircle size={14} /> Confirm Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {booking.specialRequirements && (
                                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 flex gap-3">
                                    <MessageSquare size={16} className="text-primary shrink-0" />
                                    <p className="text-sm text-text-muted italic">"{booking.specialRequirements}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="card glass max-w-md w-full p-8 shadow-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Update Booking Status</h3>
                            <button onClick={() => setShowStatusModal(false)}><XCircle size={24} className="text-text-muted" /></button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg mb-6">
                                <Info size={20} className="text-primary" />
                                <p className="text-sm">Changing status to <strong className="text-primary">{newStatus}</strong></p>
                            </div>

                            {newStatus === 'APPROVED' && (
                                <div className="form-group">
                                    <label>Estimated Total Cost ($)</label>
                                    <input 
                                        type="number" 
                                        value={cost} 
                                        onChange={(e) => setCost(e.target.value)} 
                                        placeholder="Enter cost for customer payment"
                                        className="w-full"
                                    />
                                    <p className="text-[10px] text-text-muted mt-1">Customer will be notified to pay this amount.</p>
                                </div>
                            )}

                            {newStatus === 'REJECTED' && (
                                <div className="form-group">
                                    <label>Rejection Reason</label>
                                    <textarea 
                                        value={reason} 
                                        onChange={(e) => setReason(e.target.value)} 
                                        placeholder="Why was this request rejected?"
                                        rows="3"
                                        className="w-full"
                                    ></textarea>
                                </div>
                            )}

                            {newStatus === 'CONFIRMED' && (
                                <p className="text-sm text-text-muted">Confirming this booking will mark it as finalized in the schedule.</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button className="btn btn-ghost flex-1" onClick={() => setShowStatusModal(false)}>Cancel</button>
                            <button className="btn btn-primary flex-1" onClick={handleUpdateStatus}>Confirm Status</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventRequests;
