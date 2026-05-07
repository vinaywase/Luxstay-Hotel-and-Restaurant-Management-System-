import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Plus, Trash2, DollarSign, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

const API = 'http://localhost:8080/api';

const CustomerEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [packages, setPackages] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Form state
    const [selectedPackage, setSelectedPackage] = useState('');
    const [serviceQty, setServiceQty] = useState(1);
    
    const [selectedFood, setSelectedFood] = useState('');
    const [foodQty, setFoodQty] = useState(1);
    const [foodType, setFoodType] = useState('MAIN_COURSE');

    const [cancelReason, setCancelReason] = useState('');
    const [refundEligibility, setRefundEligibility] = useState(null);
    const [checkingRefund, setCheckingRefund] = useState(false);

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, packagesRes, foodRes] = await Promise.all([
                axios.get(`${API}/customer/bookings/${id}/cost-summary`, getHeaders()),
                axios.get(`${API}/customer/service-packages`, getHeaders()).catch(() => ({ data: [] })),
                axios.get(`${API}/food-items`).catch(() => ({ data: [] }))
            ]);
            setSummary(summaryRes.data);
            setPackages(packagesRes.data.filter(p => p.isActive));
            setFoodItems(foodRes.data);
        } catch (err) {
            console.error("Failed to fetch event details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/customer/bookings/${id}/services`, {
                packageId: parseInt(selectedPackage),
                quantity: serviceQty
            }, getHeaders());
            setShowServiceModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to add service.');
        }
    };

    const handleRemoveService = async (serviceId) => {
        if (!window.confirm("Remove this service?")) return;
        try {
            await axios.delete(`${API}/customer/bookings/${id}/services/${serviceId}`, getHeaders());
            fetchData();
        } catch (err) {
            alert('Failed to remove service.');
        }
    };

    const handleAddMenu = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/customer/bookings/${id}/menu`, {
                foodItemId: parseInt(selectedFood),
                quantity: foodQty,
                itemType: foodType
            }, getHeaders());
            setShowMenuModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to add menu item.');
        }
    };

    const handleRemoveMenu = async (menuId) => {
        if (!window.confirm("Remove this menu item?")) return;
        try {
            await axios.delete(`${API}/customer/bookings/${id}/menu/${menuId}`, getHeaders());
            fetchData();
        } catch (err) {
            alert('Failed to remove menu item.');
        }
    };

    const initiateCancellation = async () => {
        setCheckingRefund(true);
        setShowCancelModal(true);
        try {
            const res = await axios.get(`${API}/customer/bookings/${id}/refund-eligibility`, getHeaders());
            setRefundEligibility(res.data);
        } catch (err) {
            console.error("Failed to check refund eligibility", err);
            setRefundEligibility(null);
        } finally {
            setCheckingRefund(false);
        }
    };

    const confirmCancellation = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation.');
            return;
        }
        try {
            await axios.post(`${API}/customer/bookings/${id}/cancel`, { reason: cancelReason }, getHeaders());
            alert('✅ Event cancelled successfully. Refund requested.');
            setShowCancelModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to cancel event.');
        }
    };

    if (loading || !summary) return <div className="p-8 text-center">Loading event details...</div>;

    const canModify = ['PENDING', 'APPROVED'].includes(summary.bookingStatus);
    const canCancel = !['CANCELLED', 'CANCELLATION_REQUESTED', 'EVENT_COMPLETED', 'FULLY_PAID'].includes(summary.bookingStatus);

    return (
        <div className="animate-fade-in pb-12">
            <button onClick={() => navigate('/customer/my-events')} className="btn btn-ghost mb-6 pl-0">
                <ArrowLeft size={18} /> Back to My Events
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold">Event Details</h2>
                        <span className="status-badge status-blue uppercase">{summary.bookingStatus.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-text-muted">
                        {summary.eventDate} at {summary.eventTime} • {summary.venueName} ({summary.guestCount} Guests)
                    </p>
                </div>
                {canCancel && (
                    <button onClick={initiateCancellation} className="btn btn-outline text-danger border-danger hover:bg-danger hover:text-white">
                        <AlertTriangle size={18} /> Request Cancellation
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Services and Menu */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Addons / Services */}
                    <div className="card glass p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Shield className="text-primary" /> Additional Services</h3>
                            {canModify && (
                                <button onClick={() => setShowServiceModal(true)} className="btn btn-sm btn-primary">
                                    <Plus size={16} /> Add Service
                                </button>
                            )}
                        </div>
                        
                        {summary.selectedServices && summary.selectedServices.length > 0 ? (
                            <div className="space-y-4">
                                {summary.selectedServices.map((svc, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-border rounded-lg">
                                        <div>
                                            <p className="font-bold">{svc.serviceName}</p>
                                            <p className="text-xs text-text-muted">{svc.serviceType} • {svc.pricingType.replace('_', ' ')} • Qty: {svc.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-success">${svc.totalPrice}</span>
                                            {canModify && (
                                                <button onClick={() => handleRemoveService(svc.serviceBookingId)} className="text-danger hover:opacity-80 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm">No additional services selected.</p>
                        )}
                    </div>

                    {/* Catering / Menu */}
                    <div className="card glass p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="text-primary" /> Catering Menu</h3>
                            {canModify && (
                                <button onClick={() => setShowMenuModal(true)} className="btn btn-sm btn-primary">
                                    <Plus size={16} /> Add Menu Item
                                </button>
                            )}
                        </div>
                        
                        {summary.menuItems && summary.menuItems.length > 0 ? (
                            <div className="space-y-4">
                                {summary.menuItems.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-border rounded-lg">
                                        <div>
                                            <p className="font-bold">{item.itemName}</p>
                                            <p className="text-xs text-text-muted">{item.itemType} • ${item.unitPrice} each • Qty: {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-success">${item.totalPrice}</span>
                                            {canModify && (
                                                <button onClick={() => handleRemoveMenu(item.menuSelectionId)} className="text-danger hover:opacity-80 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm">No menu items selected.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Invoice/Summary */}
                <div className="flex flex-col gap-6">
                    <div className="card glass p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                            <DollarSign className="text-success" /> Cost Summary
                        </h3>
                        
                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Venue Base Cost</span>
                                <span>${summary.venueBaseCost}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Additional Services</span>
                                <span>${summary.servicesTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Catering Total</span>
                                <span>${summary.cateringTotal}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/50">
                                <span>Grand Total</span>
                                <span className="text-primary">${summary.grandTotal}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg mb-6 text-sm space-y-2 border border-border/50">
                            <div className="flex justify-between text-success">
                                <span>Advance Paid</span>
                                <span>${summary.advancePaid}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Balance Due</span>
                                <span>${summary.balanceDue}</span>
                            </div>
                        </div>

                        {summary.refund && (
                            <div className={`p-4 rounded-lg text-sm border ${
                                summary.refund.refundStatus === 'PROCESSED' ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
                            }`}>
                                <p className="font-bold mb-1 flex items-center gap-2">
                                    Refund {summary.refund.refundStatus}
                                </p>
                                <p>Amount: <span className="font-bold">${summary.refund.refundAmount}</span></p>
                                {summary.refund.processedAt && <p className="text-xs opacity-80 mt-1">Processed on {new Date(summary.refund.processedAt).toLocaleDateString()}</p>}
                            </div>
                        )}
                    </div>

                    {summary.payments && summary.payments.length > 0 && (
                        <div className="card glass p-6">
                            <h4 className="font-bold mb-4">Payment History</h4>
                            <div className="space-y-3">
                                {summary.payments.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-border/50">
                                        <div>
                                            <p className="font-bold text-xs">{p.paymentType}</p>
                                            <p className="text-[10px] text-text-muted">{new Date(p.paidAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-success">${p.amount}</p>
                                            <p className="text-[10px] uppercase text-text-muted">{p.paymentMethod}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* Add Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="card glass w-full max-w-sm p-6 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4">Add Service</h3>
                        <form onSubmit={handleAddService} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Select Package</label>
                                <select className="input w-full" value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)} required>
                                    <option value="">-- Choose --</option>
                                    {packages.map(p => (
                                        <option key={p.packageId} value={p.packageId}>{p.packageName} (${p.basePrice})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Quantity</label>
                                <input type="number" min="1" className="input w-full" value={serviceQty} onChange={e => setServiceQty(e.target.value)} required />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowServiceModal(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Menu Modal */}
            {showMenuModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="card glass w-full max-w-sm p-6 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4">Add Menu Item</h3>
                        <form onSubmit={handleAddMenu} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Food Item</label>
                                <select className="input w-full" value={selectedFood} onChange={e => setSelectedFood(e.target.value)} required>
                                    <option value="">-- Choose --</option>
                                    {foodItems.map(f => (
                                        <option key={f.foodItemId} value={f.foodItemId}>{f.name} (${f.price})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-muted mb-1">Quantity</label>
                                    <input type="number" min="1" className="input w-full" value={foodQty} onChange={e => setFoodQty(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-muted mb-1">Course Type</label>
                                    <select className="input w-full" value={foodType} onChange={e => setFoodType(e.target.value)}>
                                        <option value="STARTER">STARTER</option>
                                        <option value="MAIN_COURSE">MAIN COURSE</option>
                                        <option value="DESSERT">DESSERT</option>
                                        <option value="BEVERAGE">BEVERAGE</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowMenuModal(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="card glass w-full max-w-md p-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="text-danger" size={28} />
                            <h3 className="text-xl font-bold">Request Cancellation</h3>
                        </div>

                        {checkingRefund ? (
                            <p className="text-center p-4">Calculating refund eligibility...</p>
                        ) : refundEligibility ? (
                            <div className="bg-white/5 p-4 rounded-lg border border-border mb-6 text-sm space-y-2">
                                <p className="flex justify-between"><span className="text-text-muted">Days Until Event:</span> <span>{refundEligibility.daysUntilEvent} days</span></p>
                                <p className="flex justify-between"><span className="text-text-muted">Advance Paid:</span> <span>${refundEligibility.advancePaid}</span></p>
                                <p className="flex justify-between"><span className="text-text-muted">Policy Applied:</span> <span className="font-bold">{refundEligibility.refundPolicy?.replace('_', ' ')}</span></p>
                                <hr className="border-border/50 my-2" />
                                <p className="flex justify-between text-danger"><span className="text-text-muted">Deduction:</span> <span>${refundEligibility.deductionAmount} ({refundEligibility.deductionPercentage}%)</span></p>
                                <p className="flex justify-between text-success font-bold text-base mt-2"><span>Estimated Refund:</span> <span>${refundEligibility.refundAmount}</span></p>
                            </div>
                        ) : (
                            <p className="text-danger text-sm mb-6">Could not load refund policy information.</p>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-text-muted mb-2">Reason for Cancellation *</label>
                            <textarea 
                                className="input w-full min-h-[80px]" 
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                                placeholder="Please tell us why you need to cancel..."
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowCancelModal(false)} className="btn btn-ghost">Keep Booking</button>
                            <button onClick={confirmCancellation} className="btn btn-primary bg-danger border-danger">Confirm Cancellation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerEventDetails;
