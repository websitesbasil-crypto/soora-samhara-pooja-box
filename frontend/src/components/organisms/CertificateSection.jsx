import React from 'react';
import { Eyebrow, Title, Lede } from '../atoms/Typography';
import { CertificateCard } from '../molecules/CertificateCard';

export const CertificateSection = ({ config, productName }) => {
  const points = config?.verificationPoints || [
    'Sanctified items blessed at Tirupathi',
    'Box sanctified at the grand Maha Sudarshana Yaagam at Tirupathi on 20 December',
    'Certificate issued by Sri Sankara TV, packed inside your box'
  ];

  return (
    <section className="band" id="certificate">
      <div className="wrap cert-grid">
        <CertificateCard
          authority={config?.authority || 'Sri Sankara TV'}
          title={config?.title || 'Authentication Certificate'}
          subtitle={config?.subtitle || (productName ? `${productName} 2026` : 'Maha Sudarshana Yaagam 2026')}
          sealText={config?.sealText || 'ஓம்'}
          caption={config?.caption || 'Illustration of the certificate. Final design may differ.'}
        />
        <div>
          <Eyebrow>Proof that it is genuine</Eyebrow>
          <Title>The divine significance of Vaikunta Ekadesi</Title>
          <Lede>
            Vaikunta Ekadesi is one of the most sacred observances dedicated to Lord Maha Vishnu. Especially cherished in Vaishnavite tradition, it is a day of devotion, spiritual purification, surrender to the Lord and the aspiration for moksha. On this day, the Vaikunta Dwaram, or Paramapada Vasal, is opened in many Vishnu temples.

            Performing the Maha Sudarshana Yaagam on this day brings two devotional traditions together:
          </Lede>
          <ul className="checks">
            {points.map((point, index) => (
              <li key={index}>
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--gold)' }} />
                  <path d="M6.5 11.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--gold)' }} />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CertificateSection;
