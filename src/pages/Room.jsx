import React, { useState, useRef, useEffect } from "react";
import "../App.css";
function Room() {
  const messageRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const [totalClientsConnected, setTotalClientsConnected] = useState(null);
  const [allReceivedMessages, setAllReceivedMessages] = useState([]);
  const [attachedFileMetaData, setAttachedFileMetaData] = useState(null);
  const [showNoTextMessageWarning, setShowNoTextMessageWarning] =
    useState(false);
  const analyzeSentiment = async (message) => {
    try {
      const response = await fetch(
        `https://${import.meta.env.VITE_SENTIMENT_ANALYSIS_SERVER}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );
      const responseInJson = await response.json();
      return responseInJson;
    } catch (err) {
      console.error("Error in sentiment analysis microservice", err);
    }
  };
  useEffect(() => {
    wsRef.current = new WebSocket(
      `wss://${import.meta.env.VITE_WEB_SOCKET_SERVER}`
    );
    wsRef.current.binaryType = "arraybuffer";
    // Sending Profile name immediately after establishing a connection & not when the client sends a message to the server instead we immediately set the profile name on connection
    wsRef.current.onopen = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const profileName = queryParams.get("name");
      wsRef.current.send(profileName);
    };
    wsRef.current.onmessage = async (e) => {
      const allMessages = JSON.parse(e.data);
      // Both Text & File
      if (allMessages.length > 2) {
        const binaryFileData = base64ToArrayBuffer(allMessages[2].data);
        const blob = new Blob([binaryFileData], { type: allMessages[2].type });
        const imageUrl = URL.createObjectURL(blob);
        allMessages[2].data = imageUrl;
        const sentimentAnalysisResponse = await analyzeSentiment(
          allMessages[1].data
        );
        console.log(sentimentAnalysisResponse);
        allMessages.push(sentimentAnalysisResponse);
        console.log(allMessages);
        setAllReceivedMessages((prev) => [...prev, allMessages]);
      }
      // Only Text
      else {
        // Using await since im using async function
        const sentimentAnalysisResponse = await analyzeSentiment(
          allMessages[1].data
        );
        allMessages.push(sentimentAnalysisResponse);
        console.log(allMessages);
        setAllReceivedMessages((prev) => [...prev, allMessages]);
      }
    };

    const getTotalClientsConnected = async () => {
      // Using the Desktop's IP address
      const response = await fetch(
        `https://${import.meta.env.VITE_WEB_SOCKET_SERVER}/total-clients`
      );
      const responseInJson = await response.json();
      setTotalClientsConnected(responseInJson.totalClients);
    };
    getTotalClientsConnected();
  }, []);

  const handleSendingMessage = () => {
    const textMessage = {
      type: "text",
      data: messageRef.current.value,
      timeStamp: new Date().toLocaleString("en-IN", {
        hour12: true,
      }),
    };
    const queryParams = new URLSearchParams(window.location.search);
    const profileName = queryParams.get("name");
    if (messageRef.current.value) {
      const messagesToSend = attachedFileMetaData
        ? [{ profileName }, textMessage, attachedFileMetaData]
        : [{ profileName }, textMessage];
      // Sending as JSON string
      wsRef.current.send(JSON.stringify(messagesToSend));
      messageRef.current.value = "";
    } else {
      setShowNoTextMessageWarning(true);
      setTimeout(() => {
        setShowNoTextMessageWarning(false);
      }, 4000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendingMessage();
    }
  };

  const handleAttachingFileToMessage = (e) => {
    const file = fileInputRef.current.files[0];
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        console.log("reading file completed");
        const base64Data = arrayBufferToBase64(e.target.result);
        console.log(file);
        const message = {
          type: file.type,
          fileName: file.name,
          data: base64Data,
          timeStamp: new Date().toLocaleString("en-IN", {
            hour12: true,
          }),
        };
        setAttachedFileMetaData(message);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };
  const colors = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
  ];
  const getColorForProfileName = (profileName) => {
    const hash = profileName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    console.log(hash);
    return colors[hash % colors.length];
  };
  return (
    <div className="min-h-screen w-screen relative flex flex-col space-y-10 xl:space-y-20 items-center text-xs lg:text-base justify-center bg-zinc-900 text-white roboto_cregular">
      {showNoTextMessageWarning && (
        <div className="text-white absolute top-10 bg-red-700 h-14 xl:h-16 w-full flex items-center justify-center">
          <h1 className="text-sm xl:text-base">
            Add a text message before sending a message!
          </h1>
        </div>
      )}
      <div className="w-[65%] xl:w-[50%] flex flex-col mt-10 space-y-2 xl:space-y-4">
        <h1 className="roboto_cbold tracking-widest text-4xl lg:text-5xl xl:text-6xl">
          REAL TALK
        </h1>
        <p className="roboto_clight">
          Connect effortlessly with REAL TALK. Send texts, images, videos, PDFs,
          and more. Join a room and start sharing!
        </p>
      </div>
      <div className="flex flex-col items-center space-y-10">
        <div className="flex space-x-4 items-center">
          <input
            onKeyDown={handleKeyPress}
            placeholder="Your Message..."
            ref={messageRef}
            type="text"
            className="text-black p-4 rounded-3xl placeholder:text-xs lg:placeholder:text-sm"
          />
          {attachedFileMetaData && (
            <span className="max-w-20 lg:max-w-40 xl:max-w-72 overflow-hidden text-ellipsis whitespace-nowrap">
              {attachedFileMetaData.fileName}
            </span>
          )}
          {attachedFileMetaData && (
            <img
              onClick={() => setAttachedFileMetaData(null)}
              className="cursor-pointer"
              src="/remove.svg"
              alt="close"
              height="20"
              width="20"
            />
          )}
        </div>
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
            onChange={handleAttachingFileToMessage}
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
      <div className="flex flex-col border-2 rounded-3xl min-h-screen lg:min-h-80 divide-y-2 w-[80%] xl:w-[60%] divide-gray-200">
        <div className="p-4 lg:p-6 xl:p-8 flex items-center space-x-4">
          <div className="online_animation h-2 w-2 lg:h-4 lg:w-4 rounded-full"></div>
          <h1>Users Online : {totalClientsConnected}</h1>
        </div>
        {allReceivedMessages.map((message, index) => (
          <div
            className="flex items-center justify-between p-4 lg:p-6 lg:pt-4 lg:pb-4"
            key={index}
          >
            {message.length > 3 ? (
              message[2].type.includes("image") ? (
                <div className="w-full flex flex-col space-y-2 xl:space-y-4 items-start justify-center">
                  <div className="flex items-center space-x-4">
                    <div
                      style={{
                        backgroundColor: getColorForProfileName(
                          message[0].profileName
                        ),
                      }}
                      className={`h-4 w-4 rounded-full`}
                    ></div>
                    <h1 className="text-base lg:text-lg">
                      {message[0].profileName}
                    </h1>
                    <span className="text-xs text-gray-400">
                      {message[1].timeStamp}
                    </span>
                  </div>
                  <div className="relative left-8 flex items-start space-x-4">
                    <p className="roboto_clight">{message[1].data}</p>
                    <a
                      className="relative"
                      href={message[2].data}
                      download={message[2].fileName}
                    >
                      <img
                        className="hover:opacity-40 h-10 w-10"
                        src={message[2].data}
                        alt="imagepreview"
                        height="30"
                        width="30"
                      />
                      <img
                        className="absolute bottom-0 right-0 pointer-events-none"
                        src="download.svg"
                        alt="download"
                        height="20"
                        width="20"
                      />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col space-y-2 items-start justify-center">
                  <div className="flex items-center space-x-4">
                    <div
                      style={{
                        backgroundColor: getColorForProfileName(
                          message[0].profileName
                        ),
                      }}
                      className={`h-4 w-4 rounded-full`}
                    ></div>
                    <h1 className="text-base lg:text-lg">
                      {message[0].profileName}
                    </h1>
                    <span className="text-xs text-gray-400">
                      {message[1].timeStamp}
                    </span>
                  </div>
                  <div className="relative left-8 flex items-start space-x-4">
                    <p className="roboto_clight">{message[1].data}</p>
                    <a
                      className="relative"
                      href={message[2].data}
                      download={message[2].fileName}
                    >
                      <img
                        className="hover:opacity-40 h-6 w-6"
                        src="downloadpdf.svg"
                        alt="previewpdf"
                        height="20"
                        width="20"
                      />
                      <img
                        className="absolute bottom-0 right-0 pointer-events-none"
                        src="download.svg"
                        alt="download"
                        height="20"
                        width="20"
                      />
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full flex flex-col space-y-2 items-start justify-center">
                <div className="flex items-center space-x-4">
                  <div
                    style={{
                      backgroundColor: getColorForProfileName(
                        message[0].profileName
                      ),
                    }}
                    className={`h-4 w-4 rounded-full`}
                  ></div>
                  <h1 className="text-base lg:text-lg">
                    {message[0].profileName}
                  </h1>
                  <span className="text-xs text-gray-400">
                    {message[1].timeStamp}
                  </span>
                  {message[2].sentiment > 0 ? (
                    <span title="Chatter is Happy">😁</span>
                  ) : message[2].sentiment === 0 ? (
                    <span title="Chatter is not feeling anything">🙂</span>
                  ) : (
                    <span title="Chatter is Sad">😔</span>
                  )}
                </div>
                <p className="roboto_clight relative left-8">
                  {message[1].data}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Room;
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
