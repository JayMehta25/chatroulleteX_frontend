import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Features from "./features";
import TutorialPage from "./TutorialPage";
import Home_page from "./Home";
import ChatLanding from "./ChatLanding";
import ChatMain from "./ChatMain";
import ParticlesPage from "./about";
import Register from "./Register";
import EmailVerification from "./EmailVerification";
import Login from "./Login";
import Tutorial from './TutorialPage';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        
        {/* Protected routes */}
        <Route path="/tutorial" element={<Tutorial />} />
        
        
        
        {/* Main Application Routes */}
        <Route path="/Home" element={<Home_page />} />
        <Route path="/TutorialPage" element={<TutorialPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/ChatLanding" element={<ChatLanding />} />
        <Route path="/ChatMain" element={<ChatMain />} />
        <Route path="/about" element={<ParticlesPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
      </Routes>
    </Router>
  );
}

export default App;
