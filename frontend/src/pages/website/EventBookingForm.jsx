import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Users, DollarSign, Clock, MapPin, Send, CheckCircle, Sparkles, ChevronRight } from 'lucide-react';

const API = 'http://localhost:8080/api';

const EventBookingForm = () => {
    const navigate = useNavigate();
    const customerId = localStorage.getItem('customerId');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        eventType: 'Wedding',
        eventDate: '',
        eventTime: '10:00',
        venuePreference: 'Grand Ballroom',
        guestCount: '',
        budgetRange: '$5,000 - $10,000',
        specialRequirements: ''
    });

    const eventTypes = ['Wedding', 'Engagement', 'Conference', 'Birthday Party', 'Corporate Event'];
    const venues = ['Grand Ballroom', 'Banquet Hall A', 'Banquet Hall B', 'Rooftop Terrace', 'Outdoor Garden', 'Conference Room 1'];
    const budgets = ['$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $20,000', '$20,000+'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerId) {
            setError('Please login to book an event.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                customerId: parseInt(customerId),
                eventTime: formData.eventTime + ':00' // Format for LocalTime
            };

            await axios.post(`${API}/event-bookings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError('Failed to submit booking: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="container section flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="card glass p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-primary" />
                    </div>
                    <h2 className="mb-4">Request Sent!</h2>
                    <p className="text-text-muted mb-8">
                        Your event booking request has been successfully submitted.
                        Awaiting admin approval. You can track your request status in the dashboard.
                    </p>
                    <button className="btn btn-primary w-full" onClick={() => navigate('/customer/my-events')}>
                        View My Bookings <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container section animate-fade-in">
            <div className="section-header text-center mb-12">
                <span className="section-tag">Celebrations</span>
                <h2>Book Your Special Event</h2>
                <p>Tell us about your dream event and let us make it a reality</p>
            </div>

            <div className="max-w-4xl mx-auto">
                {error && (
                    <div className="card mb-6" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card glass p-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Contact Info */}
                        <div className="form-group">
                            <label htmlFor="fullName" className="flex items-center gap-2"><Users size={16} /> Full Name</label>
                            <input
                                id="fullName"
                                type="text" name="fullName" value={formData.fullName}
                                onChange={handleChange} placeholder="Enter your full name" required
                                autoComplete="name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="flex items-center gap-2">Email Address</label>
                            <input
                                id="email"
                                type="email" name="email" value={formData.email}
                                onChange={handleChange} placeholder="your@email.com" required
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone" className="flex items-center gap-2">Phone Number</label>
                            <input
                                id="phone"
                                type="tel" name="phone" value={formData.phone}
                                onChange={handleChange} placeholder="+1 (555) 000-0000" required
                                autoComplete="tel"
                            />
                        </div>

                        {/* Event Details */}
                        <div className="form-group">
                            <label htmlFor="eventType" className="flex items-center gap-2"><Sparkles size={16} /> Event Type</label>
                            <select id="eventType" name="eventType" value={formData.eventType} onChange={handleChange} autoComplete="off">
                                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="eventDate" className="flex items-center gap-2"><Calendar size={16} /> Event Date</label>
                            <input
                                id="eventDate"
                                type="date" name="eventDate" value={formData.eventDate}
                                onChange={handleChange} required
                                min={new Date().toISOString().split('T')[0]}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="eventTime" className="flex items-center gap-2"><Clock size={16} /> Preferred Time</label>
                            <input
                                id="eventTime"
                                type="time" name="eventTime" value={formData.eventTime}
                                onChange={handleChange} required
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="venuePreference" className="flex items-center gap-2"><MapPin size={16} /> Venue Preference</label>
                            <select id="venuePreference" name="venuePreference" value={formData.venuePreference} onChange={handleChange} autoComplete="off">
                                {venues.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="guestCount" className="flex items-center gap-2">Number of Guests</label>
                            <input
                                id="guestCount"
                                type="number" name="guestCount" value={formData.guestCount}
                                onChange={handleChange} placeholder="e.g. 150" required min="1"
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="budgetRange" className="flex items-center gap-2"><DollarSign size={16} /> Estimated Budget</label>
                            <select id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={handleChange} autoComplete="off">
                                {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-8">
                        <label htmlFor="specialRequirements">Special Requirements & Notes</label>
                        <textarea
                            id="specialRequirements"
                            name="specialRequirements" value={formData.specialRequirements}
                            onChange={handleChange} placeholder="Any specific decorations, dietary needs, or preferences..."
                            rows="4"
                            autoComplete="off"
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                            {submitting ? 'Submitting...' : <><Send size={18} /> Send Booking Request</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventBookingForm;
