import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import the Switch component
import Navbar from "./components/NavBar";
import "./App.css";
import AudioRecorder from "./components/AudioRecorder";
import MainComponent from "./components/AudioRecorderButton";
import TestComponent from "./components/RemvoePrompt";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* <Route path="/" element={<AudioRecorder />} /> */}
        {/* <Route path="/" element={<MainComponent />} /> */}
        <Route path="/" element={<TestComponent />} />
      </Routes>
    </Router>
  );
};

export default App;