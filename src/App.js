import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatLogin from "./ChatLanding";
import Features from "./features";
import LoginPage from "./LoginTemp";
import TutorialPage from "./TutorialPage";
import Home_page from "./Home";
import ChatLanding from "./ChatLanding";
import ChatMain from "./ChatMain";
import ParticlesPage from "./about";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Home" element={<Home_page />} />
        <Route path="/TutorialPage" element={<TutorialPage />} />
        <Route path="/chat" element={<ChatLogin />} />
        <Route path="/features" element={<Features />} />
        <Route path="/ChatLanding" element={<ChatLanding />} />
        <Route path="/ChatMain" element={<ChatMain />} />
        <Route path="/about" element={<ParticlesPage />} />

      </Routes>
    </Router>
  );
}

export default App;
