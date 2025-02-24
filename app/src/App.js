import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChatClient from "./ChatClient";
import Service from "./Service";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatClient />} />
        <Route path="/service" element={<Service  />} />
      </Routes>
    </Router>
  );
}

export default App;