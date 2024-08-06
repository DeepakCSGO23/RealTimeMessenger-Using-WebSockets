import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const messageRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const [allReceivedMessages, setAllReceivedMessages] = useState([]);

  useEffect(() => {
    wsRef.current = new WebSocket("wss://192.168.0.106:5000");
    wsRef.current.binaryType = "arraybuffer";

    wsRef.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "text") {
        console.log("incoming text message");
        setAllReceivedMessages((prev) => [...prev, message]);
      } else {
        console.log("incoming file message");
        console.log(message.type);
        const binaryFileData = base64ToArrayBuffer(message.data);
        const blob = new Blob([binaryFileData], { type: message.type });
        const imageUrl = URL.createObjectURL(blob);
        setAllReceivedMessages((prev) => [
          ...prev,
          { type: "file", data: imageUrl, timeStamp: message.timeStamp },
        ]);
      }
    };
  }, []);

  const handleSendingMessage = () => {
    const message = JSON.stringify({
      type: "text",
      data: messageRef.current.value,
      timeStamp: new Date().toLocaleString("en-IN", {
        hour12: true,
      }),
    });
    wsRef.current.send(message);
    messageRef.current.value = "";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendingMessage();
    }
  };

  const handleSendingFile = (e) => {
    const file = fileInputRef.current.files[0];
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const base64Data = arrayBufferToBase64(e.target.result);
        console.log(file);
        const message = JSON.stringify({
          type: file.type,
          fileName: file.name,
          data: base64Data,
          timeStamp: new Date().toLocaleString("en-IN", {
            hour12: true,
          }),
        });
        wsRef.current.send(message);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col space-y-20 items-center justify-center bg-black/80 text-white roboto_cregular">
      <h1 className="roboto_cbold tracking-widest text-6xl">REAL TALK</h1>
      <div className="flex flex-col items-center space-y-10">
        <input
          onKeyDown={handleKeyPress}
          ref={messageRef}
          type="text"
          className="text-black p-4 rounded-3xl"
        />
        <div className="flex items-center space-x-4">
          <label htmlFor="attachfile">
            <svg
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <title>Attach File</title>
              <path
                fill="white"
                fillRule="evenodd"
                d="M9 7a5 5 0 0 1 10 0v8a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v6a5 5 0 0 0 10 0V7a3 3 0 1 0-6 0v8a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v6a3 3 0 1 1-6 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </label>
          <input
            onChange={handleSendingFile}
            ref={fileInputRef}
            className="w-0"
            type="file"
            id="attachfile"
          />
          <button
            onClick={handleSendingMessage}
            className="border-2 p-4 rounded-3xl hover:scale-110 duration-300"
          >
            Send Message
          </button>
        </div>
      </div>
      <div className="flex flex-col border-2 rounded-3xl min-h-40 w-96 divide-y-2 divide-gray-400">
        {allReceivedMessages.map((message, index) => (
          <div className="flex items-center justify-between p-4" key={index}>
            {console.log(message)}
            {message.type === "text" ? (
              <h1>{message.data}</h1>
            ) : (
              <a href={message.data} download="test">
                File
              </a>
              // <a src={message.data} alt="file" height="50" width="50" />
            )}
            <span className="text-gray-400 text-xs">{message.timeStamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
