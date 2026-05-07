import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, CheckCircle2, Play, ClipboardList } from 'lucide-react';

const API = 'http://localhost:8080/api';

const StaffEventDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const staffId = localStorage.getItem('staffId'); // Assuming staffId is stored on login

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        if (staffId) {
            fetchMyAssignments();
        } else {
            setLoading(false);
        }
    }, [staffId]);

    const fetchMyAssignments = async () => {
        try {
            const res = await axios.get(`${API}/event-staff/staff/${staffId}`, getHeaders());
            setAssignments(res.data);
        } catch (err) {
            console.error("Error fetching assignments", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.patch(`${API}/event-staff/${id}/status`, { status: newStatus }, getHeaders());
            fetchMyAssignments();
        } catch (err) {
            alert("Error updating status");
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading your assignments...</div>;
    if (!staffId) return <div className="p-8 text-center text-danger">Unauthorized: Staff ID not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="flex items-center gap-2 m-0 text-2xl font-bold">
                    <ClipboardList className="text-primary" /> My Event Assignments
                </h2>
                <span className="status-badge status-blue">{assignments.length} Total Tasks</span>
            </div>

            {assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(a => (
                        <div key={a.assignmentId} className="card glass hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start mb-4">
                                <span className="status-badge status-blue">{a.role}</span>
                                <span className={`status-badge ${
                                    a.status === 'COMPLETED' ? 'status-green' : 
                                    a.status === 'IN_PROGRESS' ? 'status-blue' : 'status-red'
                                }`}>
                                    {a.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold mb-2">{a.eventType}</h3>
                            
                            <div className="space-y-2 text-sm text-text-muted mb-4">
                                <p className="flex items-center gap-2"><Calendar size={14} /> {a.eventDate}</p>
                                <p className="flex items-center gap-2"><Clock size={14} /> {a.eventTime}</p>
                                <p className="flex items-center gap-2"><MapPin size={14} /> {a.venuePreference}</p>
                            </div>

                            {a.notes && (
                                <div className="p-3 bg-white/5 rounded-lg text-xs mb-4 italic text-text-muted">
                                    <strong>Notes:</strong> {a.notes}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2 border-t border-white/5">
                                {a.status === 'ASSIGNED' && (
                                    <button 
                                        className="btn btn-primary btn-sm w-full gap-2"
                                        onClick={() => updateStatus(a.assignmentId, 'IN_PROGRESS')}
                                    >
                                        <Play size={14} /> Start Task
                                    </button>
                                )}
                                {a.status === 'IN_PROGRESS' && (
                                    <button 
                                        className="btn btn-secondary btn-sm w-full gap-2"
                                        onClick={() => updateStatus(a.assignmentId, 'COMPLETED')}
                                    >
                                        <CheckCircle2 size={14} /> Mark Done
                                    </button>
                                )}
                                {a.status === 'COMPLETED' && (
                                    <div className="w-full text-center py-2 text-secondary font-bold text-sm">
                                        ✓ Task Completed
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center p-12 text-text-muted">
                    <Calendar size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="text-lg">No assignments found for you at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default StaffEventDashboard;
