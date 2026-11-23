import React from 'react';
import { Eyebrow, Title, Lede } from '../atoms/Typography';
import { TempleCard } from '../molecules/TempleCard';

export const TempleJourney = ({ temples = [] }) => {
  const templeList = Array.isArray(temples) ? temples : [];

  return (
    <section className="band temples" id="temples">
      <div className="wrap">
        <Eyebrow>The journey</Eyebrow>
        <Title>What is Maha Sudarshana Yaagam?</Title>
        <Lede>
          Maha Sudarshana Yaagam is a sacred Vedic fire ritual dedicated to Lord Sudarshana, the divine discus of Lord Maha Vishnu. In Hindu tradition, Lord Sudarshana represents divine protection, righteousness, spiritual illumination and the destruction of negative influences.

          The Yaagam is performed with sacred mantras, offerings into the homa fire and prayers invoking the blessings of Lord Sudarshana. Devotees traditionally take part seeking these blessings:
        </Lede>
        <div className="temple-grid">
          {templeList.length === 0 ? (
            <div style={{ color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '30px 0' }}>
              Loading sacred pilgrimage temples from database...
            </div>
          ) : (
            templeList.map((temple, index) => (
              <TempleCard
                key={temple._id || index}
                index={index}
                ta={temple.ta}
                en={temple.en}
                where={temple.where}
                isFinal={temple.isFinal}
                flag={temple.flag}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TempleJourney;
