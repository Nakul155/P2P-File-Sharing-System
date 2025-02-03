import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

function LandingPage() {
  const navigate = useNavigate();

  const handleClick = (event) => {
    navigate(`/${event.target.name}`, { state: { authorized: true } });
  };
  return (
    <div className="grid place-items-center h-screen bg-blue-black">
      <div className="bg-dark-blue-black h-80 w-90 rounded-[30px]">
        <div className="flex justify-center mt-10">
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
          <p className="text-gray-400 font-[arial] text-sm mt-2">
            Share files securely with end-to-end encryption
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="bg-indigo border-2 border-indigo text-white rounded-md px-4 py-2 hover:bg-transparent hover:text-indigo transition-colors"
            name="create-room"
            onClick={handleClick}
          >
            Create Room
          </button>
          <button
            className="border-2 border-indigo text-indigo rounded-md px-4 py-2 hover:bg-indigo hover:text-white transition-colors"
            name="join-room"
            onClick={handleClick}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
