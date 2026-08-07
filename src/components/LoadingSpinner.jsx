const LoadingSpinner = ({ translate, size = "medium" }) => {
  const sizeClasses = {
    small: "scale-75",
    medium: "scale-100",
    large: "scale-125"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-4 ${sizeClasses[size] || sizeClasses.medium}`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="m-0 text-xl font-bold text-slate-800 dark:text-slate-100">
          {translate.spinner.loading}
        </h2>
        <p className="m-0 text-slate-500 dark:text-slate-400 font-medium">
          {translate.spinner.loadingsubtitle}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
