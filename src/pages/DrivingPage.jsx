import { useState } from "react";
import DrivingQuiz from "../components/DrivingQuiz";
import "../styles/DrivingPage.css";

const DrivingPage = ({ translate, language = "he" }) => {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return (
      <div className="driving-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => setShowQuiz(false)}>
            ← {translate.driving.backToMenu}
          </button>
          <h1>🚗 {translate.driving.title}</h1>
        </div>
        <DrivingQuiz translate={translate} language={language} />
      </div>
    );
  }

  return (
    <div className="driving-page">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>🚗 {translate.driving.welcomeTitle}</h1>
          <p>{translate.driving.welcomeSubtitle}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>{translate.driving.features.targeted}</h3>
            <p>{translate.driving.features.targetedDesc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{translate.driving.features.progress}</h3>
            <p>{translate.driving.features.progressDesc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>{translate.driving.features.explanations}</h3>
            <p>{translate.driving.features.explanationsDesc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>{translate.driving.features.adaptive}</h3>
            <p>{translate.driving.features.adaptiveDesc}</p>
          </div>
        </div>

        <div className="quiz-types">
          <h2>🎮 {translate.driving.quizTypes.title}</h2>

          <div className="quiz-options">
            <div
              className="quiz-option main-quiz"
              onClick={() => setShowQuiz(true)}
            >
              <div className="quiz-icon">🏆</div>
              <div className="quiz-content">
                <h3>{translate.driving.quizTypes.adaptive}</h3>
                <p>{translate.driving.quizTypes.adaptiveDesc}</p>
                <button className="start-quiz-btn">
                  {translate.driving.tartQuiz}
                </button>
              </div>
            </div>

            <div className="quiz-option practice-quiz coming-soon">
              <div className="quiz-icon">📚</div>
              <div className="quiz-content">
                <h3>{translate.driving.quizTypes.practice}</h3>
                <p>{translate.driving.quizTypes.practiceDesc}</p>
                <span className="coming-soon-badge">
                  {language === "he" ? "בקרוב" : "به زودی"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>ℹ️ {language === "he" ? "מידע חשוב" : "اطلاعات مهم"}</h3>
            <ul>
              <li>
                {language === "he"
                  ? "הבחינה מתבססת על חוקי התעבורה הישראליים העדכניים"
                  : "آزمون بر اساس قوانین ترافیک به‌روز اسرائیل است"}
              </li>
              <li>
                {language === "he"
                  ? "האלגוריתם לומד מהתשובות שלך ומתמקד בנושאים הקשים"
                  : "الگوریتم از پاسخ‌های شما یاد می‌گیرد و روی موضوعات سخت متمرکز می‌شود"}
              </li>
              <li>
                {language === "he"
                  ? "כל התוצאות נשמרות למעקב התקדמות"
                  : "تمام نتایج برای پیگیری پیشرفت ذخیره می‌شود"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivingPage;
