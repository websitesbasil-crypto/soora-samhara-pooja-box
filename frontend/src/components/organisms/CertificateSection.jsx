import React from 'react';
import { Eyebrow, Title, Lede } from '../atoms/Typography';
import { CertificateCard } from '../molecules/CertificateCard';

export const CertificateSection = ({ config, productName }) => {
  const points = config?.verificationPoints || [
    'Vibhuti sourced from the six Arupadai temples',
    'Box taken to the final Yaagam at Thiruttani on 15 November',
    'Certificate issued by Sri Sankara TV, packed inside your box'
  ];

  return (
    <section className="band" id="certificate">
      <div className="wrap cert-grid">
        <CertificateCard
          authority={config?.authority || 'Sri Sankara TV'}
          title={config?.title || 'Authentication Certificate'}
          subtitle={config?.subtitle || (productName ? `${productName} 2026` : 'Sathru Samhara Maha Yagam 2026')}
          sealText={config?.sealText || 'வேல்'}
          caption={config?.caption || 'Illustration of the certificate. Final design may differ.'}
        />
        <div>
          <Eyebrow>Proof that it is genuine</Eyebrow>
          <Title>Every box carries a certificate</Title>
          <Lede>
            This is no ordinary offering. Your sacred box accompanies the divine pilgrimage to all six Arupadai Veedu and the Sathru Samhara Maha Yagam at Thiruttani, arriving with an authentication certificate that honours its sacred journey.
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
