import Dropdown from "./Dropdown";

const ListItem = ({ children }) => (
  <li className="bg-light-blue py-4 px-4 rounded-[10px] my-4 text-lg">
    {children}
  </li>
);

function RoomLayout(props) {
  return (
    <div className="grid grid-cols-3 grid-rows-6 h-screen gap-7 bg-blue-black">
      <div className="flex items-center justify-between bg-dark-blue-black col-span-full rounded-[30px] mt-5 mx-5">
        <div className="text-white text-2xl ml-10">Room Id: {props.roomId}</div>
        <div className="text-gray-400 text-xl mr-10">
          {props.users.size + 1} {props.users.size === 0 ? "Member" : "Members"}{" "}
          Online
        </div>
      </div>
      <div className="bg-dark-blue-black col-span-1 row-span-5 rounded-[30px] ml-5 mb-5">
        <div className="text-white m-10 text-3xl">Members</div>
        <ul className="text-white m-10">
          <ListItem>{props.hostName} (You)</ListItem>
          {[...props.users].map(([id, user]) => (
            <ListItem key={id}>{user}</ListItem>
          ))}
        </ul>
      </div>
      <div className="bg-dark-blue-black col-span-2 row-span-5 rounded-[30px] mr-5 mb-5">
        <Dropdown users={props.users}></Dropdown>
      </div>
    </div>
  );
}

export default RoomLayout;
