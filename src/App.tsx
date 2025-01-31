import { useEffect, useRef, useState, useCallback } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

function App() {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsCapturing(true);
    } catch (err) {
      console.error("Camera permission error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "node_modules/@mediapipe/tasks-vision/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "hand_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      if (isMounted) {
        handLandmarkerRef.current = handLandmarker;
        console.log("HandLandmarker ready");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let reqId: number;
    let lastTimestamp = 0;
    function predict() {
      if (!handLandmarkerRef.current || !videoRef.current || !isCapturing) {
        reqId = requestAnimationFrame(predict);
        return;
      }
      const video = videoRef.current;
      let nowInMs = performance.now();
      if (nowInMs < lastTimestamp) {
        nowInMs = lastTimestamp + 0.01;
      }
      lastTimestamp = nowInMs;

      if (video.readyState < 2) {
        reqId = requestAnimationFrame(predict);
        return;
      }

      const results: HandLandmarkerResult =
        handLandmarkerRef.current.detectForVideo(video, nowInMs);

      if (results.landmarks && results.landmarks.length > 0) {
        console.log("Detected hands:", results.landmarks);
      } else {
        console.log("No hands");
      }

      reqId = requestAnimationFrame(predict);
    }
    reqId = requestAnimationFrame(predict);

    return () => cancelAnimationFrame(reqId);
  }, [isCapturing]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mediapipe HandLandmarker Demo</h1>
      <div>
        {!isCapturing ? (
          <button onClick={startCamera}>Start Camera</button>
        ) : (
          <button onClick={stopCamera}>Stop Camera</button>
        )}
      </div>
      <video
        ref={videoRef}
        style={{ width: "640px", height: "auto", background: "#ccc" }}
      />
    </div>
  );
}

export default App;
