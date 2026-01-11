import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useWebSocket } from "./WebSocketContext";
import { Lock, Globe, Tag, Hash } from "lucide-react";

function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useWebSocket();
  const userName = location.state?.userName || "";
  
  const [isPrivate, setIsPrivate] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [genre, setGenre] = useState("");

  // Common genres/themes for file sharing rooms
  const genres = [
    "General",
    "Music",
    "Movies",
    "Documents",
    "Photos",
    "Software",
    "Books",
    "Games",
    "Education",
    "Work",
    "Personal",
    "Other"
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected. Please wait...");
      alert("WebSocket is not connected. Please ensure the backend server is running.");
      return;
    }

    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    if (!genre.trim()) {
      alert("Please select a genre/theme");
      return;
    }

    // Send room creation request with details
    socket.send(JSON.stringify({ 
      type: "create-room",
      roomName: roomName.trim(),
      isPrivate: isPrivate,
      genre: genre.trim()
    }));

    socket.onerror = (err) => {
      console.error("Websocket Error", err);
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "room") {
        navigate(`/room?roomId=${message.roomId}`, {
          state: { 
            userName,
            roomName: roomName.trim(),
            isPrivate,
            genre: genre.trim()
          }
        });
      } else if (message.type === "error") {
        alert(message.message || "Error creating room");
      }
    };
  };

  return (
    <div className="grid place-items-center h-screen bg-blue-black">
      <div className="bg-dark-blue-black px-8 py-10 rounded-[30px] w-full max-w-md">
        <div className="flex justify-center">
          <div className="w-15 h-15 bg-indigo rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="#FFF"
            >
              <path d="M450-450H220v-60h230v-230h60v230h230v60H510v230h-60v-230Z" />
            </svg>
          </div>
        </div>
        <div className="text-center mt-4">
          <h1 className="text-white font-[arial] text-2xl font-semibold mt-2">
            Room Details
          </h1>
          <p className="text-gray-400 font-[arial] text-sm mt-2 mx-5">
            Configure your room settings
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Private/Public Toggle */}
          <div className="flex bg-gray-700 rounded-sm justify-around w-full mt-5 border-4 border-gray-700 h-10 relative z-10">
            <button
              type="button"
              className={`transition-all duration-300 ease-in-out ${
                isPrivate ? "bg-indigo" : "bg-gray-700"
              } text-white w-full rounded-sm flex items-center justify-center text-sm`}
              onClick={() => setIsPrivate(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Private Room
            </button>
            <button
              type="button"
              className={`transition-all duration-300 ease-in-out ${
                isPrivate ? "bg-gray-700" : "bg-indigo"
              } text-white w-full rounded-sm flex items-center justify-center text-sm`}
              onClick={() => setIsPrivate(false)}
            >
              <Globe className="w-4 h-4 mr-2" />
              Public Room
            </button>
          </div>

          {/* Room Name Input */}
          <div className="flex justify-center mt-4">
            <div className="relative w-full">
              <Hash className="absolute left-2 top-1.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-gray-700 text-white w-full pl-9 px-2 py-1 rounded-sm focus:outline-none text-sm"
                required
                maxLength={50}
              />
            </div>
          </div>

          {/* Genre/Theme Selection */}
          <div className="flex justify-center mt-3">
            <div className="relative w-full">
              <Tag className="absolute left-2 top-1.5 h-5 w-5 text-gray-400 z-10" />
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="bg-gray-700 text-white w-full pl-9 px-2 py-1 rounded-sm focus:outline-none text-sm appearance-none cursor-pointer"
                required
              >
                <option value="">Select genre/theme</option>
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-gray-700">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/create-room")}
              className="border-2 border-gray-500 text-gray-300 rounded-md px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-indigo border-2 border-indigo text-white rounded-md px-4 py-2 hover:bg-transparent hover:text-indigo transition-colors"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoomDetails;

