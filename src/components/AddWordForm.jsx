import { useState } from "react";
import "../styles/AddWordForm.css";

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
        // איפוס הטופס
        setFormData({ hebrew: "", persian: "", example_sentence: "" });
        // סגירת הטופס אוטומטית אחרי הוספה מוצלחת
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
    <div className="add-word-form">
      <div className="form-header">
        <h4>➕ הוספת מילה חדשה</h4>
        {onClose && (
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            title="סגור"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="hebrew">מילה בעברית *</label>
            <input
              type="text"
              id="hebrew"
              name="hebrew"
              placeholder="למשל: שלום"
              value={formData.hebrew}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="persian">מילה בפרסית *</label>
            <input
              type="text"
              id="persian"
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
          <label htmlFor="example">דוגמה במשפט (אופציונלי)</label>
          <input
            type="text"
            id="example"
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
                מוסיף...
              </>
            ) : (
              "➕ הוסף מילה"
            )}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            🔄 נקה
          </button>

          {onClose && (
            <button
              type="button"
              className="btn-tertiary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ❌ ביטול
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddWordForm;
