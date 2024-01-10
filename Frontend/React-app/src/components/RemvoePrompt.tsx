import React, { useEffect } from "react";
import { useRef, useState } from "react";
import axios from "axios"; // Import the axios library
import { IoMicCircle } from "react-icons/io5";

const TestComponent: React.FC = () => {
  const audioChunks = useRef<any>([]);
  const [recordings, setRecordings] = useState<any>([]);
  const mediaRecorderRef = useRef<any>(null);
  const [doorStatus, setDoorStatus] = useState<any>(4);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const uploadAudio = (audioBlob: any) => {
    // Create FormData object to send the audio file along with other data
    const formData = new FormData();
    formData.append("audio", audioBlob);

    // Make a POST request to the server
    axios // Use the axios library
      .post("http://192.168.3.133:3233/api/createAudio", formData)
      .then((response) => {
        console.log("Upload success:", response);
        setDoorStatus(response.data);
      })
      .catch((error) => console.error("Upload fail:", error));
  };
  const startRec = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
          console.log(audioChunks.current);
          audioChunks.current.push(e.data);
        }
      };
      mediaRecorder.onstop = function () {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Call the function to upload the audio
        uploadAudio(audioBlob);
        setRecordings((prev: any) => [...prev, audioUrl]);
        audioChunks.current = [];
      };
      console.log("start recording");
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      console.log(err);
    }
  };

  const stopRec = () => {
    setIsRecording(false);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      console.log(recordings.length);
    }
  };
  return (
    <div className="mic-container">
      <div className="mic-inside-container">
        <div className="icon-container">
          <IoMicCircle className="icon" />
          {isRecording && <div className="ring"></div>}
        </div>
        <div className="button-container">
          <button className="button" onClick={startRec}>
            Start Recording
          </button>
          <button className="button" onClick={stopRec}>
            Stop Recording
          </button>
        </div>
        <div>
          {doorStatus === 0 && (
            <>
              <img
                src="src\assets\closing-door.gif"
                alt="close"
                className="door"
              />
            </>
          )}
          {doorStatus === 1 && (
            <>
              <img src="src\assets\opened.gif" alt="open" className="door" />
            </>
          )}
          {doorStatus === 2 && (
            <>
              <img src="src\assets\stop.gif" alt="stop" className="door" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestComponent;