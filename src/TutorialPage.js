import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper, { Step } from "./tutorial"; // Ensure this file exports Stepper & Step
import "bootstrap/dist/css/bootstrap.min.css";

const TutorialPage = () => {
  const [name, setName] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  // Called when the user finishes the final step
  const handleFinalStepCompleted = () => {
    // Trigger the fade-out animation
    setFadeOut(true);

    // After the animation ends, navigate to the homepage
    setTimeout(() => {
      navigate("/Home");
    }, 1000); // 1s delay matches fadeOut animation
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: 'Poppins', sans-serif;
          background: #000; /* Black background */
          overflow-x: hidden;
        }

        /* Container that fills the screen, black background */
        .tutorial-container {
          background: #000;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          transition: opacity 1s ease; /* fade animation */
        }

        /* Fade-out class triggers an animation to 0 opacity */
        .fade-out {
          opacity: 0;
        }

        /* Dark card with white text */
        .tutorial-card {
          background: #111;       /* Dark background */
          color: #fff;           /* White text */
          border-radius: 10px;
          padding: 20px;
          max-width: 100%;
          width: 100%;
        }

        /* Headings and paragraphs in white */
        .tutorial-card h2,
        .tutorial-card p {
          color: #fff;
          margin-bottom: 1em;
        }

        .tutorial-card h2 {
          font-weight: 600;
          margin-bottom: 20px;
        }

        /* Step images */
        .tutorial-card img {
          height: 150px;
          width: 100%;
          object-fit: cover;
          object-position: center -70px;
          border-radius: 15px;
          margin-top: auto;
        }

        /* Input field with dark background & white text */
        .tutorial-card input {
          width: 100%;
          padding: 10px;
          font-size: 1rem;
          margin-top: 1em;
          border-radius: 8px;
          border: 1px solid #444;
          background: #222;
          color: #fff;
        }
      `}</style>

      <div
        className={`tutorial-container container-fluid ${
          fadeOut ? "fade-out" : ""
        }`}
      >
        <div className="tutorial-card">
          <Stepper
            initialStep={1}
            onStepChange={(step) => {
              console.log("Step changed to:", step);
            }}
            onFinalStepCompleted={handleFinalStepCompleted}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            <Step>
              <h2>Welcome  ChatRouletteX!</h2>
              <p>Check out how to use the app.</p>
            </Step>
            <Step>
              <h2>Step 2</h2>
              <img src="/step1.png" alt="Step 1" />
              <p>Here you add your name and generate a code for your room.</p>
            </Step>
            <Step>
              <h2>Step 3</h2>
              <img src="/step2.png" alt="Step 3" />
              <p>If you already have a room code just add it and join in !!</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name?"
              />
            </Step>
            <Step>
              <h2>Final Step</h2>
              <p>Create Your Own Chatroom Now !</p>
            </Step>
          </Stepper>
        </div>
      </div>
    </>
  );
};

export default TutorialPage;
