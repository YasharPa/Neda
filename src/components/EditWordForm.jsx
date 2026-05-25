import { useState } from "react";
import "../styles/EditWordForm.css";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-5 z-[1000] animate-overlayFadeIn cursor-pointer">
      <div className="bg-white border-2 border-[#e9ecef] rounded-[15px] p-[30px] max-[480px]:px-5 max-[480px]:py-[25px] max-w-[500px] w-full max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:border-[#2a7ae4] hover:shadow-[0_12px_50px_rgba(42,122,228,0.15)] transition-all duration-300 cursor-default animate-formSlideIn">
        <div className="form-header">
          <h4>✏️{translate?.editWordForm.title}</h4>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            title="סגור"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="edit-hebrew">מילה בעברית *</label>
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
              />
            </div>

            <div className="input-group">
              <label htmlFor="edit-persian">מילה בפרסית *</label>
              <input
                type="text"
                id="edit-persian"
                name="persian"
                placeholder="למשל: سلام"
                value={formData.persian}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="edit-example">דוגמה במשפט (אופציונלי)</label>
            <input
              type="text"
              id="edit-example"
              name="example_sentence"
              placeholder="למשל: שלום, מה שלומך?"
              value={formData.example_sentence}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="btn-primary"
              disabled={
                isSubmitting ||
                !formData.hebrew.trim() ||
                !formData.persian.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  מעדכן...
                </>
              ) : (
                `💾 ${translate.editWordForm.save}`
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              🔄 {translate.editWordForm.reset}
            </button>

            <button
              type="button"
              className="btn-tertiary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ❌ {translate.editWordForm.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWordForm;
