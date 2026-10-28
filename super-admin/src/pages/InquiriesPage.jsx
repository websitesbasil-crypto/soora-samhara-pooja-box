import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Modal from '../components/molecules/Modal';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState({ totalAll: 0, newCount: 0, inProgressCount: 0, resolvedCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Actions
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchInquiries = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getInquiries({
        page,
        limit: 15,
        status: statusFilter,
        category: categoryFilter,
        search
      });
      if (res.success && res.data) {
        setInquiries(res.data.inquiries);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(1);
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries(1);
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await adminService.updateInquiryStatus(inquiryId, { status: newStatus });
      if (res.success) {
        setToastMessage(`Inquiry status updated to ${newStatus}`);
        setTimeout(() => setToastMessage(''), 3000);
        fetchInquiries(pagination.page);
        if (selectedInquiry && selectedInquiry._id === inquiryId) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsUpdatingStatus(true);
    try {
      const res = await adminService.updateInquiryStatus(selectedInquiry._id, { adminNotes: adminNotesInput });
      if (res.success) {
        setToastMessage('Admin notes saved successfully');
        setTimeout(() => setToastMessage(''), 3000);
        setSelectedInquiry((prev) => ({ ...prev, adminNotes: adminNotesInput }));
        fetchInquiries(pagination.page);
      }
    } catch (err) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await adminService.deleteInquiry(inquiryToDelete._id);
      if (res.success) {
        setToastMessage(`Inquiry ${inquiryToDelete.inquiryNumber} deleted.`);
        setTimeout(() => setToastMessage(''), 3000);
        setInquiryToDelete(null);
        fetchInquiries(pagination.page);
      }
    } catch (err) {
      alert('Failed to delete inquiry: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetailsModal = (inq) => {
    setSelectedInquiry(inq);
    setAdminNotesInput(inq.adminNotes || '');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="warning">New Inquiry</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Resolved</Badge>;
      case 'CLOSED':
        return <Badge variant="default">Closed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            background: '#16A34A',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 6,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
            fontWeight: 500
          }}
        >
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem', margin: 0 }}>
            Devotee Contact Inquiries
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            Manage queries submitted through the Contact Us page, assign resolution status, and follow up directly with devotees.
          </p>
        </div>

        <Button variant="secondary" onClick={() => fetchInquiries(pagination.page)}>
          <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh
        </Button>
      </div>

      {/* Metric Summary Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#1d4ed8' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Total Inquiries</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>{stats.totalAll}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#b45309' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>New Unresolved</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#b45309' }}>{stats.newCount}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e0e7ff', display: 'grid', placeItems: 'center', color: '#4338ca' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>In Progress</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#4338ca' }}>{stats.inProgressCount}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#15803d' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Resolved</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#15803d' }}>{stats.resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search by name, phone, email, or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  border: '1px solid #CBD5E1',
                  borderRadius: 6,
                  fontSize: '0.88rem'
                }}
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="">All Categories</option>
              <option value="Ticket & Pass Inquiries">Ticket & Pass Inquiries</option>
              <option value="Pooja Box Inquiries">Pooja Box Inquiries</option>
              <option value="Sankalpam & Archana Support">Sankalpam & Archana Support</option>
              <option value="Payment & Billing Assistance">Payment & Billing Assistance</option>
              <option value="Delivery & Courier Tracking">Delivery & Courier Tracking</option>
              <option value="General Inquiries">General Inquiries</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.88rem', background: '#fff' }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date & Inquiry #</th>
                <th>Devotee Details</th>
                <th>Category</th>
                <th>Message Snippet</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                    Loading inquiries from database...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                    No devotee inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => {
                  const cleanPhone = inq.phone ? inq.phone.replace(/\D/g, '') : '';
                  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                  const waText = encodeURIComponent(`Vanakkam ${inq.name}, regarding your inquiry (${inq.inquiryNumber}) on Sri Sankara TV:`);

                  return (
                    <tr key={inq._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{inq.inquiryNumber}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                          {new Date(inq.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{inq.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <a
                            href={`tel:+91${cleanPhone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: '#475569',
                              fontSize: '0.8rem',
                              textDecoration: 'none'
                            }}
                            title="Call Devotee"
                          >
                            <Phone size={13} color="#D9731A" />
                            {inq.phone}
                          </a>
                          <a
                            href={`https://wa.me/${waNumber}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#16A34A', display: 'inline-flex' }}
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                        </div>
                        {inq.email && (
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                            {inq.email}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.8rem',
                            fontWeight: 500
                          }}
                        >
                          {inq.category}
                        </span>
                      </td>

                      <td style={{ maxWidth: 300 }}>
                        <div
                          style={{
                            fontSize: '0.86rem',
                            color: '#334155',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {inq.message}
                        </div>
                      </td>

                      <td>
                        <select
                          value={inq.status}
                          disabled={isUpdatingStatus}
                          onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: '1px solid #CBD5E1',
                            background:
                              inq.status === 'NEW'
                                ? '#FEF3C7'
                                : inq.status === 'IN_PROGRESS'
                                ? '#E0E7FF'
                                : inq.status === 'RESOLVED'
                                ? '#DCFCE7'
                                : '#F1F5F9',
                            color:
                              inq.status === 'NEW'
                                ? '#92400E'
                                : inq.status === 'IN_PROGRESS'
                                ? '#3730A3'
                                : inq.status === 'RESOLVED'
                                ? '#166534'
                                : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="NEW">NEW</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => openDetailsModal(inq)}
                            style={{
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: 4,
                              padding: '6px 10px',
                              cursor: 'pointer',
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.8rem'
                            }}
                            title="View Full Inquiry"
                          >
                            <Eye size={14} /> Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setInquiryToDelete(inq)}
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FEE2E2',
                              borderRadius: 4,
                              padding: '6px 8px',
                              cursor: 'pointer',
                              color: '#DC2626'
                            }}
                            title="Delete Inquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Showing {inquiries.length} of {pagination.total} inquiries (Page {pagination.page} of {pagination.pages})
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchInquiries(pagination.page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchInquiries(pagination.page + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* INQUIRY DETAILS & NOTES MODAL */}
      {selectedInquiry && (
        <Modal
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          title={`Inquiry Details — ${selectedInquiry.inquiryNumber}`}
          maxWidth={620}
        >
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Devotee Name</span>
                <strong style={{ fontSize: '0.98rem', color: '#1E293B' }}>{selectedInquiry.name}</strong>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Submission Date</span>
                <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>
                  {new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Mobile Phone</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{selectedInquiry.phone}</strong>
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.startsWith('91') ? selectedInquiry.phone : `91${selectedInquiry.phone}`}?text=${encodeURIComponent(`Vanakkam ${selectedInquiry.name}, regarding your inquiry (${selectedInquiry.inquiryNumber}):`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none'
                    }}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Email Address</span>
                <strong style={{ fontSize: '0.92rem', color: '#1E293B', wordBreak: 'break-all' }}>{selectedInquiry.email}</strong>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Category</span>
              <span style={{ background: '#F1F5F9', color: '#1E293B', padding: '4px 10px', borderRadius: 4, fontWeight: 600, fontSize: '0.88rem' }}>
                {selectedInquiry.category}
              </span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Full Devotee Message / Query</span>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '14px 16px', borderRadius: 6, fontSize: '0.92rem', color: '#78350F', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedInquiry.message}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Admin Resolution Notes
              </label>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Add notes about your response, call with devotee, or resolution status..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  fontSize: '0.88rem',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <Button variant="secondary" onClick={handleSaveNotes} disabled={isUpdatingStatus}>
                  Save Notes
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</span>
                <select
                  value={selectedInquiry.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <Button variant="secondary" onClick={() => setSelectedInquiry(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE INQUIRY MODAL */}
      {inquiryToDelete && (
        <Modal
          isOpen={Boolean(inquiryToDelete)}
          onClose={() => !isDeleting && setInquiryToDelete(null)}
          title="Delete Devotee Inquiry"
          maxWidth={440}
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: '#dc2626' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#1E293B', fontSize: '1.15rem' }}>
              Delete Inquiry {inquiryToDelete.inquiryNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to remove this inquiry from {inquiryToDelete.name}? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button variant="secondary" disabled={isDeleting} onClick={() => setInquiryToDelete(null)}>
                Cancel
              </Button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteInquiry}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InquiriesPage;
