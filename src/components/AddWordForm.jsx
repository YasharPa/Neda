import { useState } from "react";

const AddWordForm = ({ onAddWord, onClose }) => {
  const [formData, setFormData] = useState({
    hebrew: "",
    persian: "",
    example_sentence: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hebrew.trim() || !formData.persian.trim()) {
      alert("נא למלא את המילה בעברית ובפרסית");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onAddWord(formData);

      if (success) {
        setFormData({ hebrew: "", persian: "", example_sentence: "" });
        if (onClose) onClose();
      } else {
        alert("שגיאה בהוספת המילה. נסה שוב.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("שגיאה בהוספת המילה. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ hebrew: "", persian: "", example_sentence: "" });
  };

  return (
    <div className="glass-card p-6 md:p-8 mb-8 border-brand-200 dark:border-brand-900/50 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-brand-500 to-blue-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 m-0 flex items-center gap-2">
          <span className="text-brand-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </span> 
          הוספת מילה חדשה
        </h4>
        {onClose && (
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            onClick={onClose}
            title="סגור"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="hebrew" className="font-semibold text-slate-700 dark:text-slate-300">
              מילה בעברית <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="hebrew"
              name="hebrew"
              placeholder="למשל: שלום"
              value={formData.hebrew}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 dark:hover:border-brand-500 dark:focus:border-brand-500 outline-none transition-all text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="persian" className="font-semibold text-slate-700 dark:text-slate-300">
              מילה בפרסית <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="persian"
              name="persian"
              placeholder="למשל: سلام"
              value={formData.persian}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 dark:hover:border-brand-500 dark:focus:border-brand-500 outline-none transition-all text-slate-800 dark:text-slate-100"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="example" className="font-semibold text-slate-700 dark:text-slate-300">
            דוגמה במשפט (אופציונלי)
          </label>
          <input
            type="text"
            id="example"
            name="example_sentence"
            placeholder="למשל: שלום, מה שלומך?"
            value={formData.example_sentence}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 dark:hover:border-brand-500 dark:focus:border-brand-500 outline-none transition-all text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          <button
            type="submit"
            className="flex-1 md:flex-none min-w-[150px] flex justify-center items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={
              isSubmitting ||
              !formData.hebrew.trim() ||
              !formData.persian.trim()
            }
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                מוסיף...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                הוסף מילה
              </>
            )}
          </button>

          <button
            type="button"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            נקה
          </button>

          {onClose && (
            <button
              type="button"
              className="px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ביטול
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddWordForm;
