import { useEffect } from "react";

const SignModal = ({ sign, onClose, language = "he" }) => {
  const name = language === "he" ? sign.hebrew_name : sign.persian_name;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 transition-colors text-sm"
          aria-label="סגור"
        >
          ✕
        </button>

        <div className="bg-blue-50 flex items-center justify-center p-10 min-h-[200px]">
          <img
            src={sign.image_url}
            alt={name}
            className="max-h-[160px] object-contain drop-shadow-sm"
          />
        </div>

        <div className="px-6 py-5">
          {sign.category && (
            <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full mb-3">
              {sign.category}
            </span>
          )}
          <div className="mb-3">
            <p className="text-base font-bold text-gray-900 mb-1">
              {sign.sign_code}
            </p>
            <h2 className="text-xl text-gray-900 leading-tight">{name}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignModal;
