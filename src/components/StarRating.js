import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onRate, readonly = false }) => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const displayValue = selected !== null ? selected : hovered !== null ? hovered : value;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: readonly ? 'default' : 'pointer', color: displayValue >= star ? '#ffc107' : '#ccc' }}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
          onClick={() => {
            if (!readonly) {
              setSelected(star);
              onRate && onRate(star);
            }
          }}
        >
          <Star size={18} fill={displayValue >= star ? '#ffc107' : 'none'} />
        </span>
      ))}
      <span style={{ marginLeft: 6, fontSize: '1rem', color: '#ffc107', fontWeight: 500 }}>
        {typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : '0.0'}
      </span>
    </div>
  );
};

export default StarRating; 