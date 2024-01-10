import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { IoMicCircle } from "react-icons/io5";

const AudioRecorder: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");

  useEffect(() => {
    const newSocket: any = io("http://localhost:5000");
    newSocket.on("processedAudio", (processedOutput: string) => {
      setResponse(processedOutput);
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        if (socket) {
          socket.emit("audioData", audioBlob);
        }
        audioChunks = [];
      });

      mediaRecorder.start();
      setRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        setRecording(false);
      }, 2400);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  useEffect(() => {
    if (!recording) {
      startRecording();
    }
  }, [recording]);

  return (
    <div className="mic-container">
      <div className="mic-inside-container">
        <div className="icon-container">
          <IoMicCircle className="icon" />
          <div className="ring"></div>
        </div>
        <div>
          <p className="text"> Listening...</p>
        </div>

        <div>
          {response === "0" && (
            <>
            <p className="trigger-word">Door Closing</p>
              <img
                src="src\assets\closing-door.gif"
                alt="close"
                className="door"
              />
            </>
          )}
          {response === "1" && (
            <>
            <p className="trigger-word">Door Open</p>
              <img src="src\assets\opened.gif" alt="open" className="door" />
            </>
          )}
          {response === "2" && (
            <>
            <p className="trigger-word">Door Stop</p>
              <img src="src\assets\stop.gif" alt="stop" className="door" />
            </>
          )}
          {console.log(response)}
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;