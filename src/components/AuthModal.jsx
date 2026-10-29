import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { primaryBtnClasses } from "../lib/buttonClasses";

const inputClasses =
  "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 outline-none transition-all text-slate-800 dark:text-dark-text placeholder:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed";

const labelClasses = "font-semibold text-slate-700 dark:text-slate-300 text-sm";

const messageBaseClass =
  "p-4 rounded-xl mb-6 flex items-center gap-3 text-sm animate-slide-down border";

const AuthModal = ({ translate, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { signIn, signUp } = useAuth();
  const switchTimerRef = useRef(null);
  const mouseDownOnBackdropRef = useRef(false);

  // נעילת גלילה וסגירה עם Escape
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // ביטול הטיימר של המעבר להתחברות בסגירת החלון
  useEffect(() => () => clearTimeout(switchTimerRef.current), []);

  // סגירה רק אם הלחיצה התחילה והסתיימה על הרקע (לא בגרירת סימון טקסט)
  const handleBackdropMouseDown = (e) => {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  };

  const handleBackdropClick = (e) => {
    if (mouseDownOnBackdropRef.current && e.target === e.currentTarget) {
      onClose();
    }
    mouseDownOnBackdropRef.current = false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(email, password);
        if (error) {
          setError(
            error.message.includes("Invalid login credentials")
              ? translate?.auth?.errors?.invalidCredentials ||
                  "אימייל או סיסמה שגויים"
              : error.message,
          );
        } else if (data.user) {
          onClose();
        }
      } else {
        if (password !== confirmPassword) {
          setError(
            translate?.auth?.errors?.passwordMismatch || "הסיסמאות לא תואמות",
          );
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError(
            translate?.auth?.errors?.passwordTooShort ||
              "הסיסמה חייבת להכיל לפחות 6 תווים",
          );
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, {
          full_name: fullName,
        });
        if (error) {
          setError(
            error.message.includes("already registered")
              ? translate?.auth?.errors?.emailExists ||
                  "האימייל כבר רשום במערכת"
              : error.message,
          );
        } else {
          setMessage(
            translate?.auth?.success?.checkEmail ||
              "נרשמת בהצלחה! אנא בדוק את האימייל שלך.",
          );
          clearTimeout(switchTimerRef.current);
          switchTimerRef.current = setTimeout(() => {
            setIsLogin(true);
            setMessage(translate?.auth?.success?.canLogin || "כעת תוכל להתחבר");
          }, 3000);
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("DEBUG INFO:", err);
      }
      setError(translate?.auth?.errors?.general || "אירעה שגיאה, נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    clearTimeout(switchTimerRef.current);
    setIsLogin(!isLogin);
    setError(null);
    setMessage(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-overlayFadeIn"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        dir="rtl"
        className="relative glass-card !rounded-3xl !bg-white dark:!bg-dark-bg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl animate-formSlideIn"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>

        <button
          type="button"
          onClick={onClose}
          aria-label={translate?.auth?.close || "סגור"}
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* כותרת */}
        <div className="text-center mb-8">
          <h2 className="text-3xl text-slate-800 dark:text-slate-100 mb-2 font-bold leading-tight">
            {isLogin
              ? translate?.auth?.login || "התחברות"
              : translate?.auth?.signup || "הרשמה"}
          </h2>
          <p className="text-slate-500 dark:text-dark-muted m-0">
            {isLogin
              ? translate?.auth?.welcomeBack || "ברוך שובך! התחבר כדי להמשיך"
              : translate?.auth?.createAccount || "צור חשבון חדש והתחל ללמוד"}
          </p>
        </div>

        {/* הודעות שגיאה / הצלחה */}
        {error && (
          <div
            className={`${messageBaseClass} bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50`}
          >
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className={`${messageBaseClass} bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50`}
          >
            <span className="text-lg">✅</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses} htmlFor="fullName">
                {translate?.auth?.fields?.fullName || "שם מלא"}
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
                placeholder={
                  translate?.auth?.placeholders?.fullName || "הזן את שמך המלא"
                }
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className={labelClasses} htmlFor="email">
              {translate?.auth?.fields?.email || "אימייל"}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder={
                translate?.auth?.placeholders?.email || "example@email.com"
              }
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClasses} htmlFor="password">
              {translate?.auth?.fields?.password || "סיסמה"}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder={
                translate?.auth?.placeholders?.password || "הזן סיסמה"
              }
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses} htmlFor="confirmPassword">
                {translate?.auth?.fields?.confirmPassword || "אימות סיסמה"}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                placeholder={
                  translate?.auth?.placeholders?.confirmPassword ||
                  "הזן את הסיסמה שוב"
                }
                required={!isLogin}
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 mt-2 flex items-center justify-center gap-2 ${primaryBtnClasses}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{translate?.auth?.loading || "מעבד..."}</span>
              </>
            ) : isLogin ? (
              translate?.auth?.loginButton || "התחבר"
            ) : (
              translate?.auth?.signupButton || "הירשם"
            )}
          </button>
        </form>

        {/* החלפה בין מצבים */}
        <div className="text-center mt-6 pt-6 border-t border-slate-200 dark:border-dark-border">
          <p className="text-slate-500 dark:text-dark-muted text-sm m-0">
            {isLogin
              ? translate?.auth?.noAccount || "אין לך חשבון?"
              : translate?.auth?.hasAccount || "כבר יש לך חשבון?"}
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-brand-600 dark:text-brand-400 font-semibold text-sm mr-2 transition-colors hover:enabled:text-brand-500 hover:enabled:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin
                ? translate?.auth?.signupLink || "הירשם כאן"
                : translate?.auth?.loginLink || "התחבר כאן"}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="text-center mt-4">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                alert(
                  translate?.auth?.forgotPasswordSoon ||
                    "פיצ'ר איפוס סיסמה יתווסף בקרוב",
                )
              }
              className="text-slate-500 dark:text-dark-muted text-sm hover:enabled:text-brand-600 dark:hover:enabled:text-brand-400 hover:enabled:underline transition-colors disabled:opacity-50"
            >
              {translate?.auth?.forgotPassword || "שכחת סיסמה?"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
