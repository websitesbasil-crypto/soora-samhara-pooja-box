import React from 'react';
import { Eyebrow, TamilText } from '../atoms/Typography';
import { PriceDisplay } from '../molecules/PriceDisplay';
import { Button } from '../atoms/Button';
import { useCountdown } from '../../hooks/useCountdown';
import TempleGopuramSketch from '../atoms/TempleGopuramSketch';
import CornerDiyaAccent from '../atoms/CornerDiyaAccent';
import HeroFlourish from '../atoms/HeroFlourish';
import { MapPin } from 'lucide-react';

export const HeroSection = ({
  product,
  countdownDate = '2026-12-20T00:00:00+05:30',
  eventLocation = 'Tirupathi',
  eventDateFormatted = '20 December 2026'
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
            <Eyebrow>Vaikunta Ekadesi · Tirupathi 2026</Eyebrow>
            <TamilText>{product?.tamilTitle || 'மஹா சுதர்சன யாகம்'}</TamilText>
            <h1 className="hero-heading">
              {(() => {
                const name = product?.name || 'Maha Sudarshana Yaagam';
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
              {product?.description || "Register your Sankalpam for the Maha Sudarshana Yaagam, a sacred Vedic fire ritual to Lord Sudarshana, the divine discus of Lord Maha Vishnu, performed by Sri Sankara TV in Tirupathi on the holy day of Vaikunta Ekadesi. Every registered devotee receives a special Sankalpam box of eight sacred items, dispatched by post to the registered address after the Yaagam."}
            </p>

            <PriceDisplay amountInRupees={priceInRupees} note="per Sankalpam, with one Sankalpam box" />

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
            <div className="hero-image-wrapper">
              <img
                src={product?.imageUrl || "/Luxury Maroon Murugan Pooja Kit.png"}
                alt="Sri Sankara TV Maha Sudarshana Yaagam 2026 - Sanctified kit featuring Lord Venkateswara idol, vastram, brass pots, and sacred raksha"
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

              {/* Top-Right Corner Venue Notice Band / Tag */}
              <aside className="hero-corner-tag" aria-label="Venue Notice">
                <div className="hero-corner-tag-badge">
                  <MapPin size={12} aria-hidden="true" />
                  <span>VENUE</span>
                </div>
                <p className="hero-corner-tag-text">
                  <strong>Venue:</strong> Kalyana Mandapam, Tirupathi. Exact venue details will be announced soon.
                </p>
              </aside>
            </div>

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
