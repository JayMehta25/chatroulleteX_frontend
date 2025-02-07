import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./homepage";
import Chat from "./chat";
import Features from "./features";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/features" element={<Features/>}/>
      </Routes>
    </Router>
  );
}

export default App;
