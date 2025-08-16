import { useState } from "react";
import DrivingQuiz from "../components/DrivingQuiz";
import "../styles/DrivingPage.css";

const DrivingPage = ({ translate, language = "he" }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [questionCount, setQuestionCount] = useState(30); // Default to 30 questions

  if (showQuiz) {
    return (
      <div className="driving-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => setShowQuiz(false)}>
            ← {translate.driving.backToMenu}
          </button>
          <h1>🚗 {translate.driving.title}</h1>
        </div>
        <DrivingQuiz
          translate={translate}
          language={language}
          maxQuestions={questionCount}
        />
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
          {/* בחירת כמות שאלות */}
          <div className="quiz-settings">
            <h3>⚙️ הגדרות בחינה</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label htmlFor="questionCount">כמות שאלות:</label>
                <select
                  id="questionCount"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="question-count-select"
                >
                  <option value={10}>10 שאלות</option>
                  <option value={20}>20 שאלות</option>
                  <option value={30}>30 שאלות (מומלץ)</option>
                  <option value={50}>50 שאלות</option>
                  <option value={0}>כל השאלות</option>
                </select>
              </div>
            </div>
          </div>

          <div className="quiz-options">
            <div
              className="quiz-option main-quiz"
              onClick={() => setShowQuiz(true)}
            >
              <div className="quiz-icon">🏆</div>
              <div className="quiz-content">
                <h3>{translate.driving.quizTypes.adaptive}</h3>
                <p>{translate.driving.quizTypes.adaptiveDesc}</p>
                <div className="quiz-info">
                  <span className="quiz-count">
                    📊{" "}
                    {questionCount === 0
                      ? "כל השאלות"
                      : `${questionCount} שאלות`}
                  </span>
                </div>
                <button className="start-quiz-btn">
                  {translate.driving.startQuiz}
                </button>
              </div>
            </div>

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
                    {translate.driving.startQuiz}
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
              <h3>ℹ️ {translate.infoSection.title}</h3>
              <ul>
                <li>{translate.infoSection.description}</li>
                <li>{translate.infoSection.adaptiveLearning}</li>
                <li>{translate.infoSection.features}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivingPage;
