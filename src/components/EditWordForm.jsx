import { useState } from "react";

const EditWordForm = ({ word, onUpdateWord, onClose, translate }) => {
  const [formData, setFormData] = useState({
    hebrew: word.hebrew || "",
    persian: word.persian || "",
    example_sentence: word.example_sentence || "",
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
      const success = await onUpdateWord(word.id, formData);

      if (success) {
        if (onClose) onClose();
      } else {
        alert("שגיאה בעדכון המילה. נסה שוב.");
      }
    } catch (error) {
      console.error("Error updating word:", error);
      alert("שגיאה בעדכון המילה. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      hebrew: word.hebrew || "",
      persian: word.persian || "",
      example_sentence: word.example_sentence || "",
    });
  };

  return (
    <div className="glass-card relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-brand-500 to-blue-500"></div>
      
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 dark:border-slate-800 pb-4">
          <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 m-0 flex items-center gap-2">
            <span className="text-brand-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </span> 
            {translate?.editWordForm.title}
          </h4>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            onClick={onClose}
            title="סגור"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-hebrew" className="font-semibold text-slate-700 dark:text-slate-300">
                מילה בעברית <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-hebrew"
                name="hebrew"
                placeholder="למשל: שלום"
                value={formData.hebrew}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 dark:hover:border-brand-500 dark:focus:border-brand-500 outline-none transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-persian" className="font-semibold text-slate-700 dark:text-slate-300">
                מילה בפרסית <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-persian"
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
            <label htmlFor="edit-example" className="font-semibold text-slate-700 dark:text-slate-300">
              דוגמה במשפט (אופציונלי)
            </label>
            <input
              type="text"
              id="edit-example"
              name="example_sentence"
              placeholder="למשל: שלום, מה שלומך?"
              value={formData.example_sentence}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 dark:hover:border-brand-500 dark:focus:border-brand-500 outline-none transition-all text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t-2 border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex-1 min-w-[150px] flex justify-center items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={
                isSubmitting ||
                !formData.hebrew.trim() ||
                !formData.persian.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  מעדכן...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  {translate.editWordForm.save}
                </>
              )}
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              {translate.editWordForm.reset}
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              {translate.editWordForm.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWordForm;
