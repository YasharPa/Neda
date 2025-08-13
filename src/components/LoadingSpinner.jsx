import "../styles/LoadingSpinner.css";

const LoadingSpinner = ({ translate, size = "medium" }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <h2 className="loading-title">{translate.spinner.loading}</h2>
      <p className="loading-subtitle">{translate.spinner.loadingsubtitle}</p>
    </div>
  );
};

export default LoadingSpinner;
