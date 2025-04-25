import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Dropdown from "./Dropdown";

const ListItem = ({ children }) => (
  <li className="bg-light-blue py-4 px-4 rounded-[10px] my-4 text-lg">
    {children}
  </li>
);

function RoomLayout(props) {
  const [displayChat, setDisplayChat] = new useState(false);
  const [messageInput, setMessageInput] = useState("");

  console.log(props.msg);

  return (
    <div className="grid grid-cols-3 grid-rows-6 h-screen gap-7 bg-blue-black">
      <div className="flex items-center justify-between bg-dark-blue-black row-span-1 col-span-full rounded-[30px] mt-5 mx-5">
        <div className="text-white text-2xl ml-10">Room Id: {props.roomId}</div>
        <div className="text-gray-400 text-xl mr-10">
          {props.users.size + 1} {props.users.size === 0 ? "Member" : "Members"}{" "}
          Online
        </div>
      </div>
      <div className="grid grid-cols-2 grid-rows-7 bg-dark-blue-black col-span-1 row-span-5 rounded-[30px] ml-5 mb-5">
        <div className="grid grid-cols-2 row-span-1 col-span-2 text-white text-2xl m-0">
          <button
            onClick={() => setDisplayChat(false)}
            className={`transition-all duration-300 ease-in-out border-b-2 ${
              !displayChat ? "border-b-indigo" : "border-b-light-blue"
            } hover:cursor-pointer flex justify-center items-center h-full`}
          >
            Members
          </button>
          <button
            onClick={() => setDisplayChat(true)}
            className={`transition-all duration-300 ease-in-out border-b-2 ${
              displayChat ? "border-b-indigo" : "border-b-light-blue"
            } hover:cursor-pointer flex justify-center items-center h-full`}
          >
            Chat
          </button>
        </div>
        {!displayChat ? (
          <ul className="col-span-2 text-white m-5">
            <ListItem>{props.hostName} (You)</ListItem>
            {[...props.users].map(([id, user]) => (
              <ListItem key={id}>{user}</ListItem>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col justify-between row-span-7 col-span-2 text-white m-5">
            <div className="flex-1 overflow-y-auto p-4 bg-light-blue rounded-lg border border-light-blue">
              {props.msg.length === 0 ? (
                <p className="text-gray-400">No messages yet.</p>
              ) : (
                props.msg.map((msg, idx) => (
                  <div key={idx} className="mb-2">
                    <span
                      className={`font-semibold ${
                        msg.senderId === props.hostId
                          ? "text-white"
                          : "text-indigo"
                      }`}
                    >
                      {msg.senderId === props.hostId
                        ? "You"
                        : props.users.get(msg.senderId)}
                      :
                    </span>{" "}
                    {msg.msg}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-l-lg bg-light-blue px-4 py-2 text-white focus:outline-none"
              />
              <button
                className="bg-indigo px-4 py-2 rounded-r-lg text-white transition-all hover:cursor-pointer hover:bg-light-blue border-indigo border-2"
                onClick={() => {
                  const msg = messageInput.trim();
                  if (msg !== "") {
                    props.sendMessage(msg);
                    setMessageInput("");
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="bg-dark-blue-black row-start-2 col-start-2 col-span-2 row-span-5 rounded-[30px] mr-5 mb-5">
        <Dropdown users={props.users} sendFile={props.sendFile}></Dropdown>
      </div>
    </div>
  );
}

export default RoomLayout;
