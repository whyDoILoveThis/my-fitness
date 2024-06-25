import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

const WebcamComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [net, setNet] = useState<posenet.PoseNet | null>(null);
  const [pushupCount, setPushupCount] = useState<number>(0);
  const [isPoseEstimating, setIsPoseEstimating] = useState<boolean>(false);
  const [isPushupDown, setIsPushupDown] = useState<boolean>(false);
  const [prevShoulderToElbowHeight, setPrevShoulderToElbowHeight] =
    useState<number>(0);

  useEffect(() => {
    async function inittf() {
      await tf.ready();
    }

    inittf();
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const video = videoRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (video) {
          video.srcObject = stream;
          video.width = 640;
          video.height = 480;
          video.play();

          const poseNet = await posenet.load(); // Load PoseNet model
          setNet(poseNet);
        }
      }
    };

    setupCamera().catch((err) =>
      console.error("Error setting up camera:", err)
    );
  }, []);

  const estimatePose = async () => {
    if (!net || !videoRef.current || isPoseEstimating) return;

    setIsPoseEstimating(true);
    const video = videoRef.current;

    const pose = await net.estimateSinglePose(video, {
      flipHorizontal: false,
    });

    detectPushup(pose);
    drawPose(pose);

    setIsPoseEstimating(false);
  };

  const drawPose = (pose: posenet.Pose) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = videoRef.current?.videoWidth || 0;
      canvas.height = videoRef.current?.videoHeight || 0;

      // Draw keypoints
      pose.keypoints.forEach((keypoint) => {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
      });

      // Draw skeletons
      const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
        pose.keypoints,
        0.5
      ); // Adjust minConfidence as needed
      adjacentKeyPoints.forEach(([keypointA, keypointB]) => {
        ctx.beginPath();
        ctx.moveTo(keypointA.position.x, keypointA.position.y);
        ctx.lineTo(keypointB.position.x, keypointB.position.y);
        ctx.strokeStyle = "#00FF00";
        ctx.stroke();
      });
    }
  };

  const detectPushup = (pose: posenet.Pose) => {
    if (!net) return;

    // Example logic to detect push-up (simplified)
    // You may need to refine this logic based on your specific requirements
    const leftShoulder = pose.keypoints.find(
      (kp) => kp.part === "leftShoulder"
    );
    const rightShoulder = pose.keypoints.find(
      (kp) => kp.part === "rightShoulder"
    );
    const leftElbow = pose.keypoints.find((kp) => kp.part === "leftElbow");
    const rightElbow = pose.keypoints.find((kp) => kp.part === "rightElbow");

    if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
      const shoulderToElbowHeight =
        (leftShoulder.position.y + rightShoulder.position.y) / 2;
      const elbowToHipHeight =
        (leftElbow.position.y + rightElbow.position.y) / 2;

      // Example detection logic (adjust as needed)
      if (shoulderToElbowHeight <= elbowToHipHeight && !isPushupDown) {
        setIsPushupDown(true);
        setPrevShoulderToElbowHeight(shoulderToElbowHeight);
      } else if (shoulderToElbowHeight >= elbowToHipHeight && isPushupDown) {
        setIsPushupDown(false);
        setPushupCount((prevCount) => prevCount + 1);
      }
    }
  };

  estimatePose();

  return (
    <div className="webcam-component">
      <h2>Push-Up Counter using PoseNet</h2>
      <p>Push-Up Count: {pushupCount}</p>
      {/* <button onClick={estimatePose} disabled={isPoseEstimating}>
        {isPoseEstimating ? "Estimating Pose..." : "Estimate Pose"}
      </button> */}
      <div className="video-container">
        <video ref={videoRef} width="640" height="480" autoPlay></video>
        <canvas ref={canvasRef} width="640" height="480"></canvas>
      </div>
    </div>
  );
};

export default WebcamComponent;
