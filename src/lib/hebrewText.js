// ניקוד וטעמים
const NIKUD_REGEX = /[֑-ׇ]/g;
// סימני פיסוק שלא נחשבים טעות בהקלדה
const PUNCTUATION_REGEX = /[?!.,:;"'״׳־\-–—()…]/g;

// מנרמל טקסט עברי להשוואה סלחנית: בלי ניקוד, בלי פיסוק, רווחים אחידים
export function normalizeHebrew(str = "") {
  return str
    .replace(NIKUD_REGEX, "")
    .replace(PUNCTUATION_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// משווה מילה מול מילה לפי המיקום. אותיות סופיות כן נחשבות (חלק מכתיבה נכונה)
export function compareWords(expected, typed) {
  const expectedWords = normalizeHebrew(expected).split(" ").filter(Boolean);
  const typedWords = normalizeHebrew(typed).split(" ").filter(Boolean);

  const words = expectedWords.map((word, i) => ({
    word,
    ok: typedWords[i] === word,
  }));

  const isCorrect =
    typedWords.length === expectedWords.length && words.every((w) => w.ok);

  return { words, isCorrect };
}
