// Homepage.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OrbBackground from "./OrbBackground"; // Ensure the path is correct
import "bootstrap/dist/css/bootstrap.min.css";

// ---------- Typewriter Title Component ----------
function TypewriterTitle() {
  const [text, setText] = useState("");
  const fullText = "ChatRouletteX";
  const [index, setIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (index < fullText.length) {
      const timer = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 150); // Adjust typing speed here
      return () => clearTimeout(timer);
    }
  }, [index, fullText]);

  return (
    <div className="navbar-title">
      {text}
      <span className="cursor"></span>
    </div>
  );
}

// ---------- ChatBot Component ----------
function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hello! I'm ChatBot, your virtual assistant for ChatRouletteX. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const typeOutBotMessage = (fullText) => {
    let index = 0;
    let botReply = "";
    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
    const interval = setInterval(() => {
      if (index < fullText.length) {
        botReply += fullText[index];
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { sender: "bot", text: botReply };
          return newMessages;
        });
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50);
  };

  const handleSend = async () => {
    if (isTyping || input.trim() === "") return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);
  
    try {
      const response = await fetch("https://chatroulletexbackend-production-adb8.up.railway.app/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
  
      // Log the response to ensure correct data is received
      console.log("ChatBot response:", data);
  
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "ChatBot is thinking..." },
      ]);
      setTimeout(() => {
        setMessages((prev) => prev.slice(0, prev.length - 1)); // Remove the thinking message
        typeOutBotMessage(data.reply); // Update with the actual bot's reply
      }, 1000);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, an error occurred while processing your request.",
        },
      ]);
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  

  return (
    <>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>ChatBot</span>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {msg.sender === "bot" ? "🤖 " : "👤 "}
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot typing-indicator">
                🤖{" "}
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chatbot-input"
              disabled={isTyping}
            />
            <button
              className="chatbot-send"
              onClick={handleSend}
              disabled={isTyping}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
      {!isOpen && (
        <div className="chatbot-prompt">
          Need any help? I can do it for you now!
        </div>
      )}
    </>
  );
}

// ---------- Main Homepage Component ----------
export default function Homepage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Update scrollY for dynamic styling
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic title style (moves from center to top)
  const titleStyle = {
    position: "fixed",
    top: scrollY > 100 ? "10%" : "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    transition: "all 0.5s ease",
    color: "#fff",
    fontSize: "3rem",
    fontWeight: "bold",
    textShadow: "0 0 10px rgba(255,255,255,0.5)",
    zIndex: 2
  };

  // Functionalities info style with moving gradient text

  // Logout handler for navigation bar
  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <>
      {/* Global and Component Styles */}
      <style>
        {`
          /* Keyframes for background and gradient animations */
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes bgAnimation {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
          }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes gradientShift {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes floatUpDown {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          @keyframes promptSlide {
            0% { transform: translateX(0); opacity: 1; }
            50% { transform: translateX(10px); opacity: 0.8; }
            100% { transform: translateX(0); opacity: 1; }
          }

          /* Global Styles */
          body {
            margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            overflow-y: auto;
          }
          /* Navigation Bar */
          .navbar {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            align-items: center;
            padding: 10px 20px;
            justify-content: space-between;
          }
          .navbar-left {
            display: flex;
            align-items: center;
          }
          .navbar-title {
            font-size: 2rem;
            font-weight: bold;
            background: linear-gradient(45deg, #fff, rgb(0, 187, 255));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-right: 20px;
            overflow: hidden;
            white-space: nowrap;
          }
          .cursor {
            display: inline-block;
            width: 3px;
            height: 1.2em;
            background:rgb(255, 255, 255);
            margin-left: 2px;
            animation: blink 1s infinite;
            vertical-align: middle;
          }
          .navbar-links {
            display: flex;
            gap: 20px;
          }
          .nav-button {
            padding: 6px 12px;
            font-size: 0.9rem;
            border: none;
            border-radius: 5px;
            background: linear-gradient(60deg, #000, #87ceeb, #000);
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
          .logout-button {
            padding: 6px 12px;
            font-size: 0.9rem;
            border: none;
            border-radius: 5px;
            background: linear-gradient(90deg, #fff, #000, #fff);
            background-size: 200% auto;
            color: #fff;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            outline: none;
          }
          .logout-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          @media (max-width: 600px) {
            .navbar {
              flex-direction: column;
              align-items: center;
            }
            .navbar-links {
              flex-wrap: wrap;
              margin-top: 10px;
              gap: 5px;
              text-align: center;
              overflow-x: auto;
            }
          }
          /* Homepage Content Styles */
          .homepage-container {
            position: relative;
            min-height: 100vh;
            padding-top: 120px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #fff;
            z-index: 2;
          }
          .chat-bubble {
            background: rgba(255, 255, 255, 0.15);
            padding: 15px 25px;
            border-radius: 15px;
            font-size: 1.2rem;
            display: inline-block;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: floatUpDown 2s infinite alternate ease-in-out;
            margin-bottom: 20px;
          }
          .homepage-box {
            background: rgba(0, 0, 0, 0.2);
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
            background: linear-gradient(45deg, #f5f5f5, rgb(0, 132, 255));
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
          @media (max-width: 600px) {
            .homepage-button {
              display: block;
              width: 100%;
              margin: 10px 0;
            }
          }
          /* Contact Section Styles */
          .contact-section {
            background: rgba(0, 0, 0, 0.8);
            padding: 40px 20px;
            margin-top: 40px;
            width: 100%;
          }
          .contact-title {
            font-size: 2rem;
            margin-bottom: 20px;
            color: #c0c0c0;
          }
          .contact-details {
            font-size: 1.1rem;
            color: #ddd;
          }
          .contact-details a {
            color: #87ceeb;
            text-decoration: none;
          }
          /* Footer Styles */
          .footer {
            margin-top: 50px;
            padding: 20px;
            color: #ccc;
            font-size: 0.9rem;
            text-align: center;
          }
          /* ChatBot Styles */
          .chatbot-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(45deg, #ff1493, #00b7ff, #ff1493); /* Pink to blue gradient */
          background-size: 400% 400%;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1100;
          animation: floatUpDown 2s ease-in-out infinite, shine 1.5s ease-in-out infinite;
        }

        @keyframes shine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
          .chatbot-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 320px;
            max-height: 450px;
            background: rgba(0,0,0,0.85);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            z-index: 1100;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }
          .chatbot-header {
            padding: 12px 16px;
            background: linear-gradient(45deg, #2c3e50, #3a3a3a);
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            font-weight: bold;
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .chatbot-close {
            background: transparent;
            border: none;
            color: #fff;
            font-size: 1.2rem;
            cursor: pointer;
          }
          .chatbot-messages {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            color: #fff;
            background: rgba(0,0,0,0.75);
          }
          .chatbot-message {
            margin-bottom: 10px;
            padding: 10px 14px;
            border-radius: 12px;
            max-width: 85%;
            display: flex;
            align-items: center;
          }
          .chatbot-message.user {
            background: #3a3a3a;
            align-self: flex-end;
          }
          .chatbot-message.bot {
            background: #2c3e50;
            align-self: flex-start;
          }
          .chatbot-message .typing-dots span {
            display: inline-block;
            margin-left: 2px;
            animation: blink 1s infinite;
          }
          .chatbot-input-container {
            display: flex;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          .chatbot-input {
            flex: 1;
            padding: 12px;
            border: none;
            outline: none;
            background: rgba(0,0,0,0.7);
            color: #fff;
            border-bottom-left-radius: 15px;
          }
          .chatbot-send {
            padding: 12px 16px;
            background: linear-gradient(45deg, #3a3a3a, #2c3e50);
            border: none;
            color: #fff;
            cursor: pointer;
            border-bottom-right-radius: 15px;
          }
          .typing-indicator {
            font-style: italic;
            color: #bbb;
          }
          .chatbot-prompt {
            position: fixed;
            bottom: 90px;
            right: 90px;
            background: #f39c12;
            color: #fff;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: promptSlide 3s ease-in-out infinite;
            z-index: 1100;
          }
        `}
      </style>

      {/* ---------- Navigation Bar ---------- */}
      <nav className="navbar">
        <div className="navbar-left">
          <TypewriterTitle />
          <button className="logout-button" onClick={handleLogout}>
            🚪
          </button>
        </div>
        <div className="navbar-links">
          <button className="nav-button" onClick={() => navigate("/homepage")}>
            Home
          </button>
          <button className="nav-button" onClick={() => navigate("/features")}>
            Features
          </button>
          <button className="nav-button" onClick={() => navigate("/about")}>
            About
          </button>
          <button className="nav-button" onClick={() => navigate("/ChatLanding")}>
            Chat Now
          </button>
        </div>
      </nav>

      {/* ---------- Animated Background Container ---------- */}
      <div
        style={{
          width: "100vw",
          minHeight: "0vh",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(45deg, skyblue, black)",
          backgroundSize: "400% 400%",
          animation: "bgAnimation 10s ease infinite"
        }}
      >
        {/* Orb Background Component */}
        <OrbBackground />

        {/* Dynamic Title */}
        <div style={titleStyle}>ChatRouletteX</div>


        {/* ---------- Homepage Content ---------- */}
        <div className="homepage-container">
          <div className="chat-bubble">
            💬 Meet new people, chat privately, and build real connections!
          </div>
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

          {/* ---------- Contact Section ---------- */}
          <div className="contact-section">
            <h2 className="contact-title">Contact Us</h2>
            <p className="contact-details">
              Have any questions or need support? Reach out to us at{" "}
              <a href="mailto:support@chatroulletex.com">support@chatroulletex.com</a>.
            </p>
            <p className="contact-details">
              Follow us on social media:{" "}
              <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>{" "}
              |{" "}
              <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </p>
          </div>

          {/* Footer (always visible) */}
          <div className="footer">
            &copy; {new Date().getFullYear()} ChatRouletteX. All rights reserved.
          </div>
        </div>
      </div>

      {/* ---------- ChatBot Component ---------- */}
      <ChatBot />
    </>
  );
}
