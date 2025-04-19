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
          <div className="text-white m-5">
            {/* Replace with your real chat UI */}
            <p className="text-lg">Chat feature coming soon...</p>
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
