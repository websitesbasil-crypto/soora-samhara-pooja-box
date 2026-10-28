import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Modal from '../components/molecules/Modal';
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Package,
  IndianRupee,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  User,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  Lock
} from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBoxes: 0,
    totalRevenueInRupees: 0,
    paidCount: 0,
    pendingCount: 0
  });
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Manual Booking Creation Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    password: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    quantity: 1,
    amountInRupees: 2500,
    paymentReference: '',
    paymentMethod: 'manual_admin',
    sankalpamDetails: [
      { name: '', natchathiram: '' },
      { name: '', natchathiram: '' },
      { name: '', natchathiram: '' },
      { name: '', natchathiram: '' }
    ]
  });
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [manualError, setManualError] = useState('');

  const handleManualFormChange = (field, value) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
    setManualError('');
  };

  const handleSankalpamChange = (index, field, value) => {
    setManualForm((prev) => {
      const updated = [...prev.sankalpamDetails];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sankalpamDetails: updated };
    });
  };

  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim()) {
      setManualError('Please enter Devotee Full Name.');
      return;
    }
    const cleanPhone = manualForm.customerPhone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setManualError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!manualForm.address.trim()) {
      setManualError('Please enter the delivery street address.');
      return;
    }
    if (!manualForm.pincode.trim() || !/^\d{6}$/.test(manualForm.pincode.trim())) {
      setManualError('Please enter a valid 6-digit PIN code.');
      return;
    }
    if (manualForm.password && manualForm.password.length < 6) {
      setManualError('Password must be at least 6 characters long.');
      return;
    }

    setIsCreatingManual(true);
    setManualError('');
    try {
      const res = await adminService.createManualOrder({
        ...manualForm,
        customerPhone: cleanPhone,
        sankalpamDetails: manualForm.sankalpamDetails.filter(p => p.name.trim() || p.natchathiram.trim())
      });
      if (res.success) {
        setToastMessage(`Booking created successfully! Order: ${res.data?.orderNumber || 'Created'}`);
        setIsManualModalOpen(false);
        setManualForm({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          password: '',
          address: '',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '',
          quantity: 1,
          amountInRupees: 2500,
          paymentReference: '',
          paymentMethod: 'manual_admin',
          sankalpamDetails: [
            { name: '', natchathiram: '' },
            { name: '', natchathiram: '' },
            { name: '', natchathiram: '' },
            { name: '', natchathiram: '' }
          ]
        });
        setTimeout(() => setToastMessage(''), 4000);
        fetchOrders(1);
      }
    } catch (err) {
      setManualError(err.message || 'Failed to create manual order');
    } finally {
      setIsCreatingManual(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({
        page,
        limit: 15,
        search,
        orderStatus,
        paymentStatus
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [orderStatus, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleExportCSV = async () => {
    try {
      const blob = await adminService.exportOrdersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sri_sankara_orders_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await adminService.deleteOrder(orderToDelete._id);
      if (res.success) {
        setToastMessage(`Order ${orderToDelete.orderNumber} permanently deleted.`);
        setOrderToDelete(null);
        setTimeout(() => setToastMessage(''), 4000);
        fetchOrders(pagination.page);
      }
    } catch (err) {
      alert('Failed to delete order: ' + (err.message || 'Server error'));
    } finally {
      setIsDeleting(false);
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

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem', margin: 0 }}>
            Order Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            Review, track, manage, and delete devotee pooja box reservations with real-time database details.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => setIsManualModalOpen(true)}>
            <PlusCircle size={15} style={{ marginRight: 6 }} /> Manual Booking Creation
          </Button>
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={15} style={{ marginRight: 6 }} /> Export CSV
          </Button>
          <Button variant="secondary" onClick={() => fetchOrders(pagination.page)}>
            <RefreshCw size={15} />
          </Button>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fef2f2', display: 'grid', placeItems: 'center', color: '#991b1b' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {stats.totalOrders || pagination.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Live in database</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fffbeb', display: 'grid', placeItems: 'center', color: '#b45309' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pooja Boxes Booked</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {stats.totalBoxes}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Units requested</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#15803d' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Offerings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              ₹{Number(stats.totalRevenueInRupees || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{stats.paidCount} paid orders</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fff7ed', display: 'grid', placeItems: 'center', color: '#c2410c' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Checkout</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {stats.pendingCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>Awaiting payment</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: 16 }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="Search by order #, devotee name, phone, Razorpay ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ width: '100%', paddingLeft: 34 }}
            />
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="admin-select"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="CREATED">Created</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="admin-select"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid / Captured</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
            Total Orders: <strong style={{ color: '#4A0F1B' }}>{pagination.total}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Showing {orders.length} order records on page {pagination.page}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Devotee Name</th>
                <th>Phone</th>
                <th>City, State</th>
                <th>Qty</th>
                <th>Total (INR)</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    No matching orders found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForDetails(ord)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: '#4A0F1B',
                          textDecoration: 'underline'
                        }}
                        title="Click to view full details"
                      >
                        {ord.orderNumber}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.customer?.name}</div>
                      {ord.sankalpamDetails && ord.sankalpamDetails.length > 0 && (
                        <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span>🪔</span> {ord.sankalpamDetails.length} Sankalpam ({ord.sankalpamDetails.map(p => p.natchathiram || p.name).filter(Boolean).slice(0, 2).join(', ')})
                        </div>
                      )}
                    </td>
                    <td>{ord.customer?.phone}</td>
                    <td>{ord.customer?.city}, {ord.customer?.state}</td>
                    <td>{ord.quantity}</td>
                    <td style={{ fontWeight: 600 }}>₹{(ord.totalAmountInPaise / 100).toLocaleString('en-IN')}</td>
                    <td><Badge status={ord.paymentStatus} /></td>
                    <td><Badge status={ord.orderStatus} /></td>
                    <td>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {/* View Full Details Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetails(ord)}
                          title="View Full Details"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.8rem',
                            color: '#334155'
                          }}
                        >
                          <Eye size={14} /> Details
                        </button>

                        {/* Manage Order Link */}
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 4,
                            padding: '4px 8px',
                            color: '#8A3A12',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          Manage
                        </Link>

                        {/* Delete Order Button */}
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          title="Delete Order"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 4,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Showing {orders.length} of {pagination.total} orders (Page {pagination.page} of {pagination.pages})
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchOrders(pagination.page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchOrders(pagination.page + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FULL DETAILS MODAL */}
      {selectedOrderForDetails && (
        <Modal
          isOpen={Boolean(selectedOrderForDetails)}
          onClose={() => setSelectedOrderForDetails(null)}
          title={`Full Order Details — ${selectedOrderForDetails.orderNumber}`}
          maxWidth={650}
        >
          <div style={{ fontSize: '0.9rem', color: '#334155' }}>
            {/* Status and Ref Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: 12, borderRadius: 6, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Order Reference</span>
                <strong style={{ fontSize: '1.1rem', color: '#4A0F1B' }}>{selectedOrderForDetails.orderNumber}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>ID: {selectedOrderForDetails._id}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <Badge status={selectedOrderForDetails.paymentStatus} />
                <Badge status={selectedOrderForDetails.orderStatus} />
              </div>
            </div>

            {/* Devotee Info */}
            <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={16} color="#4A0F1B" /> Devotee Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Full Name</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrderForDetails.customer?.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Phone / Mobile</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrderForDetails.customer?.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Email Address</span>
                  <div>{selectedOrderForDetails.customer?.email || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Pincode</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrderForDetails.customer?.pincode}</div>
                </div>
              </div>

              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> Complete Delivery Address
                </span>
                <div style={{ marginTop: 2, lineHeight: 1.4 }}>
                  {selectedOrderForDetails.customer?.address}, {selectedOrderForDetails.customer?.city}, {selectedOrderForDetails.customer?.state} – {selectedOrderForDetails.customer?.pincode}
                </div>
              </div>
            </div>

            {/* Sankalpam / Archana Family Members */}
            <div style={{ marginBottom: 16, border: '1px solid #FDE68A', background: '#FFFDF5', borderRadius: 6, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.98rem', fontWeight: 700 }}>
                  <span>🪔</span> Sankalpam & Archana Details (ஸங்கல்பம் & அர்ச்சனை)
                </h4>
                <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  {selectedOrderForDetails.sankalpamDetails?.length || 0} Member(s)
                </span>
              </div>
              
              {(!selectedOrderForDetails.sankalpamDetails || selectedOrderForDetails.sankalpamDetails.length === 0) ? (
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic', padding: '4px 0' }}>
                  Registered in devotee's primary name ({selectedOrderForDetails.customer?.name}).
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {selectedOrderForDetails.sankalpamDetails.map((person, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        border: '1px solid #FDE68A',
                        borderRadius: 4,
                        padding: '6px 10px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>
                          {idx + 1}. {person.name || 'Devotee'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#64748B', fontSize: '0.75rem', marginRight: 4 }}>Birth Star:</span>
                        <strong style={{ color: '#B45309' }}>
                          {person.natchathiram || 'Not Specified'}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items & Quantities */}
            <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={16} color="#4A0F1B" /> Pooja Box Details
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong>Sri Sankara TV – Sathru Samhara Maha Yagam 2026</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Includes 6 Vibhuti packets, Murugan idol, Rudraksh, Chandan & Certificate</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{selectedOrderForDetails.quantity} box(es)</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>₹2,500 / box</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>
                <span>Total Offering Amount:</span>
                <span style={{ color: '#4A0F1B' }}>₹{(selectedOrderForDetails.totalAmountInPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment & Gateway Data */}
            <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B' }}>Payment & Gateway Records</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748B' }}>Razorpay Order ID:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedOrderForDetails.razorpayOrderId || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Razorpay Payment ID:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedOrderForDetails.razorpayPaymentId || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Booked On:</span>
                  <div>{new Date(selectedOrderForDetails.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Last Updated:</span>
                  <div>{new Date(selectedOrderForDetails.updatedAt).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Action Bar inside Modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setSelectedOrderForDetails(null)}>
                Close
              </Button>
              <Link to={`/admin/orders/${selectedOrderForDetails._id}`} className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
                Manage Fulfillment
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {orderToDelete && (
        <Modal
          isOpen={Boolean(orderToDelete)}
          onClose={() => !isDeleting && setOrderToDelete(null)}
          title="Confirm Permanent Deletion"
          maxWidth={460}
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#1E293B', fontSize: '1.2rem' }}>
              Delete Order {orderToDelete.orderNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete this order for <strong>{orderToDelete.customer?.name}</strong>?
              This will remove all associated payment and courier tracking data from MongoDB. This action <strong>cannot be undone</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button
                variant="secondary"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
              >
                Cancel
              </Button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MANUAL BOOKING CREATION MODAL */}
      {isManualModalOpen && (
        <Modal
          isOpen={isManualModalOpen}
          onClose={() => !isCreatingManual && setIsManualModalOpen(false)}
          title="Manual Booking Creation"
          maxWidth={720}
        >
          <form onSubmit={handleCreateManualBooking}>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '-8px 0 16px', lineHeight: 1.4 }}>
              Register a customer order manually. This creates the devotee's account, records the ₹2,500 payment, and makes the booking visible under <strong>"MY POOJA BOX BOOKING"</strong> on the website.
            </p>

            {manualError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  marginBottom: 16
                }}
              >
                {manualError}
              </div>
            )}

            <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 6 }}>
              {/* SECTION 1: DEVOTEE & ACCOUNT CREDENTIALS */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} color="#7C2D12" /> Devotee Information & Login Credentials
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.customerName}
                      onChange={(e) => handleManualFormChange('customerName', e.target.value)}
                      placeholder="e.g. Ramakrishnan"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Mobile Phone (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={manualForm.customerPhone}
                      onChange={(e) => handleManualFormChange('customerPhone', e.target.value)}
                      placeholder="e.g. 9480363725"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={manualForm.customerEmail}
                      onChange={(e) => handleManualFormChange('customerEmail', e.target.value)}
                      placeholder="e.g. lakkrish2009@gmail.com"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Account Password * <span style={{ fontSize: '0.72rem', color: '#64748B' }}>(For devotee to log in)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.password}
                      onChange={(e) => handleManualFormChange('password', e.target.value)}
                      placeholder="e.g. Sankara2026"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DELIVERY ADDRESS */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="#7C2D12" /> Delivery Street Address
                </h4>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Complete Street Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={manualForm.address}
                    onChange={(e) => handleManualFormChange('address', e.target.value)}
                    placeholder="Door/Flat No., Building, Street Name, Area"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #CBD5E1',
                      borderRadius: 4,
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.city}
                      onChange={(e) => handleManualFormChange('city', e.target.value)}
                      placeholder="e.g. Chennai"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.state}
                      onChange={(e) => handleManualFormChange('state', e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={manualForm.pincode}
                      onChange={(e) => handleManualFormChange('pincode', e.target.value)}
                      placeholder="e.g. 600001"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SANKALPAM & ARCHANA DETAILS */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="#D97706" /> Sankalpam & Archana Details (ஸங்கல்பம் & அர்ச்சனை)
                </h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#78350F' }}>
                  Enter up to 4 family members' Names and Natchathirams (Birth Star) for the holy yagam.
                </p>

                {manualForm.sankalpamDetails.map((person, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                    <div>
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => handleSankalpamChange(idx, 'name', e.target.value)}
                        placeholder={`Member ${idx + 1} Name`}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid #FCD34D',
                          borderRadius: 4,
                          fontSize: '0.85rem',
                          background: '#fff'
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={person.natchathiram}
                        onChange={(e) => handleSankalpamChange(idx, 'natchathiram', e.target.value)}
                        placeholder={`Member ${idx + 1} Natchathiram (e.g. Rohini)`}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid #FCD34D',
                          borderRadius: 4,
                          fontSize: '0.85rem',
                          background: '#fff'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 4: PAYMENT & PRICING */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IndianRupee size={16} color="#7C2D12" /> Order & Payment Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Number of Boxes (Quantity)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={manualForm.quantity}
                      onChange={(e) => handleManualFormChange('quantity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Amount Paid (₹) * <span style={{ fontSize: '0.72rem', color: '#16A34A' }}>(Reflected everywhere)</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={manualForm.amountInRupees}
                      onChange={(e) => handleManualFormChange('amountInRupees', e.target.value)}
                      placeholder="2500"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#16A34A'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Payment Mode
                    </label>
                    <select
                      value={manualForm.paymentMethod}
                      onChange={(e) => handleManualFormChange('paymentMethod', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem',
                        background: '#fff'
                      }}
                    >
                      <option value="manual_admin">Manual Admin Booking</option>
                      <option value="upi">Direct UPI (Bank App / QR)</option>
                      <option value="cash">Cash / Offline Collection</option>
                      <option value="razorpay_manual">Razorpay Manual Reconcile</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Payment ID / Reference
                    </label>
                    <input
                      type="text"
                      value={manualForm.paymentReference}
                      onChange={(e) => handleManualFormChange('paymentReference', e.target.value)}
                      placeholder="e.g. pay_Trn85EIORrZk0S"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: 4,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16, borderTop: '1px solid #E2E8F0', paddingTop: 14 }}>
              <Button
                variant="secondary"
                disabled={isCreatingManual}
                onClick={() => setIsManualModalOpen(false)}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isCreatingManual}
                style={{
                  background: '#D9731A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: isCreatingManual ? 'not-allowed' : 'pointer',
                  opacity: isCreatingManual ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(217, 115, 26, 0.3)'
                }}
              >
                <CheckCircle size={16} />
                {isCreatingManual ? 'Creating Order...' : 'Confirm & Create Booking'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;
