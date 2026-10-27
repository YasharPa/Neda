import { useRef, useState } from "react";

// מרחק גרירה (בפיקסלים) שנחשב להחלקה
const SWIPE_THRESHOLD = 100;
// מרחק מינימלי שמבדיל בין הקשה לגרירה
const DRAG_START = 8;

const faceStyle = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

const Flashcard = ({ front, back, isFlipped, onFlip, onSwipe, tapHint }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(null);
  const draggedRef = useRef(false);

  const handlePointerDown = (e) => {
    startXRef.current = e.clientX;
    draggedRef.current = false;
  };

  const handlePointerMove = (e) => {
    if (startXRef.current === null || !isFlipped) return;
    const dx = e.clientX - startXRef.current;

    if (!draggedRef.current && Math.abs(dx) > DRAG_START) {
      draggedRef.current = true;
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (draggedRef.current) setDragX(dx);
  };

  const handlePointerUp = () => {
    if (draggedRef.current && Math.abs(dragX) > SWIPE_THRESHOLD) {
      onSwipe?.(dragX > 0 ? "right" : "left");
    }
    startXRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const handleClick = () => {
    // לחיצה שהגיעה בסוף גרירה לא הופכת את הכרטיס
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onFlip();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      onFlip();
    }
  };

  const swipeProgress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
  const swipeTint =
    dragX > 0
      ? `rgba(16, 185, 129, ${swipeProgress * 0.25})`
      : `rgba(239, 68, 68, ${swipeProgress * 0.25})`;

  return (
    <div
      className="w-full max-w-md mx-auto select-none"
      style={{ perspective: "1200px", touchAction: "pan-y" }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        className="relative h-80 md:h-96 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-3xl"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX / 25}deg)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* צד קדמי */}
          <div
            className="absolute inset-0 glass-card !rounded-3xl border-2 border-brand-200 dark:border-brand-900/50 flex flex-col items-center justify-center p-6 text-center"
            style={faceStyle}
          >
            {front}
            {tapHint && (
              <span className="absolute bottom-4 text-xs text-slate-400 dark:text-slate-500">
                {tapHint}
              </span>
            )}
          </div>

          {/* צד אחורי */}
          <div
            className="absolute inset-0 glass-card !rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
            style={{ ...faceStyle, transform: "rotateY(180deg)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ backgroundColor: isDragging ? swipeTint : "transparent" }}
            />
            {back}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
