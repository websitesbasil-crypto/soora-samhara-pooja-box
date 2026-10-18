import React from 'react';
import { Eyebrow, TamilText } from '../atoms/Typography';
import { PriceDisplay } from '../molecules/PriceDisplay';
import { Button } from '../atoms/Button';
import { useCountdown } from '../../hooks/useCountdown';
import TempleGopuramSketch from '../atoms/TempleGopuramSketch';
import CornerDiyaAccent from '../atoms/CornerDiyaAccent';
import HeroFlourish from '../atoms/HeroFlourish';

export const HeroSection = ({
  product,
  countdownDate = '2026-11-15T00:00:00+05:30',
  eventLocation = 'Thiruttani',
  eventDateFormatted = '15 November 2026'
}) => {
  const { label } = useCountdown(countdownDate);
  const priceInRupees = product?.priceInPaise ? product.priceInPaise / 100 : 2500;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      {/* Background Decorative Layer 1: South Indian Temple Gopuram Watermark (Left) */}
      <TempleGopuramSketch />

      {/* Background Decorative Layer 2: Brass Oil Lamp, Jasmine Flowers & Silk Accent (Bottom Left) */}
      <CornerDiyaAccent />

      {/* Background Layer 3: Warm Ambient Radial Light Spotlights */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      {/* Main Two-Column Content Stage */}
      <div className="wrap hero-wrap">
        <div className="hero-grid">
          {/* Left Column (approx 45%): Editorial Devotional Typography & Actions */}
          <div className="hero-content">
            <Eyebrow>Arupadai Veedu · Sathru Samhara 2026</Eyebrow>
            <TamilText>{product?.tamilTitle || 'சத்ரு சம்ஹார மகா யாகம்'}</TamilText>
            <h1 className="hero-heading">
              {(() => {
                const name = product?.name || 'Sathru Samhara Maha Yagam';
                if (name.includes('\n')) {
                  return name.split('\n').map((line, idx) => (
                    <span key={idx} style={{ display: 'block' }}>{line}</span>
                  ));
                }
                const words = name.trim().split(/\s+/);
                if (words.length === 4) {
                  return (
                    <>
                      <span style={{ display: 'block' }}>{words.slice(0, 2).join(' ')}</span>
                      <span style={{ display: 'block' }}>{words.slice(2).join(' ')}</span>
                    </>
                  );
                }
                if (words.length >= 2) {
                  const mid = Math.ceil(words.length / 2);
                  return (
                    <>
                      <span style={{ display: 'block' }}>{words.slice(0, mid).join(' ')}</span>
                      <span style={{ display: 'block' }}>{words.slice(mid).join(' ')}</span>
                    </>
                  );
                }
                return <span style={{ display: 'block' }}>{name}</span>;
              })()}
            </h1>
            <p className="hero-sub">
              {product?.description || "A sacred collection blessed by the divine grace of Lord Murugan, featuring holy vibhuti from all six Arupadai Veedu temples, a Murugan keepsake idol, a rudraksha bracelet, and sacred chandan. Accompanying the divine journey across all six abodes of Lord Murugan, the box will reach the grand Yaagam at Thiruttani on 15 November, carrying the sanctity of this spiritual pilgrimage to your home. Each box comes with an authentication certificate, preserving the sacred significance of this divine offering."}
            </p>

            <PriceDisplay amountInRupees={priceInRupees} note="per box, one standard box" />

            <div className="cta-row">
              <Button onClick={() => scrollTo('order')} href="#order" className="btn-hero-primary">
                Reserve your box
              </Button>
              <a
                className="link-quiet hero-link-quiet"
                href="#inside"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('inside');
                }}
              >
                See what is inside
              </a>
            </div>

            {/* Premium Yaagam Countdown Panel */}
            <div className="countdown-box">
              <strong className="countdown-days">{label}</strong>
              <span className="countdown-sep" aria-hidden="true" />
              <span className="countdown-meta">{eventDateFormatted} · {product?.eventLocation || eventLocation}</span>
            </div>

            {/* Traditional 5-diamond antique gold kolam motif */}
            <HeroFlourish />
          </div>

          {/* Right Column (approx 55%): Realistic Cinematic Pooja Box Display */}
          <div className="hero-product-stage">
            <img
              src={product?.imageUrl || "/hero-product-kit.png"}
              alt="Sri Sankara TV Sathru Samhara Maha Yagam 2026 - Sanctified kit featuring Lord Murugan statue, 6 Arupadai vibhuti tins, rudraksh bracelet, chandan and final Yaagam box"
              className="hero-box-img"
              width="1024"
              height="1152"
              loading="eager"
              onError={(e) => {
                if (!e.target.dataset.triedFallback) {
                  e.target.dataset.triedFallback = 'true';
                  e.target.src = '/hero-product-kit.png';
                }
              }}
            />
            <div className="hero-image-disclaimer">
              <p className="hero-disclaimer-en">Images are for representation purposes only. The actual product may differ.</p>
              <p className="hero-disclaimer-ta" lang="ta">படங்கள் விளக்கத்திற்காக மட்டுமே</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
