import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Eyebrow, Title, Lede } from '../components/atoms/Typography';
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

  // Safe defaults
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
    <div className="band" style={{ paddingTop: 48, paddingBottom: 64, minHeight: '80vh' }}>
      <div className="wrap" style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            lang="ta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '1rem',
              color: 'var(--hero-gold, #E4B655)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 8,
              padding: '4px 14px',
              borderRadius: 20,
              background: 'rgba(228, 182, 85, 0.1)',
              border: '1px solid rgba(228, 182, 85, 0.25)'
            }}
          >
            <Sparkles size={16} />
            <span>{tamilTitle}</span>
          </div>

          <Title style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', margin: '12px 0' }}>
            {mainTitle}
          </Title>

          <Lede
            style={{
              maxWidth: 680,
              margin: '0 auto',
              lineHeight: 1.65,
              color: '#4A5568',
              fontSize: '1.05rem'
            }}
          >
            {description}
          </Lede>
        </div>

        {/* Primary Contact Numbers Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            marginBottom: 32
          }}
        >
          {/* Helpline 1 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(228, 182, 85, 0.45)',
              borderRadius: 12,
              padding: '28px 24px',
              boxShadow: '0 8px 24px rgba(47, 10, 18, 0.06)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(228, 182, 85, 0.18)',
                    color: '#8A1528',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Headphones size={20} />
                </span>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#8A1528'
                    }}
                  >
                    Devotee Helpline 1
                  </span>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Primary Support Line</div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 'clamp(1.6rem, 2.5vw, 1.95rem)',
                  fontWeight: 800,
                  color: '#2F0A12',
                  letterSpacing: '0.04em',
                  fontFamily: 'monospace, sans-serif',
                  margin: '16px 0 20px 0'
                }}
              >
                +91 {phone1}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
              <a
                href={`tel:${p1Digits.startsWith('91') ? `+${p1Digits}` : `+91${p1Digits}`}`}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 6,
                  background: '#2F0A12',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  border: '1px solid #2F0A12'
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
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 6,
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  border: '1px solid #25D366'
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
              background: '#FFFFFF',
              border: '1.5px solid rgba(228, 182, 85, 0.45)',
              borderRadius: 12,
              padding: '28px 24px',
              boxShadow: '0 8px 24px rgba(47, 10, 18, 0.06)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(228, 182, 85, 0.18)',
                    color: '#8A1528',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Headphones size={20} />
                </span>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#8A1528'
                    }}
                  >
                    Devotee Helpline 2
                  </span>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Secondary Support Line</div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 'clamp(1.6rem, 2.5vw, 1.95rem)',
                  fontWeight: 800,
                  color: '#2F0A12',
                  letterSpacing: '0.04em',
                  fontFamily: 'monospace, sans-serif',
                  margin: '16px 0 20px 0'
                }}
              >
                +91 {phone2}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
              <a
                href={`tel:${p2Digits.startsWith('91') ? `+${p2Digits}` : `+91${p2Digits}`}`}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 6,
                  background: '#2F0A12',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  border: '1px solid #2F0A12'
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
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 6,
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  border: '1px solid #25D366'
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Devotional Assistance Details */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '24px 28px',
            marginBottom: 36,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#2F0A12',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ShieldCheck size={20} color="#8A1528" />
            Devotee Assistance & Office Hours
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20
            }}
          >
            {/* Timings */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Clock size={20} color="#8A1528" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1E293B', marginBottom: 2 }}>
                  Helpline Support Hours
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  {timings}
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Mail size={20} color="#8A1528" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1E293B', marginBottom: 2 }}>
                  Devotee Email Desk
                </strong>
                <a
                  href={`mailto:${email}`}
                  style={{
                    fontSize: '0.85rem',
                    color: '#8A1528',
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
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <MapPin size={20} color="#8A1528" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1E293B', marginBottom: 2 }}>
                  Devotional Broadcast Center
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
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
            className="btn-gold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 28px',
              borderRadius: 6,
              background: 'linear-gradient(135deg, #E4B655 0%, #D4A33B 100%)',
              color: '#2F0A12',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(228, 182, 85, 0.4)'
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
