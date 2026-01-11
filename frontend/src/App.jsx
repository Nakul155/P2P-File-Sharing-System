import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import JoinRoom from "./components/JoinRoom";
import CreateRoom from "./components/CreateRoom";
import RoomDetails from "./components/RoomDetails";
import Room from "./components/Room";
import RoomLayout from "./components/RoomLayout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/room-details" element={<RoomDetails />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/room" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
