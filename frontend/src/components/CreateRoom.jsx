import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useState } from "react";

function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (navigationType==="POP") {
      navigate("/");
      window.location.reload();
      console.log("Sent message to signaling server");
    }
  }, [location, navigationType]);

  const handleClick = (event) => {
    event.preventDefault();
    
    if (!userName.trim()) {
      alert("Please enter a user name");
      return;
    }

    // Navigate to room details page with username
    navigate("/room-details", { state: { userName: userName.trim() } });
  }

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
        <form onSubmit={handleClick}>
          <div className="flex justify-center mt-5">
            <input
              type="text"
              placeholder="Enter user name"
              onChange={(e) => setUserName(e.target.value)}
              className="bg-gray-500 text-white w-full px-2 py-1 rounded-sm focus:outline-none text-sm"
              required
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="submit"
              className="border-2 border-indigo text-indigo rounded-md px-4 py-2 hover:bg-indigo hover:text-white transition-colors"
              name="user"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;
