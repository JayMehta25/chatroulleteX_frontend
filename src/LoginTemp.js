// LoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LetterGlitch from "./glitch"; // Ensure this file exports default

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);

  // State for the fade-out of the login card
  const [fadeOutLogin, setFadeOutLogin] = useState(false);

  // State for showing the typewriter overlay
  const [showOverlay, setShowOverlay] = useState(false);

  // Typewriter states
  const [typedText, setTypedText] = useState("");
  const [typedIndex, setTypedIndex] = useState(0);

  // State for fade-out of the overlay
  const [fadeOutOverlay, setFadeOutOverlay] = useState(false);

  const navigate = useNavigate();

  const closeToast = () => setToast(null);


  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // The final typed message
  const finalMessage = `Welcome, ${username}!`;

  // Typewriter effect for the overlay
  useEffect(() => {
    if (showOverlay) {
      // Start the typewriter effect
      const interval = setInterval(() => {
        setTypedIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= finalMessage.length) {
            clearInterval(interval);
          }
          return nextIndex;
        });
      }, 80); // Speed of typing (ms per character)

      return () => clearInterval(interval);
    }
  }, [showOverlay, finalMessage]);

  // Update typedText whenever typedIndex changes
  useEffect(() => {
    setTypedText(finalMessage.slice(0, typedIndex));
  }, [typedIndex, finalMessage]);

  // Once typing is complete, fade out overlay, then navigate
  useEffect(() => {
    if (typedIndex >= finalMessage.length && showOverlay) {
      // Wait 1s, then fade out
      setTimeout(() => {
        setFadeOutOverlay(true);

        // After another 1s, navigate to tutorial
        setTimeout(() => {
          navigate("/TutorialPage");
        }, 1000);
      }, 500); // Slight delay after typing completes
    }
  }, [typedIndex, finalMessage, showOverlay, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

        /* Global Styles */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: 'Poppins', sans-serif;
          background: #000;
          overflow: hidden;
        }

        .login-page {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        /* Glitch background covers full screen */
        .background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        /* Centered login container */
        .login-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 0 20px;
          transition: opacity 1s ease;
        }

        /* Fade out the login container */
        .fade-out-login {
          opacity: 0;
        }

        /* Glassmorphic login card */
        .login-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 40px 60px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* Animated conic gradient overlay for extra flair */
        .login-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 180deg, #ff0000, #00ff00, #ff0000);
          opacity: 0.2;
          animation: spin 6s linear infinite;
          z-index: -1;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-card h2 {
          margin-bottom: 20px;
          font-weight: 600;
          font-size: 2.5rem;
          letter-spacing: 2px;
        }

        .login-input {
          width: 100%;
          margin-bottom: 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 8px;
          color: #fff;
          font-size: 1.1rem;
          padding: 12px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .login-input:focus {
          border-color: #2575fc;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #ff0000, #00ff00);
          border: none;
          border-radius: 25px;
          color: #fff;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .login-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 0, 0, 0.5);
        }

        /* Toast Notification Style */
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 20px 30px;
          border-radius: 8px;
          font-size: 1.5rem;
          font-weight: 600;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 4;
          opacity: 0;
          animation: toastIn 0.5s forwards;
        }
        
        .toast.success {
          border-left: 5px solid #00ff00;
        }
        
        .toast.error {
          border-left: 5px solid #ff0000;
        }
        
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Typewriter Overlay (black background) */
        .typewriter-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          opacity: 1;
          transition: opacity 1s ease;
        }
        .fade-out-overlay {
          opacity: 0;
        }

        /* Typewriter text style */
        .typewriter-text {
          color: #fff;
          font-size: 3rem;
          font-weight: 700;
          text-shadow: 0 0 20px rgba(255,255,255,0.6);
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
          white-space: nowrap;
          border-right: 4px solid #fff;
          animation: blinkCursor 0.8s steps(1) infinite;
        }

        @keyframes blinkCursor {
          0% { border-color: transparent; }
          50% { border-color: #fff; }
          100% { border-color: transparent; }
        }
      `}</style>

      <div className="login-page">
        {/* LetterGlitch Background */}
        <div className="background">
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
            glitchColors={["#ffffff", "#ff5555", "#55ff55", "#0000ff", "#ffff00"]}
          />
        </div>

        {/* Login Form */}
        <div className={`login-container ${fadeOutLogin ? "fade-out-login" : ""}`}>
          <div className="login-card">
            <h2>Welcome Back</h2>
            <input
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="login-button" onClick={() => {
              if (username.trim() === "" || password.trim() === "") {
                setToast({ message: "⚠️ Please enter your username and password!", type: "error" });
                setTimeout(closeToast, 3000);
              } else {
                setToast({ message: `Welcome to ChatRouletteX, ${username}!`, type: "success" });
                setTimeout(() => {
                  closeToast();
                  setFadeOutLogin(true);
                  // Show overlay after 1s fade-out
                  setTimeout(() => {
                    setShowOverlay(true);
                  }, 1000);
                }, 3000);
              }
            }}>
              Login
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

        {/* Typewriter Overlay */}
        {showOverlay && (
          <div className={`typewriter-overlay ${fadeOutOverlay ? "fade-out-overlay" : ""}`}>
            <div className="typewriter-text">{typedText}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;
