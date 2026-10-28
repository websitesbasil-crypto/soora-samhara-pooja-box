import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Title } from '../components/atoms/Typography';
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Send,
  CheckCircle2
} from 'lucide-react';

export const ContactPage = () => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Ticket & Pass Inquiries',
    message: ''
  });
  const [inquiryErrors, setInquiryErrors] = useState({});
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(null);
  const [inquiryError, setInquiryError] = useState('');

  const handleInquiryChange = (field) => (e) => {
    setInquiryForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (inquiryErrors[field]) {
      setInquiryErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setInquiryError('');
  };

  const validateInquiry = () => {
    const errs = {};
    if (!inquiryForm.name.trim() || inquiryForm.name.trim().length < 2) {
      errs.name = 'Please enter your full name (at least 2 characters).';
    }
    const cleanEmail = inquiryForm.email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address.';
    }
    const cleanPhone = inquiryForm.phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!inquiryForm.message.trim() || inquiryForm.message.trim().length < 5) {
      errs.message = 'Please enter your message (at least 5 characters).';
    }
    setInquiryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!validateInquiry()) return;

    setInquirySubmitting(true);
    setInquiryError('');
    setInquirySuccess(null);

    try {
      const cleanPhone = inquiryForm.phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
      const res = await orderService.submitInquiry({
        ...inquiryForm,
        phone: cleanPhone
      });
      if (res.success) {
        setInquirySuccess(res.message || 'Thank you! Your inquiry has been submitted successfully.');
        setInquiryForm({
          name: '',
          email: '',
          phone: '',
          category: 'Ticket & Pass Inquiries',
          message: ''
        });
      }
    } catch (err) {
      setInquiryError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await orderService.getPublicProduct();
        if (res.success && res.data && res.data.contactConfig) {
          setContactData(res.data.contactConfig);
        }
      } catch (err) {
        console.warn('[ContactPage] Using default contact info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Safe defaults aligned with Super Admin configuration
  const tamilTitle = contactData?.tamilTitle || 'தொடர்புக்கு / உதவிக்கு';
  const mainTitle = contactData?.title || 'Contact Sri Sankara TV';
  const description = contactData?.description ||
    'For any queries regarding the sacred Sathru Samhara Maha Yagam Pooja Box, booking assistance, temple travels, or delivery inquiries, our devotional care team is available to assist you.';
  const phone1 = contactData?.phone1 || '95917 47001';
  const phone2 = contactData?.phone2 || '95917 47002';
  const email = contactData?.email || 'Srisankaratvshop@gmail.com';
  const timings = contactData?.timings || 'Monday – Saturday: 9:00 AM – 8:00 PM IST';
  const address = contactData?.address || 'Sri Sankara TV Devotional Support Desk';

  // Helper to strip non-digit characters for tel: and WhatsApp links
  const cleanPhone = (p) => (p || '').replace(/\D/g, '');
  const p1Digits = cleanPhone(phone1);
  const p2Digits = cleanPhone(phone2);

  return (
    <div
      className="band"
      style={{
        paddingTop: 'calc(36px + 1.5vw)',
        paddingBottom: 96,
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <div className="wrap" style={{ maxWidth: 940, margin: '0 auto', width: '100%' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            lang="ta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.96rem',
              color: 'var(--gold-bright, #F2BC55)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 14,
              padding: '6px 18px',
              borderRadius: 24,
              background: 'rgba(214, 163, 66, 0.12)',
              border: '1px solid rgba(214, 163, 66, 0.35)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Sparkles size={16} />
            <span>{tamilTitle}</span>
          </div>

          <Title
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.85rem)',
              margin: '8px 0 16px 0',
              color: 'var(--head, #F7E9CF)',
              lineHeight: 1.2
            }}
          >
            {mainTitle}
          </Title>

          <p
            style={{
              maxWidth: 720,
              margin: '0 auto',
              lineHeight: 1.75,
              color: 'var(--muted, #D9C6A6)',
              fontSize: 'clamp(1rem, 1.5vw, 1.12rem)',
              fontWeight: 400
            }}
          >
            {description}
          </p>
        </div>

        {/* Primary Contact Numbers Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 36
          }}
        >
          {/* Helpline 1 */}
          <div
            style={{
              background: 'linear-gradient(160deg, #351014 0%, #26090D 100%)',
              border: '1px solid rgba(214, 163, 66, 0.35)',
              borderRadius: 14,
              padding: '32px 28px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(214, 163, 66, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(214, 163, 66, 0.15)',
                    border: '1px solid rgba(214, 163, 66, 0.35)',
                    color: 'var(--gold-bright, #F2BC55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Headphones size={22} />
                </span>
                <div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-bright, #F2BC55)'
                    }}
                  >
                    Devotee Helpline 1
                  </span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--muted, #D9C6A6)' }}>
                    Primary Support Line
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 'clamp(1.75rem, 2.6vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--head, #F7E9CF)',
                  letterSpacing: '0.04em',
                  fontFamily: 'monospace, sans-serif',
                  margin: '18px 0 24px 0'
                }}
              >
                +91 {phone1}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
              <a
                href={`tel:${p1Digits.startsWith('91') ? `+${p1Digits}` : `+91${p1Digits}`}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #F2BC55 0%, #D6A342 100%)',
                  color: '#200B0E',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(214, 163, 66, 0.35)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Phone size={16} />
                <span>Call Now</span>
              </a>

              <a
                href={`https://wa.me/${p1Digits.startsWith('91') ? p1Digits : `91${p1Digits}`}?text=${encodeURIComponent('Vanakkam, I have an inquiry regarding the Sathru Samhara Maha Yagam Pooja Box.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Helpline 2 */}
          <div
            style={{
              background: 'linear-gradient(160deg, #351014 0%, #26090D 100%)',
              border: '1px solid rgba(214, 163, 66, 0.35)',
              borderRadius: 14,
              padding: '32px 28px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(214, 163, 66, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(214, 163, 66, 0.15)',
                    border: '1px solid rgba(214, 163, 66, 0.35)',
                    color: 'var(--gold-bright, #F2BC55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Headphones size={22} />
                </span>
                <div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-bright, #F2BC55)'
                    }}
                  >
                    Devotee Helpline 2
                  </span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--muted, #D9C6A6)' }}>
                    Secondary Support Line
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 'clamp(1.75rem, 2.6vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--head, #F7E9CF)',
                  letterSpacing: '0.04em',
                  fontFamily: 'monospace, sans-serif',
                  margin: '18px 0 24px 0'
                }}
              >
                +91 {phone2}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
              <a
                href={`tel:${p2Digits.startsWith('91') ? `+${p2Digits}` : `+91${p2Digits}`}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #F2BC55 0%, #D6A342 100%)',
                  color: '#200B0E',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(214, 163, 66, 0.35)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Phone size={16} />
                <span>Call Now</span>
              </a>

              <a
                href={`https://wa.me/${p2Digits.startsWith('91') ? p2Digits : `91${p2Digits}`}?text=${encodeURIComponent('Vanakkam, I have an inquiry regarding the Sathru Samhara Maha Yagam Pooja Box.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* SUBMIT YOUR INQUIRY FORM */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '36px 32px',
            marginBottom: 40,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            color: '#1E293B'
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: '1.45rem',
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontWeight: 700,
                color: '#1E293B',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: '0 0 6px'
              }}
            >
              SUBMIT YOUR INQUIRY
            </h3>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem' }}>
              Please enter your contact details and message below
            </p>
          </div>

          {inquirySuccess && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '14px 18px',
                borderRadius: 8,
                fontSize: '0.9rem',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <CheckCircle2 size={20} color="#16A34A" />
              <span>{inquirySuccess}</span>
            </div>
          )}

          {inquiryError && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '14px 18px',
                borderRadius: 8,
                fontSize: '0.9rem',
                marginBottom: 20
              }}
            >
              {inquiryError}
            </div>
          )}

          <form onSubmit={handleInquirySubmit} noValidate>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '18px 24px',
                marginBottom: 18
              }}
            >
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Full Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={inquiryForm.name}
                  onChange={handleInquiryChange('name')}
                  placeholder="e.g. S. Ramanathan"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: inquiryErrors.name ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    borderRadius: 8,
                    fontSize: '0.95rem',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                />
                {inquiryErrors.name && (
                  <p style={{ color: '#DC2626', fontSize: '0.78rem', margin: '4px 0 0' }}>{inquiryErrors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  value={inquiryForm.email}
                  onChange={handleInquiryChange('email')}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: inquiryErrors.email ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    borderRadius: 8,
                    fontSize: '0.95rem',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                />
                {inquiryErrors.email && (
                  <p style={{ color: '#DC2626', fontSize: '0.78rem', margin: '4px 0 0' }}>{inquiryErrors.email}</p>
                )}
              </div>

              {/* Mobile Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Mobile Phone <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={handleInquiryChange('phone')}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: inquiryErrors.phone ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    borderRadius: 8,
                    fontSize: '0.95rem',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                />
                {inquiryErrors.phone && (
                  <p style={{ color: '#DC2626', fontSize: '0.78rem', margin: '4px 0 0' }}>{inquiryErrors.phone}</p>
                )}
              </div>

              {/* Inquiry Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  Inquiry Category <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={inquiryForm.category}
                  onChange={handleInquiryChange('category')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    fontSize: '0.95rem',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Ticket & Pass Inquiries">Ticket & Pass Inquiries</option>
                  <option value="Pooja Box Inquiries">Pooja Box Inquiries</option>
                  <option value="Sankalpam & Archana Support">Sankalpam & Archana Support</option>
                  <option value="Payment & Billing Assistance">Payment & Billing Assistance</option>
                  <option value="Delivery & Courier Tracking">Delivery & Courier Tracking</option>
                  <option value="General Inquiries">General Inquiries</option>
                </select>
              </div>
            </div>

            {/* Message Textarea */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                Your Message / Query <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={inquiryForm.message}
                onChange={handleInquiryChange('message')}
                placeholder="Please elaborate on your query, preferred dates, or assistance needed..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: inquiryErrors.message ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  background: '#FFFFFF',
                  color: '#1E293B',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              {inquiryErrors.message && (
                <p style={{ color: '#DC2626', fontSize: '0.78rem', margin: '4px 0 0' }}>{inquiryErrors.message}</p>
              )}
            </div>

            {/* Send Inquiry Button */}
            <div>
              <button
                type="submit"
                disabled={inquirySubmitting}
                style={{
                  background: '#7B1824',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 30,
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: inquirySubmitting ? 'not-allowed' : 'pointer',
                  opacity: inquirySubmitting ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 14px rgba(123, 24, 36, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{inquirySubmitting ? 'Sending...' : 'SEND INQUIRY'}</span>
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>

        {/* Devotee Assistance & Office Hours Card */}
        <div
          style={{
            background: 'rgba(46, 13, 18, 0.75)',
            border: '1px solid rgba(214, 163, 66, 0.3)',
            borderRadius: 14,
            padding: '28px 32px',
            marginBottom: 40,
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35)'
          }}
        >
          <h3
            style={{
              fontSize: '1.18rem',
              fontWeight: 600,
              color: 'var(--head, #F7E9CF)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--font-display)'
            }}
          >
            <ShieldCheck size={22} color="var(--gold-bright, #F2BC55)" />
            <span>Devotee Assistance & Office Hours</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 22
            }}
          >
            {/* Timings */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(214, 163, 66, 0.12)',
                  border: '1px solid rgba(214, 163, 66, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}
              >
                <Clock size={18} color="var(--gold, #D6A342)" />
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--head, #F7E9CF)', marginBottom: 3 }}>
                  Helpline Support Hours
                </strong>
                <span style={{ fontSize: '0.88rem', color: 'var(--muted, #D9C6A6)', lineHeight: 1.55 }}>
                  {timings}
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(214, 163, 66, 0.12)',
                  border: '1px solid rgba(214, 163, 66, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}
              >
                <Mail size={18} color="var(--gold, #D6A342)" />
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--head, #F7E9CF)', marginBottom: 3 }}>
                  Devotee Email Desk
                </strong>
                <a
                  href={`mailto:${email}`}
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--gold-bright, #F2BC55)',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    wordBreak: 'break-all'
                  }}
                >
                  {email}
                </a>
              </div>
            </div>

            {/* Service Location / Desk */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(214, 163, 66, 0.12)',
                  border: '1px solid rgba(214, 163, 66, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}
              >
                <MapPin size={18} color="var(--gold, #D6A342)" />
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--head, #F7E9CF)', marginBottom: 3 }}>
                  Devotional Broadcast Center
                </strong>
                <span style={{ fontSize: '0.88rem', color: 'var(--muted, #D9C6A6)', lineHeight: 1.55 }}>
                  {address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Order Action */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/#order"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 32px',
              borderRadius: 6,
              background: 'linear-gradient(135deg, #F2BC55 0%, #D6A342 100%)',
              color: '#200B0E',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(214, 163, 66, 0.4)',
              transition: 'all 0.25s ease'
            }}
          >
            <span>Book Sathru Samhara Maha Yagam Pooja Box</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
