import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Plus, Trash2, CheckCircle, Info } from 'lucide-react';

const API = 'http://localhost:8080/api';
const ROLES = ['COORDINATOR', 'CATERING', 'DECORATION', 'SECURITY', 'AV_TECH'];

const AdminEventStaffAssign = () => {
    const [events, setEvents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // New assignment form state
    const [formData, setFormData] = useState({
        staffId: '',
        role: 'COORDINATOR',
        notes: ''
    });

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchAssignments(selectedEventId);
        } else {
            setAssignments([]);
        }
    }, [selectedEventId]);

    const fetchInitialData = async () => {
        try {
            const [eventsRes, staffRes] = await Promise.all([
                axios.get(`${API}/event-bookings`, getHeaders()),
                axios.get(`${API}/staff`, getHeaders())
            ]);
            
            // Only show events that are ready for staff assignment
            const eligibleEvents = eventsRes.data.filter(e => 
                ['PAYMENT_DONE', 'CONFIRMED'].includes(e.status)
            );
            
            setEvents(eligibleEvents);
            setStaffList(staffRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (eventId) => {
        try {
            const res = await axios.get(`${API}/event-staff/event/${eventId}`, getHeaders());
            setAssignments(res.data);
        } catch (err) {
            console.error("Error fetching assignments", err);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAssign = async (e) => {
        e.preventDefault();
        console.log("Submitting assignment...", { selectedEventId, formData });

        if (!selectedEventId || !formData.staffId) {
            alert("Please select both an event and a staff member.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                eventBookingId: Number(selectedEventId),
                staffId: Number(formData.staffId),
                role: formData.role,
                notes: formData.notes
            };
            
            console.log("Payload:", payload);
            const response = await axios.post(`${API}/event-staff/assign`, payload, getHeaders());
            console.log("Response:", response.data);
            
            alert("✅ Staff assigned successfully!");
            setFormData({ staffId: '', role: 'COORDINATOR', notes: '' });
            fetchAssignments(selectedEventId);
        } catch (err) {
            console.error("Assignment error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error occurred";
            alert("❌ Error assigning staff: " + errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this assignment?")) return;
        try {
            await axios.delete(`${API}/event-staff/${id}`, getHeaders());
            fetchAssignments(selectedEventId);
        } catch (err) {
            alert("Error removing assignment");
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;

    return (
        <div className="card w-full animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <h2 className="flex items-center gap-2 m-0"><Users className="text-primary" /> Event Staff Assignment</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection & Assignment Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="form-group">
                        <label>Select Event</label>
                        <select 
                            value={selectedEventId} 
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full"
                        >
                            <option value="">-- Choose Confirmed Event --</option>
                            {events.map(e => (
                                <option key={e.bookingId} value={e.bookingId}>
                                    #{e.bookingId} - {e.eventType} ({e.eventDate})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedEventId && (
                        <form onSubmit={handleAssign} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-primary" /> Assign New Staff
                            </h3>
                            
                            <div className="form-group">
                                <label>Staff Member</label>
                                <select 
                                    value={formData.staffId} 
                                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                                    required
                                >
                                    <option value="">-- Select Staff --</option>
                                    {staffList.map(s => (
                                        <option key={s.staffId} value={s.staffId}>
                                            {s.firstName} {s.lastName} ({s.position})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Assignment Role</label>
                                <select 
                                    value={formData.role} 
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Notes / Instructions</label>
                                <textarea 
                                    value={formData.notes} 
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Specific tasks or details..."
                                    rows="3"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Assigning...' : 'Assign Staff'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Assignment List */}
                <div className="lg:col-span-2">
                    {selectedEventId ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle size={18} className="text-secondary" /> Currently Assigned Staff
                            </h3>
                            
                            {assignments.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Staff Name</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map(a => (
                                                <tr key={a.assignmentId} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1rem' }}>{a.staffName}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span className="status-badge status-blue">{a.role}</span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span className={`status-badge ${
                                                            a.status === 'COMPLETED' ? 'status-green' : 'status-blue'
                                                        }`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button 
                                                            className="btn btn-ghost btn-sm text-danger" 
                                                            onClick={() => handleDelete(a.assignmentId)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-text-muted border-2 border-dashed border-white/5 rounded-xl">
                                    <Info className="mx-auto mb-2 opacity-20" size={48} />
                                    <p>No staff assigned to this event yet.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                            <Calendar size={48} className="mb-4 opacity-10" />
                            <p>Select an event to manage staff assignments</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEventStaffAssign;
