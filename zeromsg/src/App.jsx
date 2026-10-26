import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateChat from "./pages/CreateChat";
import JoinChat from "./pages/JoinChat";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateChat />} />
        <Route path="/join" element={<JoinChat />} />
        <Route path="/chat/:roomId" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
