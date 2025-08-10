import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "טוען...", size = "medium" }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <h2 className="loading-title">{message}</h2>
      <p className="loading-subtitle">
        {message.includes("Supabase") ? "מתחבר למסד הנתונים..." : "אנא המתן..."}
      </p>
    </div>
  );
};

export default LoadingSpinner;
