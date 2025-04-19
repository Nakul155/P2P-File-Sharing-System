import { useState } from "react";

function Dropdown(props) {
  const [file, setFile] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const resetSelection = () => {
    // props.sendFile(selectedUser,)
    if(selectedUser==="" || !file){
      alert("Select a user and add the file to send");
      return;
    }
    props.sendFile(selectedUser,file);
    setSelectedUser("");
    setFile(null);
  }

  return (
    <div>
      <div className="text-white mx-8 mt-8 text-2xl">Send to:</div>
      <div className="flex mt-4 mx-8 gap-2">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="bg-light-blue h-[7vh] flex-grow text-white py-2 px-4 rounded-md border-none focus:outline-none appearance-none"
        >
          <option value="">Select recipient</option>
          {[...props.users].map(([id, user]) => (
            <option key={id} value={id}>
              {user}
            </option>
          ))}
        </select>
        <button
          onClick={resetSelection}
          className="hover:cursor-pointer bg-indigo border-2 h-[7vh] border-indigo text-white rounded-md px-4 hover:bg-transparent hover:text-indigo transition-colors"
        >
          Send File
        </button>
      </div>
      <div className="mx-8 mt-6">
        <div
          className="border-2 border-dashed border-indigo-500 rounded-lg py-10 bg-gray-800 text-center text-gray-300 w-full mx-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p>Drag and drop files here</p>
          <p className="text-gray-400">or</p>

          <label className="bg-indigo-500 text-white py-2 px-4 rounded-md cursor-pointer inline-block hover:bg-indigo-600 transition">
            Browse
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>

          {file && (
            <p className="mt-3 text-sm text-gray-400">Selected: {file.name}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
