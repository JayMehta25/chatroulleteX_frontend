import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Define all your CSS as a template literal
const styles = `
/* General Styles */
body {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
  cursor: none; /* Hide default cursor */
}

.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: #fff;
  overflow: hidden;
}

.login-container.light {
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  color: #000;
}

/* Animated Background */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.2), rgba(37, 117, 252, 0.2));
  z-index: 1;
  animation: moveBackground 5s infinite alternate;
}

@keyframes moveBackground {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-20%);
  }
}

/* Floating Shapes (Bubbles) */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Bubbles will be behind the login container */
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 5s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(20px);
  }
  50% {
    transform: translateY(-50px);
  }
}

/* Login Box */
.login-box {
  position: relative;
  z-index: 2; /* Login box appears above the bubbles */
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-container.light .login-box {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.login-container.light .login-title {
  color: #000;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* Input Fields */
.input-container {
  position: relative;
  margin: 20px 0;
}

.login-input {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 2px solid #fff;
  color: #fff;
  font-size: 1rem;
  outline: none;
}

.login-container.light .login-input {
  border-bottom: 2px solid #000;
  color: #000;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #fff;
  transition: width 0.3s ease;
}

.login-input:focus ~ .input-border {
  width: 100%;
}

/* Login Button */
.login-button {
  padding: 10px 20px;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
}

.login-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.5);
}

/* Theme Toggle */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-switch {
  width: 40px;
  height: 20px;
  background: #6a11cb;
  border-radius: 10px;
  margin-right: 10px;
  position: relative;
  transition: background 0.3s ease;
}

.toggle-switch.light {
  background: #ff9a9e;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-switch.light::before {
  transform: translateX(20px);
}

/* Welcome Message */
.welcome-message {
  font-size: 2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid #fff;
  animation: typing 3s steps(30, end), blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: #fff;
  }
}

/* Emoji Explosions */
.emoji-explosion {
  position: absolute;
  font-size: 2rem;
  animation: explode 1s ease-out forwards;
}

@keyframes explode {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

/* Custom Cursor */
.custom-cursor {
  position: fixed;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  mix-blend-mode: difference;
}

.cursor-trail {
  position: fixed;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9998;
  mix-blend-mode: difference;
}
`;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const navigate = useNavigate();

  // Toggle between dark and light themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Handle mouse movement for custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      setCursorTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY }];
        return newTrail.slice(-10); // Keep only the last 10 positions
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Emoji explosion on login
  const triggerEmojiExplosion = () => {
    const emojis = ["🎉", "✨", "🔥", "💥", "🚀"];
    const newEmojis = [];
    for (let i = 0; i < 20; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      newEmojis.push({ id: i, emoji, x, y });
    }
    setEmojis(newEmojis);
    setTimeout(() => setEmojis([]), 1000); // Clear emojis after 1 second
  };

  // Validate input and navigate to chat on login
  const handleLogin = () => {
    if (username.trim() === "" || password.trim() === "") {
      alert("Please enter username and password!");
      return;
    }
    setIsLoggedIn(true);
    triggerEmojiExplosion();
    setTimeout(() => {
      navigate("/homepage");
    }, 3000); // Navigate after 3 seconds
  };

  // Generate multiple bubbles (shapes) with random positions and animations
  const generateShapes = () => {
    const shapes = [];
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 50 + 50; // random size between 50px and 100px
      const top = Math.random() * 100; // random top position (percentage)
      const left = Math.random() * 100; // random left position (percentage)
      const duration = Math.random() * 10 + 5; // random duration between 5s and 15s
      const delay = Math.random() * 5; // random delay up to 5s
      shapes.push(
        <div
          key={i}
          className="shape"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        ></div>
      );
    }
    return shapes;
  };

  return (
    <>
      {/* Inject the CSS into the component */}
      <style>{styles}</style>
      <div className={`login-container ${theme}`}>
        <div className="animated-background"></div>
        <div className="floating-shapes">{generateShapes()}</div>

        {/* Custom Cursor */}
        <div
          className="custom-cursor"
          style={{ left: cursorPosition.x, top: cursorPosition.y }}
        ></div>
        {cursorTrail.map((trail, index) => (
          <div
            key={index}
            className="cursor-trail"
            style={{
              left: trail.x,
              top: trail.y,
              opacity: (index + 1) / cursorTrail.length,
            }}
          ></div>
        ))}

        {/* Emoji Explosions */}
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            className="emoji-explosion"
            style={{ left: emoji.x, top: emoji.y }}
          >
            {emoji.emoji}
          </div>
        ))}

        {isLoggedIn ? (
          <div className="login-box">
            <h1 className="welcome-message">Welcome, {username}!</h1>
          </div>
        ) : (
          <div className="login-box">
            <h1 className="login-title">ChatRouletteX</h1>

            <div className="input-container">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
              />
              <span className="input-border"></span>
            </div>

            <div className="input-container">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
              <span className="input-border"></span>
            </div>

            <button className="login-button" onClick={handleLogin}>
              Login
            </button>

            <div className="theme-toggle" onClick={toggleTheme}>
              <div className={`toggle-switch ${theme}`}></div>
              <span>{theme === "dark" ? "🌙" : "☀️"}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;