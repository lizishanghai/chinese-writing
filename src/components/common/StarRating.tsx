import './StarRating.css';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  animated?: boolean;
}

export function StarRating({ stars, maxStars = 5, animated = false }: StarRatingProps) {
  return (
    <div className="star-rating">
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`star ${i < stars ? 'star--filled' : 'star--empty'} ${
            animated && i < stars ? 'animate-star-burst' : ''
          }`}
          style={animated ? { animationDelay: `${i * 0.15}s` } : undefined}
        >
          {i < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}
