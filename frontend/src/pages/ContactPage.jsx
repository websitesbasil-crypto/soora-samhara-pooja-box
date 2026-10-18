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
  Headphones
} from 'lucide-react';

export const ContactPage = () => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

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
