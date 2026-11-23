import React from 'react';

export const PriceDisplay = ({ amountInRupees = 2500, note = 'per Sankalpam, with one Sankalpam box' }) => {
  const formatted = `₹${amountInRupees.toLocaleString('en-IN')}`;

  return (
    <div className="price-row">
      <span className="price">{formatted}</span>
      {note && <span className="price-note">{note}</span>}
    </div>
  );
};

export default PriceDisplay;
