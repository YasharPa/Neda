// האם להתעלם מקיצור מקלדת גלובלי:
// בזמן הקלדה בשדה, עם Ctrl/Cmd/Alt (קיצורי דפדפן),
// או רווח/Enter על כפתור (הדפדפן כבר לוחץ עליו בעצמו)
export const shouldIgnoreShortcut = (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const tag = e.target.tagName;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return true;
  return tag === "BUTTON" && (e.key === " " || e.key === "Enter");
};
