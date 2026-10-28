// האם להתעלם מקיצור מקלדת גלובלי:
// בזמן הקלדה בשדה, או רווח/Enter על כפתור (הדפדפן כבר לוחץ עליו בעצמו)
export const shouldIgnoreShortcut = (e) => {
  const tag = e.target.tagName;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return true;
  return tag === "BUTTON" && (e.key === " " || e.key === "Enter");
};
