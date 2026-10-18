import React from 'react';
import { Eyebrow, Title, Lede } from '../atoms/Typography';
import { Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductContents = ({ items = [], contactConfig = null }) => {
  const contentsList = Array.isArray(items) ? items : [];

  const phone1 = contactConfig?.phone1 || '95917 47001';
  const phone2 = contactConfig?.phone2 || '95917 47002';

  const cleanPhone = (p) => (p || '').replace(/\D/g, '');
  const p1Digits = cleanPhone(phone1);
  const p2Digits = cleanPhone(phone2);

  return (
    <section className="band" id="inside">
      <div className="wrap inside-grid">
        <div>
          <Eyebrow>Inside the box</Eyebrow>
          <Title>Five things, blessed along the way</Title>
          <Lede>
            Everything is packed as one box and travels together from temple to temple, ending at the Yaagam in Thiruttani.
          </Lede>
        </div>
        <ul className="items">
          {contentsList.length === 0 ? (
            <li style={{ padding: '24px 0', color: 'var(--muted)' }}>
              Loading contents from temple registry...
            </li>
          ) : (
            contentsList.map((item, index) => (
              <li key={item._id || index}>
                <span className="qty">{item.qty}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Devotee Queries & Helplines Strip */}
      <div className="wrap" style={{ marginTop: 44 }}>
        <div
          style={{
            borderTop: '1px solid var(--line, rgba(214, 163, 66, 0.22))',
            paddingTop: 28,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(214, 163, 66, 0.12)',
                border: '1px solid rgba(214, 163, 66, 0.3)',
                color: 'var(--gold, #D6A342)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Phone size={19} />
            </span>
            <div>
              <div
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: 'var(--head, #F7E9CF)',
                  marginBottom: 2
                }}
              >
                For any queries regarding the Pooja Box, please reach out to us:
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--muted, #D9C6A6)' }}>
                Our devotional support team is available to assist devotees
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <a
              href={`tel:${p1Digits.startsWith('91') ? `+${p1Digits}` : `+91${p1Digits}`}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 6,
                background: 'rgba(214, 163, 66, 0.1)',
                border: '1px solid var(--line-gold, #D6A342)',
                color: 'var(--gold-bright, #F2BC55)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                fontFamily: 'monospace, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              <Phone size={15} />
              <span>+91 {phone1}</span>
            </a>

            <a
              href={`tel:${p2Digits.startsWith('91') ? `+${p2Digits}` : `+91${p2Digits}`}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 6,
                background: 'rgba(214, 163, 66, 0.1)',
                border: '1px solid var(--line-gold, #D6A342)',
                color: 'var(--gold-bright, #F2BC55)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                fontFamily: 'monospace, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              <Phone size={15} />
              <span>+91 {phone2}</span>
            </a>

            <Link
              to="/contact"
              style={{
                fontSize: '0.86rem',
                color: 'var(--gold-bright, #F2BC55)',
                textDecoration: 'underline',
                fontWeight: 600,
                paddingLeft: 4
              }}
            >
              More Contact Details →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductContents;
