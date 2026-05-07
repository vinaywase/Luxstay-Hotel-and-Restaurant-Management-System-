// src/pages/website/AdminStaffFeedback.jsx
import React, { useEffect, useState } from "react";
import { Star, Trash2, RefreshCw, Filter, Search, MessageSquare, Award, CheckCircle, AlertCircle, ChevronDown, ChevronUp, User, LayoutGrid } from "lucide-react";
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

function StarRow({ value, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= value ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-muted)]"}
        />
      ))}
    </div>
  );
}

function FeedbackRow({ fb, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const type = SERVICE_TYPES[fb.serviceType] || {};

  return (
    <>
      <tr 
        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td style={{ padding: '1rem', fontWeight: '600' }}>#{fb.feedbackId}</td>
        <td style={{ padding: '1rem' }}>
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--text-muted)]" />
            <span>{fb.customerName || `Guest #${fb.customerId}`}</span>
          </div>
        </td>
        <td style={{ padding: '1rem' }}>
          <span className="status-badge status-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            {type.icon} {type.label}
          </span>
        </td>
        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{fb.feedbackDate}</td>
        <td style={{ padding: '1rem' }}>
          <div className="flex items-center gap-2">
            <StarRow value={fb.rating} size={12} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{fb.rating?.toFixed(1)}</span>
          </div>
        </td>
        <td style={{ padding: '1rem' }}>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onDelete(fb.feedbackId); }} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              <Trash2 size={12} />
            </button>
            <div className="text-[var(--text-muted)]">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan="6" style={{ padding: '0', background: 'var(--background)' }}>
            <div className="animate-fade-in" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Rating Breakdown</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {type.criteria?.map((c, i) => (
                      <div key={c} className="flex flex-col gap-1 bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
                        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{c}</span>
                        <StarRow value={fb[type.fields[i]] ?? 0} size={10} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Customer Comments</h5>
                  <div className="card" style={{ padding: '1rem', background: 'var(--surface)' }}>
                    <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      "{fb.comments || "No comments provided."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminStaffFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { headers: getAuthHeaders() });
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this feedback?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
      load();
    } catch { alert("Error deleting feedback."); }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const visible = feedbacks.filter((f) => {
    const matchType = !typeFilter || f.serviceType === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(f.feedbackId).includes(q) ||
      (f.customerName || "").toLowerCase().includes(q) ||
      (f.comments || "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="w-full">
      <div className="card mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="flex items-center gap-2 m-0"><LayoutGrid className="text-[var(--primary)]" /> Feedback Management</h2>
            <p style={{ margin: 0 }}>Monitor and analyze guest experience ratings</p>
          </div>
          <button onClick={load} className="btn btn-primary">
            <RefreshCw size={16} /> Sync Data
          </button>
        </div>
      </div>

      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon"><Award /></div>
          <div className="stat-info">
            <h4>Avg Rating</h4>
            <p>{avgRating}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MessageSquare /></div>
          <div className="stat-info">
            <h4>Total Records</h4>
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
            <h4>Critical</h4>
            <p>{feedbacks.filter(f => f.rating <= 2).length}</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, customer name, or comments..."
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--text-muted)]" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">All Categories</option>
              {Object.entries(SERVICE_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <p className="text-center py-12 text-[var(--text-muted)]">Loading feedback records...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Customer</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rating</th>
                  <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.length > 0 ? visible.map((fb) => (
                  <FeedbackRow key={fb.feedbackId} fb={fb} onDelete={handleDelete} />
                )) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No feedback records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
