import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Search, CheckCircle, XCircle, Clock, FileText, ArrowRight } from 'lucide-react';

const API = 'http://localhost:8080/api';

const AdminEventRefunds = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [actionType, setActionType] = useState(''); // 'APPROVE' or 'REJECT'
    const [actionNotes, setActionNotes] = useState('');
    const [overrideAmount, setOverrideAmount] = useState('');

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            const res = await axios.get(`${API}/admin/refunds`, getHeaders());
            setRefunds(res.data.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)));
        } catch (err) {
            console.error("Failed to fetch refunds", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'REQUESTED': return 'status-blue';
            case 'APPROVED': return 'status-green';
            case 'PROCESSED': return 'status-green';
            case 'REJECTED': return 'status-red';
            default: return 'status-blue';
        }
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (actionType === 'APPROVE') {
                const payload = { 
                    notes: actionNotes,
                    amount: overrideAmount ? parseFloat(overrideAmount) : null
                };
                await axios.put(`${API}/admin/refunds/${selectedRefund.refundId}/approve`, payload, getHeaders());
                alert('✅ Refund Approved');
            } else if (actionType === 'REJECT') {
                await axios.put(`${API}/admin/refunds/${selectedRefund.refundId}/reject`, { notes: actionNotes }, getHeaders());
                alert('✅ Refund Rejected');
            }
            setSelectedRefund(null);
            fetchRefunds();
        } catch (err) {
            console.error("Failed to perform action", err);
            alert('❌ Failed to update refund status');
        }
    };

    const handleProcess = async (id) => {
        if (!window.confirm("Are you sure you want to mark this refund as PROCESSED? This assumes the money has been transferred to the customer.")) return;
        try {
            await axios.put(`${API}/admin/refunds/${id}/process`, {}, getHeaders());
            alert('✅ Refund marked as PROCESSED');
            fetchRefunds();
        } catch (err) {
            console.error("Failed to process refund", err);
            alert('❌ Failed to process refund');
        }
    };

    const openActionModal = (refund, type) => {
        setSelectedRefund(refund);
        setActionType(type);
        setActionNotes('');
        setOverrideAmount(refund.refundAmount);
    };

    if (loading) return <div className="p-8 text-center">Loading refunds...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="text-primary" /> Event Cancellations & Refunds
                    </h2>
                    <p className="text-text-muted">Review and process customer refund requests</p>
                </div>
            </div>

            <div className="card glass p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border">
                                <th className="p-4 font-bold text-sm">Refund ID</th>
                                <th className="p-4 font-bold text-sm">Booking ID</th>
                                <th className="p-4 font-bold text-sm">Policy Applied</th>
                                <th className="p-4 font-bold text-sm">Refund Amount</th>
                                <th className="p-4 font-bold text-sm">Status</th>
                                <th className="p-4 font-bold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map(refund => (
                                <tr key={refund.refundId} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-sm">
                                        #REF-{refund.refundId}
                                        <div className="text-xs text-text-muted mt-1">{new Date(refund.requestedAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 font-mono text-sm">
                                        #BKG-{refund.eventBooking?.bookingId || 'Unknown'}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-sm">{refund.refundPolicy?.replace('_', ' ')}</span>
                                        <div className="text-xs text-text-muted mt-1 truncate max-w-[200px]" title={refund.refundReason}>
                                            {refund.refundReason}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-success">
                                        ${refund.refundAmount}
                                    </td>
                                    <td className="p-4">
                                        <span className={`status-badge ${getStatusColor(refund.refundStatus)} w-max`}>
                                            {refund.refundStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-end">
                                            {refund.refundStatus === 'REQUESTED' && (
                                                <>
                                                    <button 
                                                        onClick={() => openActionModal(refund, 'APPROVE')}
                                                        className="btn btn-ghost btn-sm text-success p-2"
                                                        title="Approve Refund"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openActionModal(refund, 'REJECT')}
                                                        className="btn btn-ghost btn-sm text-danger p-2"
                                                        title="Reject Refund"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {refund.refundStatus === 'APPROVED' && (
                                                <button 
                                                    onClick={() => handleProcess(refund.refundId)}
                                                    className="btn btn-primary btn-sm flex items-center gap-2"
                                                >
                                                    Process <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {refunds.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-muted">
                                        No refund requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {selectedRefund && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card glass max-w-md w-full p-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            {actionType === 'APPROVE' ? (
                                <CheckCircle className="text-success" size={24} />
                            ) : (
                                <XCircle className="text-danger" size={24} />
                            )}
                            <h3 className="text-xl font-bold">
                                {actionType === 'APPROVE' ? 'Approve Refund' : 'Reject Refund'}
                            </h3>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg mb-6 text-sm">
                            <p className="flex justify-between mb-2">
                                <span className="text-text-muted">Refund ID:</span>
                                <span className="font-mono">#REF-{selectedRefund.refundId}</span>
                            </p>
                            <p className="flex justify-between mb-2">
                                <span className="text-text-muted">Calculated Amount:</span>
                                <span className="font-bold text-success">${selectedRefund.refundAmount}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-text-muted">Policy:</span>
                                <span>{selectedRefund.refundPolicy?.replace('_', ' ')}</span>
                            </p>
                        </div>

                        <form onSubmit={handleActionSubmit} className="flex flex-col gap-4">
                            {actionType === 'APPROVE' && (
                                <div>
                                    <label className="block text-sm font-bold text-text-muted mb-1">Override Amount ($) (Optional)</label>
                                    <p className="text-xs text-text-muted mb-2">Leave as is to use the calculated policy amount.</p>
                                    <input 
                                        type="number"
                                        step="0.01" 
                                        value={overrideAmount}
                                        onChange={(e) => setOverrideAmount(e.target.value)}
                                        className="input w-full font-bold text-success"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-text-muted mb-1">Admin Notes *</label>
                                <textarea 
                                    value={actionNotes}
                                    onChange={(e) => setActionNotes(e.target.value)}
                                    className="input w-full min-h-[100px] resize-none"
                                    placeholder={actionType === 'REJECT' ? 'Reason for rejection...' : 'Approval notes...'}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setSelectedRefund(null)} className="btn btn-ghost">
                                    Cancel
                                </button>
                                <button type="submit" className={`btn ${actionType === 'APPROVE' ? 'btn-primary bg-success' : 'btn-primary bg-danger'}`}>
                                    Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventRefunds;
