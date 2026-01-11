import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  UserPlus,
  Lock,
  Globe,
  Users,
  Shield,
  FileText,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWebSocket } from "./WebSocketContext";

function JoinRoom() {
  const navigate = useNavigate();
  const socket = useWebSocket();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrivate, setPrivate] = useState(true);
  const [publicRooms, setPublicRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const handleClick = (event) => {
    event.preventDefault();
    navigate(`/room?roomId=${roomId}`, { state: { userName } });
  };

  const handleJoinPublicRoom = (roomId) => {
    if (!userName.trim()) {
      alert("Please enter a user name");
      return;
    }
    navigate(`/room?roomId=${roomId}`, { state: { userName: userName.trim() } });
  };

  // Set up message handler for public rooms list
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "public-rooms-list") {
        setPublicRooms(message.rooms);
        setIsLoadingRooms(false);
      }
    };

    socket.addEventListener("message", handleMessage);
    
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  // Fetch public rooms when switching to public mode or search query changes
  useEffect(() => {
    if (isPrivate) {
      setPublicRooms([]);
      setIsLoadingRooms(false);
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Debounce search query
    const timeoutId = setTimeout(() => {
      setIsLoadingRooms(true);
      socket.send(JSON.stringify({ 
        type: "list-public-rooms",
        searchQuery: searchQuery
      }));
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPrivate, searchQuery, socket]);

  const privatePage = () => {
    return (
      <form onSubmit={handleClick}>
        <div className="flex justify-center mt-4">
          <input
            type="text"
            placeholder="Enter user name"
            onChange={(e) => setUserName(e.target.value)}
            className="bg-gray-700 text-white w-full px-2 py-1 rounded-sm focus:outline-none text-sm"
            required
          />
        </div>
        <div className="flex justify-center mt-2">
          <input
            type="text"
            placeholder="Enter room ID to connect"
            onChange={(e) => setRoomId(e.target.value)}
            className="bg-gray-700 text-white w-full px-2 py-1 rounded-sm focus:outline-none text-sm"
            required
          />
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="submit"
            className="border-2 border-indigo text-indigo rounded-md px-4 py-2 hover:bg-indigo hover:text-white transition-colors"
            name="user"
          >
            Join Room
          </button>
        </div>
      </form>
    );
  };

  const publicPage = () => {
    return (
      <div>
        <div className="flex justify-center mt-4">
          <input
            type="text"
            placeholder="Enter user name"
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            className="bg-gray-700 text-white w-full px-2 py-1 rounded-sm focus:outline-none text-sm"
            required
          />
        </div>
        <div className="h-full flex flex-col mt-2">
          <div className="relative mb-4">
            <input
              type="text"
              className="bg-gray-700 text-white pl-9 w-full px-2 py-1 rounded-sm focus:outline-none text-sm"
              placeholder="Search rooms by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-1 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Public Rooms List */}
          <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
            {isLoadingRooms ? (
              <div className="text-center text-gray-400 text-sm py-4">
                Loading rooms...
              </div>
            ) : publicRooms.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">
                {searchQuery ? "No rooms found matching your search" : "No public rooms available"}
              </div>
            ) : (
              publicRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => handleJoinPublicRoom(room.roomId)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-sm p-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium text-sm truncate">
                          {room.roomName}
                        </h3>
                        <span className="flex items-center gap-1 text-indigo text-xs whitespace-nowrap">
                          <Tag className="w-3 h-3" />
                          {room.genre}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs ml-2">
                      <Users className="w-3 h-3" />
                      <span>{room.memberCount}/{room.maxMembers}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid place-items-center h-screen bg-blue-black">
      <div className="bg-dark-blue-black px-8 py-10 rounded-[30px]">
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
            P2P File Sharing
          </h1>
          <p className="text-gray-400 font-[arial] text-sm mt-2 mx-5">
            Share files securely with end-to-end encryption
          </p>
        </div>
        <div className="flex bg-gray-700 rounded-sm justify-around w-full mt-5 border-4 border-gray-700 h-10 relative z-10">
          <button
            className={`transition-all duration-300 ease-in-out ${
              isPrivate ? "bg-indigo" : "bg-gray-700"
            } text-white w-full rounded-sm flex items-center justify-center text-sm`}
            onClick={() => setPrivate(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Private Room
          </button>
          <button
            className={`transition-all duration-300 ease-in-out ${
              isPrivate ? "bg-gray-700" : "bg-indigo"
            } text-white w-full rounded-sm flex items-center justify-center text-sm`}
            onClick={() => setPrivate(false)}
          >
            <Globe className="w-4 h-4 mr-2" />
            Public Room
          </button>
        </div>
        {isPrivate ? privatePage() : publicPage()}
      </div>
    </div>
  );
}

export default JoinRoom;
