import React, { useRef, useState } from "react";
import axios from "axios";

const MainComponent: React.FC = () => {
  const audioChunks = useRef<any>([]);
  const [recordings, setRecordings] = useState<any>([]);
  const mediaRecorderRef = useRef<any>(null);

  const uploadAudio = (audioBlob, clipName) => {
    // Create FormData object to send the audio file along with other data
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("clipName", clipName);

    // Make a POST request to the server
    axios.post('/api/createAudio', formData)
      .then(response => console.log("Upload success:", response))
      .catch(error => console.error("Upload fail:", error));
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = function () {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const clipName = prompt('Enter a name for your sound clip?', 'My unnamed clip');

        // Call the function to upload the audio
        uploadAudio(audioBlob, clipName);

        // Update state and reset audioChunks
        setRecordings((prev: any) => [...prev, audioBlob]);
        audioChunks.current = [];
      };

      console.log("start recording");
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      console.error(err);
    }
  };

  const stopRec = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div>
      <button onClick={startRec}>Start Recording</button>
      <button onClick={stopRec}>Stop Recording</button>
      {recordings.length > 0 && (
        <div>
          <audio src={URL.createObjectURL(recordings[recordings.length - 1])} controls />
        </div>
      )}
    </div>
  );
};

export default MainComponent;