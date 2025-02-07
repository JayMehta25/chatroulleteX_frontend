import React from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          /* Global Styles */
          body {
            margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }

          /* Navigation Bar */
          .navbar {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 10px 20px;
            justify-content: center; /* Center nav content on desktop */
          }
          .navbar-title {
            font-size: 2rem;
            font-weight: bold;
            background: linear-gradient(45deg, rgb(255, 255, 255), rgb(162, 21, 194));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-right: 40px;
          }
          .navbar-links {
            display: flex;
            gap: 20px;
          }
          /* Nav buttons with infinite black-white gradient animation */
          .nav-button {
            padding: 6px 12px; /* Adjusted padding for smaller button size */
            font-size: 0.9rem; /* Adjusted font size */
            border: none;
            border-radius: 5px;
            background: linear-gradient(90deg, #fff, #000, #fff);
            background-size: 200% auto;
            color: #fff;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            outline: none;
            animation: gradientShift 3s linear infinite;
          }
          .nav-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          @keyframes gradientShift {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }

          /* Responsive Navigation for Mobile:
             On mobile, stack the title above and place links in a centered horizontal row */
          @media (max-width: 600px) {
            .navbar {
              flex-direction: column;
              align-items: center;
            }
            .navbar-links {
              margin-top: 20px;
              flex-direction: row;
              gap: 15px;
              margin-right:40px;
            }
          }

          /* Homepage Container with animated white–black gradient background */
          .homepage-container {
            position: relative;
            min-height: 100vh;
            padding-top: 120px; /* Allow space for navbar */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #fff;
            overflow: hidden;
            z-index: 1;
            background: linear-gradient(270deg, #000, #fff, #000);
            background-size: 400% 400%;
            animation: bgGradient 10s ease infinite;
          }
          .homepage-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 0;
          }
          @keyframes bgGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Animated Chat Bubble */
          .chat-bubble {
            background: rgba(255, 255, 255, 0.15);
            padding: 15px 25px;
            border-radius: 15px;
            font-size: 1.2rem;
            display: inline-block;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: float 2s infinite alternate ease-in-out;
            margin-bottom: 20px;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            100% { transform: translateY(10px); }
          }

          /* Hero Content Box */
          .homepage-box {
            background: rgba(0, 0, 0, 0.6);
            padding: 30px 40px;
            border-radius: 15px;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            text-align: center;
            animation: fadeIn 1.5s ease-in-out;
            z-index: 2;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0px); }
          }

          .homepage-title {
            font-size: 2.8rem;
            font-weight: 700;
            margin-bottom: 15px;
            /* Animated wave gradient behind the text */
            background: linear-gradient(45deg, rgb(245, 245, 245), rgb(164, 0, 205));
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 4px 20px rgba(0,0,0,0.5);
            animation: wave 3s ease infinite;
          }
          @keyframes wave {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .homepage-subtitle {
            font-size: 1.2rem;
            margin-bottom: 25px;
            color: #ddd;
          }

          .homepage-button {
            padding: 12px 25px;
            font-size: 1rem;
            border: none;
            border-radius: 30px;
            background: linear-gradient(45deg, #3a3a3a, #2c3e50);
            color: #fff;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            margin: 5px;
          }
          .homepage-button:hover {
            transform: scale(1.08);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          /* On mobile, stack the hero buttons vertically */
          @media (max-width: 600px) {
            .homepage-button {
              display: block;
              width: 100%;
              margin: 10px 0;
            }
          }

          /* Features Section */
          .features-section {
            background: rgba(0, 0, 0, 0.8);
            padding: 40px 20px;
            margin-top: 40px;
            width: 100%;
          }
          .features-title {
            font-size: 2rem;
            margin-bottom: 20px;
            color: #c0c0c0;
          }
          .features-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }
          .feature-card {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            width: 260px;
            text-align: center;
            transition: transform 0.3s ease, filter 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-10px) scale(1.05);
            filter: brightness(1.3);
          }
          .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
          }
          .feature-description {
            font-size: 1rem;
          }

          /* Footer */
          .footer {
            margin-top: 50px;
            padding: 20px;
            color: #ccc;
            font-size: 0.9rem;
            text-align: center;
          }
        `}
      </style>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-title">ChatRouletteX</div>
        <div className="navbar-links">
          <button className="nav-button" onClick={() => navigate("/")}>Home</button>
          <button className="nav-button" onClick={() => navigate("/features")}>Features</button>
          <button className="nav-button" onClick={() => navigate("/about")}>About</button>
          <button className="nav-button" onClick={() => navigate("/chat")}>Chat Now</button>
        </div>
      </nav>

      {/* Main Homepage Container */}
      <div className="homepage-container">
        {/* Animated Chat Bubble */}
        <div className="chat-bubble">
          💬 Meet new people, chat privately, and build real connections!
        </div>

        {/* Hero Content Box */}
        <div className="homepage-box">
          <h1 className="homepage-title">Chat with Team Privately</h1>
          <p className="homepage-subtitle">
            Create or join private chat rooms and connect instantly. No sign-up required!
          </p>
          <button className="homepage-button" onClick={() => navigate("/chat")}>
            Start Chatting 🚀
          </button>
          <button className="homepage-button" onClick={() => navigate("/chat")}>
            Create Room 🔑
          </button>
          <button className="homepage-button" onClick={() => navigate("/chat")}>
            Join Room 👥
          </button>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="features-title">Amazing Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <div className="feature-description">
                Real-time private messaging with seamless room creation.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎙️</div>
              <div className="feature-description">
                Voice messaging and audio recording support for a richer chat experience.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">😊</div>
              <div className="feature-description">
                Fun animated reactions and emojis to express yourself.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <div className="feature-description">
                Private chat rooms ensuring your conversations remain secure.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <div className="feature-description">
                Customizable themes to match your style and mood.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <div className="feature-description">
                Fast, lightweight, and optimized for mobile and desktop.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          &copy; {new Date().getFullYear()} ChatRouletteX. All rights reserved.
        </div>
      </div>
    </>
  );
}

export default Homepage;
