import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/AuthPage.css";

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
        // התחברות
        const { data, error } = await signIn(email, password);

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError(
              translate?.auth?.errors?.invalidCredentials ||
                "אימייל או סיסמה שגויים"
            );
          } else {
            setError(error.message);
          }
        } else if (data.user) {
          navigate("/");
        }
      } else {
        // הרשמה
        if (password !== confirmPassword) {
          setError(
            translate?.auth?.errors?.passwordMismatch || "הסיסמאות לא תואמות"
          );
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError(
            translate?.auth?.errors?.passwordTooShort ||
              "הסיסמה חייבת להכיל לפחות 6 תווים"
          );
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(email, password, {
          full_name: fullName,
        });

        if (error) {
          if (error.message.includes("already registered")) {
            setError(
              translate?.auth?.errors?.emailExists || "האימייל כבר רשום במערכת"
            );
          } else {
            setError(error.message);
          }
        } else {
          setMessage(
            translate?.auth?.success?.checkEmail ||
              "נרשמת בהצלחה! אנא בדוק את האימייל שלך לאימות החשבון."
          );
          // ניתן להתחבר אוטומטית או להמתין לאימות
          setTimeout(() => {
            setIsLogin(true);
            setMessage(translate?.auth?.success?.canLogin || "כעת תוכל להתחבר");
          }, 3000);
        }
      }
    } catch (err) {
      setError(translate?.auth?.errors?.general || "אירעה שגיאה, נסה שוב");
      console.error("Auth error:", err);
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>
            {isLogin
              ? translate?.auth?.login || "התחברות"
              : translate?.auth?.signup || "הרשמה"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? translate?.auth?.welcomeBack || "ברוך שובך! התחבר כדי להמשיך"
              : translate?.auth?.createAccount || "צור חשבון חדש והתחל ללמוד"}
          </p>
        </div>

        {error && (
          <div className="auth-message error">
            <span className="message-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="auth-message success">
            <span className="message-icon">✅</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">
                {translate?.auth?.fields?.fullName || "שם מלא"}
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  translate?.auth?.placeholders?.fullName || "הזן את שמך המלא"
                }
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              {translate?.auth?.fields?.email || "אימייל"}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                translate?.auth?.placeholders?.email || "example@email.com"
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {translate?.auth?.fields?.password || "סיסמה"}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                translate?.auth?.placeholders?.password || "הזן סיסמה"
              }
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                {translate?.auth?.fields?.confirmPassword || "אימות סיסמה"}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                {translate?.auth?.loading || "מעבד..."}
              </>
            ) : isLogin ? (
              translate?.auth?.loginButton || "התחבר"
            ) : (
              translate?.auth?.signupButton || "הירשם"
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin
              ? translate?.auth?.noAccount || "אין לך חשבון?"
              : translate?.auth?.hasAccount || "כבר יש לך חשבון?"}
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-btn"
              disabled={loading}
            >
              {isLogin
                ? translate?.auth?.signupLink || "הירשם כאן"
                : translate?.auth?.loginLink || "התחבר כאן"}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="auth-footer">
            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => alert("פיצ'ר איפוס סיסמה יתווסף בקרוב")}
              disabled={loading}
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
