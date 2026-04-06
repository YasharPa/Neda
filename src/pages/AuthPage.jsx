import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ translate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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
          navigate("/");
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
          setTimeout(() => {
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
    setIsLogin(!isLogin);
    setError(null);
    setMessage(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
  };

  const messageBaseClass =
    "p-4 rounded-xl mb-6 flex items-center gap-3 text-[0.9rem] animate-slide-down border";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8fe] p-4 sm:p-8">
      <div className="bg-white rounded-[20px] p-8 sm:p-12 shadow-[0_20px_40px_rgba(42,122,228,0.08)] max-w-[450px] w-full animate-slide-up">
        {/* כותרת */}
        <div className="text-center mb-8">
          <h1 className="text-[2rem] text-slate-800 mb-2 font-bold leading-tight">
            {isLogin
              ? translate?.auth?.login || "התחברות"
              : translate?.auth?.signup || "הרשמה"}
          </h1>
          <p className="text-[0.95rem] text-slate-500 m-0">
            {isLogin
              ? translate?.auth?.welcomeBack || "ברוך שובך! התחבר כדי להמשיך"
              : translate?.auth?.createAccount || "צור חשבון חדש והתחל ללמוד"}
          </p>
        </div>

        {/* הודעות שגיאה / הצלחה */}
        {error && (
          <div
            className={`${messageBaseClass} bg-red-50 text-red-500 border-red-200`}
          >
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className={`${messageBaseClass} bg-green-50 text-green-500 border-green-200`}
          >
            <span className="text-lg">✅</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label
                className="font-semibold text-slate-700 text-[0.9rem]"
                htmlFor="fullName"
              >
                {translate?.auth?.fields?.fullName || "שם מלא"}
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="p-[0.85rem] border-2 border-slate-200 rounded-[10px] text-base transition-all duration-200 focus:outline-none focus:border-[#2a7ae4] focus:ring-4 focus:ring-[#2a7ae4]/15 disabled:bg-slate-50 disabled:cursor-not-allowed"
                placeholder={
                  translate?.auth?.placeholders?.fullName || "הזן את שמך המלא"
                }
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              className="font-semibold text-slate-700 text-[0.9rem]"
              htmlFor="email"
            >
              {translate?.auth?.fields?.email || "אימייל"}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-[0.85rem] border-2 border-slate-200 rounded-[10px] text-base transition-all duration-200 focus:outline-none focus:border-[#2a7ae4] focus:ring-4 focus:ring-[#2a7ae4]/15 disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder={
                translate?.auth?.placeholders?.email || "example@email.com"
              }
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-semibold text-slate-700 text-[0.9rem]"
              htmlFor="password"
            >
              {translate?.auth?.fields?.password || "סיסמה"}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-[0.85rem] border-2 border-slate-200 rounded-[10px] text-base transition-all duration-200 focus:outline-none focus:border-[#2a7ae4] focus:ring-4 focus:ring-[#2a7ae4]/15 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
              <label
                className="font-semibold text-slate-700 text-[0.9rem]"
                htmlFor="confirmPassword"
              >
                {translate?.auth?.fields?.confirmPassword || "אימות סיסמה"}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-[0.85rem] border-2 border-slate-200 rounded-[10px] text-base transition-all duration-200 focus:outline-none focus:border-[#2a7ae4] focus:ring-4 focus:ring-[#2a7ae4]/15 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
            className="w-full p-4 mt-2 bg-[#2a7ae4] text-white rounded-[10px] text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:bg-[#1c65c9] enabled:hover:shadow-[0_8px_20px_rgba(42,122,228,0.35)] enabled:active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
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
        <div className="text-center mt-6 pt-6 border-t border-slate-200">
          <p className="text-slate-500 text-[0.9rem] m-0">
            {isLogin
              ? translate?.auth?.noAccount || "אין לך חשבון?"
              : translate?.auth?.hasAccount || "כבר יש לך חשבון?"}
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-[#2a7ae4] font-semibold text-[0.9rem] mr-2 transition-colors duration-200 hover:enabled:text-[#1c65c9] hover:enabled:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => alert("פיצ'ר איפוס סיסמה יתווסף בקרוב")}
              className="text-slate-500 text-[0.85rem] hover:enabled:text-[#2a7ae4] hover:enabled:underline transition-colors duration-200 disabled:opacity-50"
            >
              {translate?.auth?.forgotPassword || "שכחת סיסמה?"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
