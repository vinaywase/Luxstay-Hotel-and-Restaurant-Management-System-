import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Tag, AlertCircle, CheckCircle, Search, Filter, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:8080/api';

const MyEventBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const customerId = localStorage.getItem('customerId');

    useEffect(() => {
        if (customerId) {
            fetchBookings();
        }
    }, [customerId]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API}/event-bookings/customer/${customerId}`);
            setBookings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'var(--warning)';
            case 'APPROVED': return 'var(--primary)';
            case 'PAYMENT_PENDING': return '#f59e0b';
            case 'PAYMENT_DONE': return '#10b981';
            case 'CONFIRMED': return 'var(--success)';
            case 'REJECTED': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };

    const filteredBookings = filter === 'ALL' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    if (loading) return <div className="p-8 text-center">Loading your event requests...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold">My Event Bookings</h2>
                    <p className="text-text-muted">Track your celebration requests and status</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
                        {['ALL', 'PENDING', 'APPROVED', 'CONFIRMED'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5'}`}
                            >
                                {f.charAt(0) + f.slice(1).toLowerCase().replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredBookings.map((booking) => (
                    <div key={booking.bookingId} className="card glass overflow-hidden border-l-4" style={{ borderLeftColor: getStatusColor(booking.status) }}>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary">
                                            {booking.eventType}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-sm" style={{ color: getStatusColor(booking.status) }}>
                                            <div className="w-2 h-2 rounded-full" style={{ background: getStatusColor(booking.status) }}></div>
                                            <span className="font-bold">{booking.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{booking.fullName}'s {booking.eventType}</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2 text-sm text-text-muted">
                                            <Calendar size={16} /> {booking.eventDate}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-text-muted">
                                            <Clock size={16} /> {booking.eventTime}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-text-muted">
                                            <MapPin size={16} /> {booking.venuePreference}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-text-muted">
                                            <Tag size={16} /> {booking.guestCount} Guests
                                        </div>
                                        {booking.totalCost && (
                                            <div className="flex items-center gap-2 text-sm font-bold text-success">
                                                <DollarSign size={16} /> Total: ${booking.totalCost}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-3 md:w-48">
                                    <Link to={`/customer/my-events/${booking.bookingId}`} className="btn btn-outline w-full text-sm py-2 mb-2">
                                        Manage Event <ArrowRight size={14} />
                                    </Link>
                                    {booking.status === 'APPROVED' && (
                                        <Link to={`/customer/event-payment/${booking.bookingId}`} className="btn btn-primary w-full text-sm py-2">
                                            Pay Advance <DollarSign size={14} />
                                        </Link>
                                    )}
                                    {booking.status === 'REJECTED' && (
                                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                                            <p className="text-[10px] font-bold text-danger uppercase mb-1">Rejection Reason</p>
                                            <p className="text-xs">{booking.rejectionReason || 'No reason provided'}</p>
                                        </div>
                                    )}
                                    {booking.status === 'PENDING' && (
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                                            <Clock size={20} className="mx-auto mb-2 text-warning" />
                                            <p className="text-xs text-text-muted">Admin review in progress</p>
                                        </div>
                                    )}
                                    {booking.status === 'CONFIRMED' && (
                                        <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-center">
                                            <CheckCircle size={20} className="mx-auto mb-2 text-success" />
                                            <p className="text-xs text-success font-bold">Booking Confirmed!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {booking.specialRequirements && (
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <p className="text-xs font-bold text-text-muted uppercase mb-1 flex items-center gap-1.5">
                                        <AlertCircle size={12} /> Special Requirements
                                    </p>
                                    <p className="text-sm text-text-muted italic">"{booking.specialRequirements}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredBookings.length === 0 && (
                    <div className="card glass p-12 text-center">
                        <Calendar size={48} className="mx-auto mb-4 text-white/10" />
                        <h3 className="text-xl font-bold mb-2">No Event Bookings Found</h3>
                        <p className="text-text-muted mb-6">You haven't requested any events yet.</p>
                        <Link to="/event-booking" className="btn btn-primary">
                            Plan Your First Event <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEventBookings;
