// src/pages/website/CustomerFeedback.jsx
import React, { useEffect, useState } from "react";
import { Star, Plus, Pencil, Trash2, RefreshCw, MessageSquare, LayoutGrid, CheckCircle, AlertCircle, Info } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/feedbacks";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SERVICE_TYPES = {
  ROOM: { label: "Room", icon: "🛏️", criteria: ["Cleanliness", "Comfort", "Amenities", "Value"], fields: ["ratingCleanliness", "ratingComfort", "ratingAmenities", "ratingRoomValue"] },
  FOOD: { label: "Food", icon: "🍽️", criteria: ["Taste", "Presentation", "Service Speed", "Value"], fields: ["ratingTaste", "ratingPresentation", "ratingServiceSpeed", "ratingFoodValue"] },
  SERVICE: { label: "Services", icon: "🛎️", criteria: ["Communication", "Punctuality", "Eye for Detail", "Efficiency"], fields: ["ratingCommunication", "ratingPunctuality", "ratingEyeForDetail", "ratingEfficiency"] },
  EVENT: { label: "Events", icon: "🎉", criteria: ["Organization", "Venue", "Staff", "Overall Experience"], fields: ["ratingOrganization", "ratingVenue", "ratingEventStaff", "ratingOverallExperience"] },
  STAFF: { label: "Staff", icon: "👤", criteria: ["Friendliness", "Professionalism", "Helpfulness", "Response Time"], fields: ["ratingFriendliness", "ratingProfessionalism", "ratingHelpfulness", "ratingResponseTime"] },
};

const EMPTY_FORM = {
  serviceType: "ROOM",
  ratingCleanliness: 0, ratingComfort: 0, ratingAmenities: 0, ratingRoomValue: 0,
  ratingTaste: 0, ratingPresentation: 0, ratingServiceSpeed: 0, ratingFoodValue: 0,
  ratingCommunication: 0, ratingPunctuality: 0, ratingEyeForDetail: 0, ratingEfficiency: 0,
  ratingOrganization: 0, ratingVenue: 0, ratingEventStaff: 0, ratingOverallExperience: 0,
  ratingFriendliness: 0, ratingProfessionalism: 0, ratingHelpfulness: 0, ratingResponseTime: 0,
  comments: "",
};

// ── Star Rating (Simplified & Standardized) ───────────────────────────────────
function StarRating({ value, onChange, readonly = false, starSize = 18 }) {
  const [hovered, setHovered] = useState(0);
  const active = readonly ? value : (hovered || value);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={starSize}
          onClick={() => { if (!readonly && onChange) onChange(n); }}
          onMouseEnter={() => { if (!readonly) setHovered(n); }}
          onMouseLeave={() => { if (!readonly) setHovered(0); }}
          className={`${n <= active ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-muted)]"} ${!readonly ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        />
      ))}
    </div>
  );
}

// ── Feedback Card ──────────────────────────────────────────────────────────────
function FeedbackCard({ fb, onEdit, onDelete }) {
  const type = SERVICE_TYPES[fb.serviceType] || {};

  return (
    <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="stat-icon" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1.2rem' }}>
            {type.icon || '💬'}
          </div>
          <div>
            <h4 style={{ margin: 0 }}>{type.label} Feedback</h4>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>{fb.feedbackDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-badge status-blue" style={{ fontSize: '0.8rem' }}>
            ★ {fb.rating?.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mb-4 bg-[var(--background)] rounded-lg p-3 grid grid-cols-2 gap-3 border border-[var(--border)]">
        {type.criteria?.map((c, i) => (
          <div key={c} className="flex flex-col gap-1">
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{c}</span>
            <StarRating value={fb[type.fields[i]] ?? 0} readonly starSize={12} />
          </div>
        ))}
      </div>

      {fb.comments && (
        <p style={{ fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1.5rem', paddingLeft: '0.75rem', borderLeft: '2px solid var(--primary)' }}>
          "{fb.comments}"
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => onEdit(fb)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          <Pencil size={14} /> Edit
        </button>
        <button onClick={() => onDelete(fb.feedbackId)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── Feedback Modal (Standardized Form) ─────────────────────────────────────────
function FeedbackModal({ initial, customerId, onClose, onSaved }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial?.feedbackId;
  const type = SERVICE_TYPES[form.serviceType];

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const avgScore = type.fields.reduce((s, f) => s + (form[f] || 0), 0) / type.fields.length;

  const handleSubmit = async () => {
    const allRated = type.fields.every((f) => (form[f] || 0) > 0);
    if (!allRated) { setError("Please rate all criteria."); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        customerId,
        feedbackDate: new Date().toISOString().slice(0, 10),
        rating: Math.round(type.fields.reduce((s, f) => s + (form[f] || 0), 0) / type.fields.length),
      };
      if (isEdit) await axios.put(`${API_URL}/${initial.feedbackId}`, payload, { headers: getAuthHeaders() });
      else await axios.post(API_URL, payload, { headers: getAuthHeaders() });
      onSaved();
    } catch { setError("Submission failed. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card w-full max-w-md animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ margin: 0 }}>{isEdit ? "Edit Feedback" : "Share Feedback"}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem' }}>✕</button>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={form.serviceType} onChange={(e) => setField("serviceType", e.target.value)}>
            {Object.entries(SERVICE_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-6 bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>Criteria Ratings</p>
          <div className="space-y-4">
            {type.criteria.map((c, i) => (
              <div key={c} className="flex justify-between items-center">
                <span style={{ fontSize: '0.85rem' }}>{c}</span>
                <StarRating
                  value={form[type.fields[i]] || 0}
                  onChange={(v) => setField(type.fields[i], v)}
                  starSize={22}
                />
              </div>
            ))}
          </div>
          {avgScore > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center">
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Overall Impression</span>
              <span className="status-badge status-blue">{avgScore.toFixed(1)} / 5</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Comments (Optional)</label>
          <textarea
            value={form.comments}
            onChange={(e) => setField("comments", e.target.value)}
            placeholder="Tell us about your experience..."
            rows={3}
          />
        </div>

        {error && (
          <p className="text-center" style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CustomerFeedback() {
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/customers", { headers: getAuthHeaders() });
        const customer = res.data?.[0];
        if (customer?.customerId) {
          setCustomerId(customer.customerId);
          setCustomerName(`${customer.firstName} ${customer.lastName}`);
        }
      } catch (err) { console.error("Failed to fetch customer:", err); }
    };
    fetchCustomer();
  }, []);

  const load = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/customer/${customerId}`, { headers: getAuthHeaders() });
      setFeedbacks(res.data || []);
    } catch (err) { console.error("Failed to load feedbacks:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (customerId) load(); }, [customerId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this feedback?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
      load();
    } catch { alert("Failed to delete."); }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const visible = feedbacks.filter((f) => !filter || f.serviceType === filter);
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : "0.0";

  return (
    <div className="w-full">
      <div className="card mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="flex items-center gap-2 m-0"><MessageSquare className="text-[var(--primary)]" /> My Feedback</h2>
            <p style={{ margin: 0 }}>Review and manage your experience ratings</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="btn btn-primary"
            >
              <Plus size={16} /> New Feedback
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon"><Star /></div>
          <div className="stat-info">
            <h4>Avg Rating</h4>
            <p>{avgRating}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><LayoutGrid /></div>
          <div className="stat-info">
            <h4>Total Reviews</h4>
            <p>{feedbacks.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--secondary)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}><CheckCircle /></div>
          <div className="stat-info">
            <h4>Positive</h4>
            <p>{feedbacks.filter(f => f.rating >= 4).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}><AlertCircle /></div>
          <div className="stat-info">
            <h4>Needs Work</h4>
            <p>{feedbacks.filter(f => f.rating <= 2).length}</p>
          </div>
        </div>
      </div>

      <div className="card mb-6" style={{ padding: '1rem' }}>
        <div className="flex items-center gap-3">
          <Info size={16} className="text-[var(--text-muted)]" />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter("")} className={`btn btn-ghost ${!filter ? 'active' : ''}`} style={{ padding: '0.2rem 0.75rem', fontSize: '0.8rem' }}>All</button>
            {Object.entries(SERVICE_TYPES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`btn btn-ghost ${filter === k ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.75rem', fontSize: '0.8rem' }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-[var(--text-muted)]">Loading your feedback history...</p>
      ) : visible.length === 0 ? (
        <div className="card text-center py-12" style={{ borderStyle: 'dashed' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</p>
          <h3>No feedback found</h3>
          <p>You haven't shared any experiences in this category yet.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {visible.map((fb) => (
            <FeedbackCard
              key={fb.feedbackId}
              fb={fb}
              onEdit={(f) => { setEditing(f); setModalOpen(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <FeedbackModal
          initial={editing}
          customerId={customerId}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

