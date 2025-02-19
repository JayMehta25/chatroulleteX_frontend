import React from "react";
import { useNavigate } from "react-router-dom";

function Features() {
  const navigate = useNavigate();

  // Array of feature objects
  const features = [
    { icon: "💬", description: "Real-time private messaging with seamless room creation." },
    { icon: "🎙️", description: "Voice messaging and audio recording support for a richer chat experience." },
    { icon: "😊", description: "Fun animated reactions and emojis to express yourself." },
    { icon: "🔒", description: "Private chat rooms ensuring your conversations remain secure." },
    { icon: "🎨", description: "Customizable themes to match your style and mood." },
    { icon: "🚀", description: "Fast, lightweight, and optimized for mobile and desktop." },
  ];

  // Array of review objects
  const reviews = [
    { name: "Alice", rating: 5, text: "Amazing app! The chat experience is seamless and fun." },
    { name: "Bob", rating: 4, text: "Really enjoyed using this app. The private chat rooms are super secure." },
    { name: "Charlie", rating: 5, text: "Excellent design and smooth functionality. Highly recommended!" },
    { name: "Dana", rating: 4, text: "The features are top-notch, and I love the customizable themes." },
    { name: "Eve", rating: 5, text: "Super fast and reliable—this app is a must-have for real-time chat!" },
  ];

  return (
    <>
      <style>{`
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
          justify-content: center;
        }
        .navbar-title {
          font-size: 2rem;
          font-weight: bold;
          background: linear-gradient(45deg, rgb(255,255,255), rgb(162,21,194));
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
          padding: 6px 12px; /* Adjust these values to change button size */
          font-size: 0.9rem;
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
        @media (max-width: 600px) {
          .navbar {
            flex-direction: column;
            align-items: center;
          }
          .navbar-links {
              display: flex;            /* Use flex to line them up horizontally */
              flex-wrap: wrap;          /* Allows wrapping on small screens if needed */
              margin-top: 10px;
              margin-left:16px;
              margin-right: 10px;
              gap: 5px; 
              text-align:center;  
              overflow-x:auto;             /* Space between buttons */
            }
        }

        /* Features Page Container with animated white–black gradient background */
        .features-container {
          position: relative;
          min-height: 100vh;
          padding-top: 120px; /* Space for navbar */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
          background: linear-gradient(270deg, #000, #fff, #000);
          background-size: 400% 400%;
          animation: bgGradient 10s ease infinite;
          overflow: hidden;
        }
        .features-container::before {
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

        /* Features Header */
        .features-header {
          z-index: 1;
          margin-bottom: 40px;
        }
        .features-title {
          font-size: 2.8rem;
          font-weight: 700;
          background: linear-gradient(45deg, rgb(245,245,245), rgb(164,0,205));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
          animation: wave 3s ease infinite;
          margin-bottom: 10px;
        }
        @keyframes wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .features-subtitle {
          font-size: 1.2rem;
          color: #ddd;
          margin-bottom: 40px;
        }

        /* Features Grid */
        .features-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          z-index: 1;
          margin-bottom: 60px;
        }
        .feature-card {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
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

        /* Reviews Section */
        .reviews-section {
          width: 100%;
          background: rgba(0, 0, 0, 0.8);
          padding: 40px 20px;
          margin-top: 20px;
          z-index: 1;
        }
        .reviews-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #c0c0c0;
          margin-bottom: 20px;
        }
        .reviews-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .review-card {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 20px;
          border-radius: 10px;
          width: 300px;
          text-align: left;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .review-card:hover {
          transform: translateY(-5px) scale(1.03);
          filter: brightness(1.2);
        }
        .review-name {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 5px;
          color: #fff;
        }
        .review-text {
          font-size: 1rem;
          color: #ddd;
          margin-bottom: 10px;
        }
        .review-rating {
          color: #f1c40f;
          font-size: 1.2rem;
        }

        /* Footer */
        .footer {
          margin-top: 50px;
          padding: 20px;
          color: #ccc;
          font-size: 0.9rem;
          text-align: center;
          z-index: 1;
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-title">ChatRouletteX</div>
        <div className="navbar-links">
          <button className="nav-button" onClick={() => navigate("/Home")}>Home</button>
          <button className="nav-button" onClick={() => navigate("/features")}>Features</button>
          <button className="nav-button" onClick={() => navigate("/about")}>About</button>
          <button className="nav-button" onClick={() => navigate("/chat")}>Chat Now</button>
        </div>
      </nav>

      {/* Features Container */}
      <div className="features-container">
        <div className="features-header">
          <h1 className="features-title">Amazing Features</h1>
          <p className="features-subtitle">
            Discover the powerful features that make our app unique.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-description">{feature.description}</div>
            </div>
          ))}
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">User Reviews</h2>
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-name">{review.name}</div>
                <div className="review-text">"{review.text}"</div>
                <div className="review-rating">
                  {"★".repeat(review.rating)}{" "}
                  {"☆".repeat(5 - review.rating)}
                </div>
              </div>
            ))}
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

export default Features;
