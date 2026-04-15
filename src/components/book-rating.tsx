"use client";

import { useState } from "react";
import { StarRatingDisplay, StarRatingInput } from "@/components/star-rating";

export function BookRating({
  fileName,
  initialAvg,
  initialCount,
}: {
  fileName: string;
  initialAvg: number;
  initialCount: number;
}) {
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function handleRate(stars: number) {
    setBusy(true);
    try {
      const response = await fetch(
        `/api/books/${encodeURIComponent(fileName)}/rating`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stars }),
        },
      );
      const result = (await response.json()) as {
        ok?: boolean;
        ratingAvg?: number;
        ratingCount?: number;
      };
      if (response.ok && result.ok) {
        setAvg(result.ratingAvg ?? avg);
        setCount(result.ratingCount ?? count);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <StarRatingDisplay rating={avg} />
        <span className="font-body text-sm font-medium" style={{ color: "#2C3539" }}>
          {count > 0 ? avg.toFixed(1) : "—"}
        </span>
        <span className="font-body text-xs" style={{ color: "#A09888" }}>
          · {count} votos
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body text-xs" style={{ color: "#8B7D6B" }}>
          Calificar:
        </span>
        <StarRatingInput onRate={handleRate} disabled={busy} />
      </div>
    </div>
  );
}

