import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Edit2, Trash2, Shield, DollarSign, Activity } from 'lucide-react';

const API = 'http://localhost:8080/api';

const AdminServicePackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        packageName: '',
        serviceType: 'CATERING',
        pricingType: 'FLAT_RATE',
        basePrice: '',
        description: '',
        isActive: true
    });

    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await axios.get(`${API}/admin/service-packages`, getHeaders());
            setPackages(res.data);
        } catch (err) {
            console.error("Failed to fetch packages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPackage) {
                await axios.put(`${API}/admin/service-packages/${editingPackage.packageId}`, formData, getHeaders());
                alert('✅ Package updated successfully');
            } else {
                await axios.post(`${API}/admin/service-packages`, formData, getHeaders());
                alert('✅ Package created successfully');
            }
            setShowModal(false);
            setEditingPackage(null);
            fetchPackages();
        } catch (err) {
            console.error("Failed to save package", err);
            alert('❌ Failed to save package');
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            packageName: pkg.packageName,
            serviceType: pkg.serviceType,
            pricingType: pkg.pricingType,
            basePrice: pkg.basePrice,
            description: pkg.description,
            isActive: pkg.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this package?")) return;
        try {
            await axios.delete(`${API}/admin/service-packages/${id}`, getHeaders());
            alert('✅ Package deactivated successfully');
            fetchPackages();
        } catch (err) {
            console.error("Failed to deactivate package", err);
            alert('❌ Failed to deactivate package');
        }
    };

    const openCreateModal = () => {
        setEditingPackage(null);
        setFormData({
            packageName: '',
            serviceType: 'CATERING',
            pricingType: 'FLAT_RATE',
            basePrice: '',
            description: '',
            isActive: true
        });
        setShowModal(true);
    };

    if (loading) return <div className="p-8 text-center">Loading packages...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="text-primary" /> Event Service Packages
                    </h2>
                    <p className="text-text-muted">Manage addons and services for events</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> Create Package
                </button>
            </div>

            <div className="card glass p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border">
                                <th className="p-4 font-bold text-sm">Package Name</th>
                                <th className="p-4 font-bold text-sm">Type</th>
                                <th className="p-4 font-bold text-sm">Pricing</th>
                                <th className="p-4 font-bold text-sm">Base Price</th>
                                <th className="p-4 font-bold text-sm">Status</th>
                                <th className="p-4 font-bold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map(pkg => (
                                <tr key={pkg.packageId} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold">{pkg.packageName}</div>
                                        <div className="text-xs text-text-muted mt-1 max-w-xs truncate">{pkg.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="status-badge status-blue flex items-center gap-1 w-max">
                                            <Shield size={12} /> {pkg.serviceType.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-text-muted">
                                        {pkg.pricingType.replace('_', ' ')}
                                    </td>
                                    <td className="p-4 font-bold text-success flex items-center gap-1">
                                        <DollarSign size={14} />{pkg.basePrice}
                                    </td>
                                    <td className="p-4">
                                        <span className={`status-badge ${pkg.isActive ? 'status-green' : 'status-red'} w-max`}>
                                            <Activity size={12} /> {pkg.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => handleEdit(pkg)}
                                                className="btn btn-ghost btn-sm text-primary p-2"
                                                title="Edit Package"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {pkg.isActive && (
                                                <button 
                                                    onClick={() => handleDelete(pkg.packageId)}
                                                    className="btn btn-ghost btn-sm text-danger p-2"
                                                    title="Deactivate Package"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {packages.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-muted">
                                        No service packages found. Click "Create Package" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="card glass max-w-md w-full p-6 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">
                            {editingPackage ? 'Edit Package' : 'Create New Package'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-text-muted mb-1">Package Name *</label>
                                <input 
                                    type="text" 
                                    name="packageName"
                                    value={formData.packageName}
                                    onChange={handleInputChange}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-muted mb-1">Service Type *</label>
                                    <select 
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleInputChange}
                                        className="input w-full"
                                        required
                                    >
                                        <option value="CATERING">CATERING</option>
                                        <option value="DECORATION">DECORATION</option>
                                        <option value="PHOTOGRAPHY">PHOTOGRAPHY</option>
                                        <option value="AV_EQUIPMENT">AV EQUIPMENT</option>
                                        <option value="FLORAL">FLORAL</option>
                                        <option value="SECURITY">SECURITY</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-muted mb-1">Pricing Type *</label>
                                    <select 
                                        name="pricingType"
                                        value={formData.pricingType}
                                        onChange={handleInputChange}
                                        className="input w-full"
                                        required
                                    >
                                        <option value="FLAT_RATE">FLAT RATE</option>
                                        <option value="PER_PERSON">PER PERSON</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-muted mb-1">Base Price ($) *</label>
                                <input 
                                    type="number"
                                    step="0.01" 
                                    name="basePrice"
                                    value={formData.basePrice}
                                    onChange={handleInputChange}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-muted mb-1">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="input w-full min-h-[100px] resize-none"
                                />
                            </div>

                            {editingPackage && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold">Package is Active</label>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingPackage ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServicePackages;
