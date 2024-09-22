import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const joinRoomRef = useRef(null);
  const userNameRef = useRef(null);
  const [totalClientsConnected, setTotalClientsConnected] = useState(null);
  const [connectedClientsProfileName, setConnectedClientsProfileName] =
    useState([]);
  // useNavigate is a function that returns a navigate function
  const navigate = useNavigate();
  const toggleRoomJoiningDialog = () => {
    const isOpen = joinRoomRef.current.open;
    if (isOpen) {
      joinRoomRef.current.close();
    } else {
      joinRoomRef.current.showModal();
    }
  };
  const handleJoiningRoom = () => {
    const userName = userNameRef.current.value;
    if (userName) {
      navigate(`/room?name=${userName}`);
      joinRoomRef.current.close();
    } else {
      alert("Please enter a username to join the room!");
    }
  };
  useEffect(() => {
    const getTotalClientsConnected = async () => {
      // Using the Desktop's IP address
      const response = await fetch(
        `https://${import.meta.env.VITE_WEB_SOCKET_SERVER}/total-clients`
      );
      const responseInJson = await response.json();
      setTotalClientsConnected(responseInJson.totalClients);
      setConnectedClientsProfileName(responseInJson.allClientsProfileName);
    };
    getTotalClientsConnected();
  }, []);
  return (
    <div className="h-screen w-screen relative flex flex-col space-y-20 items-center text-xs lg:text-base bg-zinc-900 text-white roboto_cregular">
      <div className="w-[65%] xl:w-[50%] mt-[15vh] flex flex-col space-y-2 xl:space-y-4">
        <h1 className="roboto_cbold tracking-widest text-4xl lg:text-5xl xl:text-6xl">
          REAL TALK
        </h1>
        <p className="roboto_clight">
          Connect and communicate seamlessly. REAL TALK allows you to send text
          messages, images, videos, PDFs, and more. Join a room and start
          sharing now!
        </p>
      </div>
      <div className="h-64 w-64 xl:h-1/3 xl:w-1/3 flex flex-col space-y-6 items-center justify-center rounded-3xl bg-white text-black">
        <div className="flex space-x-2 items-center">
          <div className="online_animation h-2 w-2 rounded-full"></div>
          <h1>
            Users Online : {totalClientsConnected && totalClientsConnected}{" "}
          </h1>
        </div>
        <div className="flex flex-col space-y-1">
          {connectedClientsProfileName.map((profile, index) => (
            <h1 key={index}>{profile}</h1>
          ))}
        </div>
        <button
          onClick={toggleRoomJoiningDialog}
          className="bg-green-600 p-4 rounded-3xl text-white"
        >
          Join Room
        </button>
      </div>
      <dialog
        ref={joinRoomRef}
        // Dialog Element Position and size is Clumpsy
        className="fixed top-[35%] xl:top-[25%] roboto_cregular left-[10%] xl:left-[28%] lg:left-[35%] p-8 xl:p-16 w-[80vw] h-72 lg:w-[30vw] xl:w-[40vw] xl:h-96 rounded-3xl"
      >
        <div className="flex flex-col space-y-8 xl:space-y-10 items-start justify-center h-full w-full">
          <div className="w-full flex items-center justify-between">
            <h1>Join Meeting</h1>
            <img
              onClick={() => joinRoomRef.current.close()}
              className="cursor-pointer"
              src="blackremove.svg"
              alt="close"
              height="25"
              width="25"
            />
          </div>
          <input
            ref={userNameRef}
            className="p-4 rounded-3xl border-2 border-gray-400 focus:border-yellow-600 focus:outline-none xl:w-96"
            type="text"
            placeholder="Join Meeting as"
          />
          <div className="flex space-x-4 items-center">
            <button
              onClick={() => joinRoomRef.current.close()}
              className="border-2 border-gray-400 text-gray-800 p-4 rounded-3xl"
            >
              Cancel
            </button>
            {/* Here the userName Ref is accessed before that ref is defined */}
            <button
              onClick={handleJoiningRoom}
              className="bg-green-600 p-4 rounded-3xl text-white"
            >
              Join Room
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Home;
