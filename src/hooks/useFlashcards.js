import { useState, useMemo } from "react";

// כמה כרטיסים יופיעו לפני שכרטיס שלא ידענו יחזור
const REQUEUE_GAP = 3;

export function useFlashcards() {
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState({});
  const [totalCards, setTotalCards] = useState(0);

  // התחלת סבב חדש עם רשימת כרטיסים
  const start = (cards) => {
    setQueue(cards);
    setResults({});
    setTotalCards(cards.length);
  };

  // דירוג הכרטיס הנוכחי. רק הדירוג הראשון של כל כרטיס נספר
  const rate = (rating) => {
    const card = queue[0];
    if (!card) return { card: null, isFirst: false };

    const isFirst = !(card.id in results);
    if (isFirst) {
      setResults((prev) => ({ ...prev, [card.id]: { card, rating } }));
    }

    setQueue((prev) => {
      const [current, ...rest] = prev;
      if (rating === "unknown") {
        rest.splice(Math.min(REQUEUE_GAP, rest.length), 0, current);
      }
      return rest;
    });

    return { card, isFirst };
  };

  // סיום מוקדם של הסבב
  const finish = () => setQueue([]);

  const reset = () => {
    setQueue([]);
    setResults({});
    setTotalCards(0);
  };

  const summary = useMemo(() => {
    const counts = { known: 0, partial: 0, unknown: 0 };
    Object.values(results).forEach(({ rating }) => {
      counts[rating] += 1;
    });
    return counts;
  }, [results]);

  const missedCards = useMemo(
    () =>
      Object.values(results)
        .filter(({ rating }) => rating !== "known")
        .map(({ card }) => card),
    [results],
  );

  return {
    current: queue[0] ?? null,
    remaining: queue.length,
    totalCards,
    reviewed: Object.keys(results).length,
    isFinished: totalCards > 0 && queue.length === 0,
    summary,
    missedCards,
    start,
    rate,
    finish,
    reset,
  };
}
