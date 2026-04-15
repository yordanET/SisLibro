"use client";

import { useMemo } from "react";

function Star({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "#C4A77D" : "none"}
      stroke={filled ? "#C4A77D" : "#DDD7CC"}
      strokeWidth="1.6"
    >
      <path d="M12 17.3l-5.2 3 1.4-5.9L3 9.9l6.1-.5L12 3.8l2.9 5.6 6.1.5-5.2 4.5 1.4 5.9z" />
    </svg>
  );
}

export function StarRatingDisplay({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const filledCount = useMemo(() => {
    if (!Number.isFinite(rating) || rating <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(5, Math.floor(rating)));
  }, [rating]);

  return (
    <div className={`star-rating flex gap-0.5 ${className ?? ""}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          filled={index < filledCount}
          className="h-4 w-4"
        />
      ))}
    </div>
  );
}

export function StarRatingInput({
  onRate,
  disabled,
  className,
}: {
  onRate: (stars: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`star-rating flex gap-1 ${className ?? ""}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const stars = index + 1;
        return (
          <button
            key={stars}
            type="button"
            className="star-button"
            onClick={() => onRate(stars)}
            disabled={disabled}
            aria-label={`Calificar con ${stars} estrellas`}
          >
            <Star filled={true} className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

