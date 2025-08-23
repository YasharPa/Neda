import { useState } from "react";
import "../styles/EditWordForm.css";

const EditWordForm = ({ word, onUpdateWord, onClose, translate }) => {
  const [formData, setFormData] = useState({
    hebrew: word.hebrew || "",
    persian: word.persian || "",
    example: word.example || "",
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
      example: word.example || "",
    });
  };

  return (
    <div className="edit-word-overlay">
      <div className="edit-word-form">
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
              name="example"
              placeholder="למשל: שלום, מה שלומך?"
              value={formData.example}
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
