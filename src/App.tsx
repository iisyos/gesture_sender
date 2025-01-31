import { useState, useRef } from "react";
import "./App.css";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

function App() {
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  return (
    <>
      <header className="App-header">
        <button onClick={() => setIsCapturing(!isCapturing)}>
          {isCapturing ? "Stop capturing" : "Start capturing"}
        </button>
        {isCapturing && (
          <Webcam
            audio={false}
            height={720}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={1280}
            videoConstraints={videoConstraints}
          />
        )}
      </header>
    </>
  );
}

export default App;
