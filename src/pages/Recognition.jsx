
import { useEffect, useRef, useState } from "react";
import { extractSymbols } from "../services/expressionSegmentation";
import { prepareExpressionSymbols } from "../services/prepareExpressionSymbols";
import { recognizeOperator } from "../services/operatorRecognition";
import {
  Activity,
  ArrowRight,
  Brain,
  Camera,
  CameraOff,
  CheckCircle2,
  CircleHelp,
  Fingerprint,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import DrawingCanvas from "../components/DrawingCanvas";
import { loadMNIST } from "../services/mnistLoader";
import { predictDigit } from "../services/knnPredict";
import {
  preprocessCanvas,
  preprocessCameraCanvas,
} from "../services/preprocessCanvas";
import { savePrediction } from "../services/history";

// Displays an actual 28 x 28 MNIST training image.
function NeighborThumbnail({ pixels }) {
  const thumbnailRef = useRef(null);

  useEffect(() => {
    const canvas = thumbnailRef.current;

    if (!canvas || !pixels || pixels.length !== 784) return;

    const context = canvas.getContext("2d");
    const imageData = context.createImageData(28, 28);

    for (let i = 0; i < 784; i++) {
      const value = pixels[i];
      const offset = i * 4;

      imageData.data[offset] = value;
      imageData.data[offset + 1] = value;
      imageData.data[offset + 2] = value;
      imageData.data[offset + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
  }, [pixels]);

  return (
    <canvas
      ref={thumbnailRef}
      width={28}
      height={28}
      className="neighbor-thumbnail"
      aria-label="MNIST neighbour image"
    />
  );
}

function ProcessedImagePreview({ pixels }) {
  const previewRef = useRef(null);

  useEffect(() => {
    const canvas = previewRef.current;

    if (!canvas || !pixels || pixels.length !== 784) return;

    const context = canvas.getContext("2d");
    const imageData = context.createImageData(28, 28);

    for (let i = 0; i < 784; i++) {
      const value = pixels[i];
      const offset = i * 4;

      imageData.data[offset] = value;
      imageData.data[offset + 1] = value;
      imageData.data[offset + 2] = value;
      imageData.data[offset + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
  }, [pixels]);

  return (
    <canvas
      ref={previewRef}
      width={28}
      height={28}
      className="processed-preview-canvas"
      aria-label="Preprocessed 28 by 28 MNIST image"
    />
  );
}

export default function Recognition() {
  const canvasRef = useRef(null);
  const datasetRef = useRef(null);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [kValue, setKValue] = useState(5);
  const [message, setMessage] = useState("");
  const [processedPixels, setProcessedPixels] = useState(null);
const [expressionPreviews, setExpressionPreviews] = useState([]);
const [expressionResult, setExpressionResult] = useState(null);  
// Camera mode state.
  const [activeMode, setActiveMode] = useState("sketch");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  // Open the device camera.
  async function startCamera() {
    setActiveMode("camera");
    setCameraError("");
    setCapturedImage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not supported. Use HTTPS or localhost."
      );
      return;
    }

    // Avoid opening another stream if one is already active.
    if (cameraStreamRef.current) {
      setCameraStarted(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraStarted(true);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraStarted(false);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was found on this device.");
      } else {
        setCameraError(
          "Unable to access the camera. Please check your device."
        );
      }
    }
  }

  // Stop the active camera stream.
  function stopCamera() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
    setCapturedImage(null);
  }

  // Capture the current camera frame.
  function capturePhoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      setCameraError("Camera is not ready yet.");
      return;
    }

    const captureCanvas = document.createElement("canvas");

    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const context = captureCanvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      captureCanvas.width,
      captureCanvas.height
    );

    setCapturedImage(captureCanvas.toDataURL("image/png"));
    setCameraError("");
  }


async function handleCameraPrediction() {
  if (!capturedImage) {
    setCameraError("Please capture a photo first.");
    return;
  }

  setCameraError("");
  setMessage("");
  setPredicting(true);
  setResult(null);
  setProcessedPixels(null);

  try {
    if (!datasetRef.current) {
      setMessage("Loading 5,000 MNIST training images...");
      datasetRef.current = await loadMNIST();
    }

    setMessage("Preparing your camera image...");

    const image = new Image();

    image.src = capturedImage;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () =>
        reject(new Error("Unable to load the captured photo."));
    });

    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = image.naturalWidth;
    photoCanvas.height = image.naturalHeight;

    const context = photoCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    context.drawImage(image, 0, 0);

    const inputPixels = preprocessCameraCanvas(photoCanvas);

    setProcessedPixels(inputPixels);

    setMessage("Comparing with MNIST training examples...");

    const prediction = predictDigit(
      inputPixels,
      datasetRef.current,
      kValue
    );

console.log(
  "CAMERA KNN DIAGNOSTICS:",
  JSON.stringify(
    {
      predictedDigit: prediction.predictedDigit,
      votes: prediction.votes,
      k: prediction.k,
      neighbors: prediction.neighbors.map((n, index) => ({
        rank: index + 1,
        digit: n.label,
        distance: Math.sqrt(n.distance).toFixed(2),
      })),
    },
    null,
    2
  )
);


    const resultData = {
      digit: prediction.predictedDigit,
      votes: prediction.votes,
      neighbors: prediction.neighbors,
      mode: "knn",
      k: prediction.k,
    };

    savePrediction({
      id: Date.now(),
      digit: resultData.digit,
      votes: resultData.votes,
      image: Array.from(inputPixels),
      mode: "camera",
      k: prediction.k,
      createdAt: new Date().toISOString(),
    });

    setResult(resultData);
    setMessage("");
  } catch (error) {
    console.error("Camera prediction error:", error);

    setCameraError(
      error.message || "Camera prediction failed. Please try again."
    );
  } finally {
    setPredicting(false);
  }
}


  // Attach the active stream to the video element.
  useEffect(() => {
    if (
      cameraStarted &&
      activeMode === "camera" &&
      videoRef.current &&
      cameraStreamRef.current
    ) {
      videoRef.current.srcObject = cameraStreamRef.current;

      videoRef.current.play().catch((error) => {
        console.error("Video playback error:", error);
        setCameraError("Unable to display the camera preview.");
      });
    }
}, [cameraStarted, activeMode, capturedImage]);
  // Release camera resources when the component unmounts.
  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  // Existing KNN prediction function.
  async function handlePrediction() {
    if (!canvasRef.current?.hasDrawing()) {
      setMessage("Please draw a digit before starting a prediction.");
      setResult(null);
      return;
    }

    setMessage("");
    setPredicting(true);
    setResult(null);

    try {
      if (!datasetRef.current) {
        setMessage("Loading 5,000 MNIST training images...");
        datasetRef.current = await loadMNIST();
      }

      setMessage(
        "Comparing your drawing with the nearest examples..."
      );

      const canvas = canvasRef.current.getCanvas();

      const inputPixels = preprocessCanvas(canvas);

      setProcessedPixels(inputPixels);

      const prediction = predictDigit(
        inputPixels,
        datasetRef.current,
        kValue
      );

      console.log(
  "CLOSEST MNIST EXAMPLE FOR EACH DIGIT:",
  prediction.closestByDigit.map((item) => ({
    digit: item?.label,
    distance: item?.distance,
    index: item?.index,
  }))
);

      console.log(
        "PREDICTION CHECK:",
        JSON.stringify(
          {
            predictedDigit: prediction.predictedDigit,
            votes: prediction.votes,
            k: prediction.k,
            neighbors: prediction.neighbors.map((n) => ({
              digit: n.label,
              distance: Math.sqrt(n.distance).toFixed(2),
            })),
          },
          null,
          2
        )
      );

      console.log(
        "KNN nearest neighbors:",
        prediction.neighbors.map((neighbor, index) => ({
          rank: index + 1,
          digit: neighbor.label,
          distance: Math.sqrt(neighbor.distance).toFixed(2),
        }))
      );

      const resultData = {
        digit: prediction.predictedDigit,
        votes: prediction.votes,
        neighbors: prediction.neighbors,
        mode: "knn",
        k: prediction.k,
      };

      const record = {
        id: Date.now(),
        digit: resultData.digit,
        votes: resultData.votes,
        image: Array.from(inputPixels),
        mode: "knn",
        k: prediction.k,
        createdAt: new Date().toISOString(),
      };

      savePrediction(record);

      setResult(resultData);
      setMessage("");
    } catch (error) {
      console.error("KNN prediction error:", error);

      setMessage(
        error.message || "Prediction failed. Please try again."
      );
    } finally {
      setPredicting(false);
    }
  }

  function handleClear() {
    canvasRef.current?.clear();
    setResult(null);
    setMessage("");
    setProcessedPixels(null);
  }

  function handleUndo() {
    canvasRef.current?.undo();
    setResult(null);
    setMessage("");
    setProcessedPixels(null);
  }

  const sortedVotes = result
    ? result.votes
        .filter((vote) => vote.count > 0)
        .sort((a, b) => b.count - a.count)
    : [];

async function handleExpressionSegmentation() {
    try {
    const canvas = canvasRef.current?.getCanvas();

    const symbols = extractSymbols(canvas);

    const preparedSymbols = prepareExpressionSymbols(
      canvas,
      symbols
    );
    console.log(
  "FIRST DIGIT PREVIEW:",
  preparedSymbols[0].preview
);
    // Load MNIST if it has not been loaded yet.
if (!datasetRef.current) {
  setMessage("Loading 5,000 MNIST training images...");
  datasetRef.current = await loadMNIST();
}

setMessage("Recognizing expression digits...");
setExpressionResult(null);
// Recognize the first and third symbols as digits.
const firstPrediction = predictDigit(
  preparedSymbols[0].pixels,
  datasetRef.current,
  1
);
console.log("FIRST DIGIT PREPROCESSED PIXELS:", [
  ...preparedSymbols[0].pixels,
]);
const secondPrediction = predictDigit(
  preparedSymbols[2].pixels,
  datasetRef.current,
  1
);
console.log(
  "FIRST EXPRESSION DIGIT NEIGHBORS:",
  firstPrediction.neighbors.map((neighbor, index) => ({
    rank: index + 1,
    digit: neighbor.label,
    distance: Math.sqrt(neighbor.distance).toFixed(2),
  }))
);

console.log(
  "FIRST DIGIT CLOSEST EXAMPLE PER CLASS:",
  firstPrediction.closestByDigit.map((item) => ({
    digit: item?.label,
    distance: item
      ? Math.sqrt(item.distance).toFixed(2)
      : null,
  }))
);
// Recognize the middle symbol as an operator.
const operator = recognizeOperator(
  canvas,
  preparedSymbols[1]
);

console.log("DETECTED OPERATOR:", operator);
// Calculate the recognized expression.
if (operator === "+") {
  const firstDigit = Number(firstPrediction.predictedDigit);
  const secondDigit = Number(secondPrediction.predictedDigit);

  const answer = firstDigit + secondDigit;

  setExpressionResult({
    expression: `${firstDigit} + ${secondDigit}`,
    answer,
  });

  console.log("FINAL EXPRESSION:", {
    expression: `${firstDigit} + ${secondDigit}`,
    answer,
  });
} else {
  setExpressionResult(null);
  setMessage("Unable to recognize the arithmetic operator.");
}
console.log("EXPRESSION DIGIT PREDICTIONS:", {
  firstDigit: firstPrediction.predictedDigit,
  secondDigit: secondPrediction.predictedDigit,
});
    setExpressionPreviews(preparedSymbols);

    console.log(
      "PREPARED EXPRESSION SYMBOLS:",
      preparedSymbols.map((symbol, index) => ({
        position: index + 1,
        x: symbol.x,
        width: symbol.width,
        height: symbol.height,
        pixels: symbol.pixels.length,
        preview: symbol.preview,
      }))
    );
  } catch (error) {
    console.error("Expression preparation error:", error);
    alert(error.message);
  }
}

  return (
    <div className="page-content recognition-page">
      <section className="recognition-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> INTERACTIVE LAB
          </div>

          <h1>
            Recognition <span>Studio</span>
          </h1>

          <p>
            Draw or capture a handwritten digit using your device.
          </p>
        </div>

        <div className="studio-mode">
          <span /> KNN MODEL ACTIVE
        </div>
      </section>

      {/* Recognition mode switcher */}
      <div className="recognition-mode-switcher">
        <button
          type="button"
          className={
            activeMode === "camera"
              ? "mode-option active"
              : "mode-option"
          }
          onClick={startCamera}
        >
          <Camera size={18} />
          Live Camera
        </button>

        <button
          type="button"
          className={
            activeMode === "sketch"
              ? "mode-option active"
              : "mode-option"
          }
          onClick={() => {
            stopCamera();
            setActiveMode("sketch");
            setCameraError("");
          }}
        >
          <Fingerprint size={18} />
          Sketching
        </button>
      </div>

{/* Live Camera mode */}
{activeMode === "camera" ? (
  <section className="camera-studio">
    <div className="camera-studio-heading">
      <div>
        <h2>Live Camera</h2>
        <p>
          Capture a handwritten digit using your camera.
        </p>
      </div>

      <span className="camera-status">
        {cameraStarted ? "Camera active" : "Camera inactive"}
      </span>
    </div>

    <div className="camera-preview-container">
      {capturedImage ? (
        <img
          src={capturedImage}
          alt="Captured handwritten digit"
          className="camera-captured-image"
        />
      ) : cameraStarted ? (
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
      ) : (
        <div className="camera-placeholder">
          <CameraOff size={42} />
          <strong>Camera preview</strong>
          <span>Open your camera to begin.</span>
        </div>
      )}
    </div>

    {cameraError && (
      <div className="recognition-message">
        <CircleHelp size={16} />
        {cameraError}
      </div>
    )}

    {message && (
      <div className="recognition-message">
        <CircleHelp size={16} />
        {message}
      </div>
    )}

    <div className="camera-controls">
      {!cameraStarted ? (
        <button
          type="button"
          className="predict-button"
          onClick={startCamera}
        >
          <Camera size={18} />
          Open Camera
        </button>
      ) : capturedImage ? (
        <>
          <button
            type="button"
            className="predict-button"
            onClick={handleCameraPrediction}
            disabled={predicting}
          >
            {predicting ? (
              <>
                <span className="loading-spinner" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Predict Digit
              </>
            )}
          </button>

          <button
            type="button"
            className="canvas-action"
            onClick={() => {
              setCapturedImage(null);
              setCameraError("");
              setMessage("");
              setResult(null);
              setProcessedPixels(null);
            }}
            disabled={predicting}
          >
            Retake
          </button>

          <button
            type="button"
            className="canvas-action clear-action"
            onClick={stopCamera}
            disabled={predicting}
          >
            Close Camera
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="predict-button"
            onClick={capturePhoto}
          >
            <Camera size={18} />
            Capture Photo
          </button>

          <button
            type="button"
            className="canvas-action clear-action"
            onClick={stopCamera}
          >
            Close Camera
          </button>
        </>
      )}
    </div>

    <p className="camera-instruction">
      Place one handwritten digit clearly in front of the camera.
    </p>

    {result && (
      <div className="result-card">
        <div className="result-heading">
          <div>
            <h3>Prediction result</h3>
            <p>Your camera image classification output</p>
          </div>
          <span className="result-demo-tag">REAL KNN</span>
        </div>

        <div className="result-content">
          <div className="result-digit">
            <span>Predicted digit</span>
            <strong>{result.digit}</strong>
            <small>Actual KNN prediction</small>
          </div>
        </div>
<div className="processed-preview-card">
  <div className="processed-preview-heading">
    <h3>KNN input image</h3>
    <span>28 × 28 PIXELS</span>
  </div>

  <div className="processed-preview-stage">
    <ProcessedImagePreview pixels={processedPixels} />
  </div>

  <p className="processed-preview-caption">
    This is the image actually supplied to the KNN classifier.
  </p>
</div>

      </div>
    )}
  </section>
) : (

        /* Existing Sketching mode */
        <div className="recognition-layout">
          <section className="recognition-main">
            <div className="k-selector-card">
              <div className="k-selector-heading">
                <div>
                  <h3>Choose K value</h3>
                  <p>
                    Select how many nearest neighbors the model should compare.
                  </p>
                </div>

                <span className="k-selected-badge">
                  K = {kValue}
                </span>
              </div>

              <div className="k-selector-options">
                {[1, 3, 5, 7, 9].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`k-option ${
                      kValue === value ? "active" : ""
                    }`}
                    onClick={() => {
                      setKValue(value);
                      setResult(null);
                    }}
                    disabled={predicting}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <p className="k-selector-hint">
                {kValue === 1
                  ? "Uses only the single closest training example."
                  : `Uses the ${kValue} closest training examples and majority voting.`}
              </p>
            </div>

            <div className="drawing-preview-layout">
              <DrawingCanvas
                ref={canvasRef}
              />
<button
  type="button"
  className="expression-test-button"
  onClick={handleExpressionSegmentation}
>
  <Sparkles size={16} />
  Test Expression Segmentation
</button>
{expressionPreviews.length > 0 && (
  <div className="expression-previews">
    <h3>Extracted Symbols</h3>

    <div className="expression-preview-list">
      {expressionPreviews.map((symbol, index) => (
        <div key={index} className="expression-preview-item">
          <img
            src={symbol.preview}
            alt={`Extracted symbol ${index + 1}`}
            width="84"
            height="84"
          />
          <p>Symbol {index + 1}</p>
        </div>
      ))}
    </div>
  </div>
)}

{expressionResult && (
  <div className="expression-result-card">
    <p className="expression-result-label">
      Recognized Expression
    </p>

    <h2>{expressionResult.expression}</h2>

    <div className="expression-answer">
      <span>Answer</span>
      <strong>{expressionResult.answer}</strong>
    </div>
  </div>
)}

              <div className="processed-preview-card">
                <div className="processed-preview-heading">
                  <h3>Preprocessed image</h3>
                  <span>28 × 28 PIXELS</span>
                </div>

                {processedPixels ? (
                  <>
                    <div className="processed-preview-stage">
                      <ProcessedImagePreview pixels={processedPixels} />
                    </div>

                    <p className="processed-preview-caption">
                      Centered grayscale image used by the KNN classifier.
                    </p>
                  </>
                ) : (
                  <div className="processed-preview-empty">
                    <Fingerprint size={25} />
                    <strong>Preview unavailable</strong>
                    <span>
                      Draw a digit and click Predict Digit.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className="recognition-message">
                <CircleHelp size={16} />
                {message}
              </div>
            )}

            <button
              className="predict-button"
              onClick={handlePrediction}
              disabled={predicting}
            >
              {predicting ? (
                <>
                  <span className="loading-spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Predict Digit
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="result-card">
              <div className="result-heading">
                <div>
                  <h3>Prediction result</h3>
                  <p>Your KNN classification output</p>
                </div>

                <span className="result-demo-tag">REAL KNN</span>
              </div>

              {predicting ? (
                <div className="result-empty">
                  <div className="loading-spinner large-spinner" />

                  <strong>Analyzing your handwriting</strong>

                  <span>
                    Comparing your drawing with MNIST training examples.
                  </span>
                </div>
              ) : result ? (
                <>
                  <div className="result-content">
                    <div className="result-digit">
                      <span>Predicted digit</span>
                      <strong>{result.digit}</strong>
                      <small>Actual KNN prediction</small>
                    </div>

                    <div className="result-votes">
                      <div className="vote-title">
                        <strong>Nearest-neighbor votes</strong>
                        <span>{result.k} neighbors</span>
                      </div>

                      {sortedVotes.map((vote) => (
                        <div className="vote-row" key={vote.digit}>
                          <span className="vote-digit">
                            {vote.digit}
                          </span>

                          <div className="vote-track">
                            <div
                              className={`vote-fill ${
                                vote.digit === result.digit
                                  ? "winner"
                                  : ""
                              }`}
                              style={{
                                width: `${vote.percentage}%`,
                              }}
                            />
                          </div>

                          <span className="vote-value">
                            {Math.round(vote.percentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="neighbor-gallery">
                    <div className="neighbor-gallery-heading">
                      <strong>
                        Actual {result.k} nearest MNIST neighbours
                      </strong>

                      <span>Closest training examples</span>
                    </div>

                    <div className="neighbor-grid">
                      {result.neighbors.map((neighbor, index) => (
                        <div
                          className="neighbor-item"
                          key={`${neighbor.index}-${index}`}
                        >
                          <NeighborThumbnail pixels={neighbor.image} />

                          <strong>
                            Digit {neighbor.label}
                          </strong>

                          <span>
                            #{index + 1} neighbour
                          </span>

                          <small>
                            Distance:{" "}
                            {Math.sqrt(neighbor.distance).toFixed(2)}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="result-empty">
                  <div className="result-empty-icon">
                    <Fingerprint size={25} />
                  </div>

                  <strong>No prediction yet</strong>

                  <span>
                    Draw a digit and select Predict Digit to classify it
                    using KNN.
                  </span>
                </div>
              )}
            </div>
          </section>

          <aside className="recognition-sidebar">
            <div className="guide-card">
              <div className="guide-icon">
                <WandSparkles size={19} />
              </div>

              <h3>How to use the studio</h3>

              <div className="guide-steps">
                <div className="guide-step">
                  <span>01</span>

                  <div>
                    <strong>Draw a digit</strong>
                    <p>
                      Write one number from 0 to 9 on the canvas.
                    </p>
                  </div>
                </div>

                <div className="guide-step">
                  <span>02</span>

                  <div>
                    <strong>Run prediction</strong>
                    <p>
                      KNN compares your drawing with 5,000 training images.
                    </p>
                  </div>
                </div>

                <div className="guide-step">
                  <span>03</span>

                  <div>
                    <strong>Explore the output</strong>
                    <p>
                      Review the predicted digit and actual neighbor
                      voting results.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="knn-info-card">
              <div className="knn-info-top">
                <Brain size={18} />
                <span>THE ALGORITHM</span>
              </div>

              <h3>K-Nearest Neighbors</h3>

              <p>
                KNN classifies your handwriting by comparing its pixel
                values with labelled MNIST examples and selecting the
                majority class among the nearest neighbors.
              </p>

              <div className="knn-facts">
                <div>
                  <span>Learning type</span>
                  <strong>Supervised</strong>
                </div>

                <div>
                  <span>Training examples</span>
                  <strong>5,000</strong>
                </div>

                <div>
                  <span>K value</span>
                  <strong>{kValue}</strong>
                </div>

                <div>
                  <span>Classification</span>
                  <strong>Majority voting</strong>
                </div>
              </div>
            </div>

            <div className="canvas-tip">
              <div className="tip-icon">
                <Activity size={16} />
              </div>

              <div>
                <strong>Drawing tip</strong>

                <p>
                  Use a single bold digit, keep it near the center,
                  and avoid drawing multiple numbers together.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="disclaimer recognition-disclaimer">
        <CheckCircle2 size={15} />

        Predictions are generated locally using the KNN algorithm
        and MNIST training data. Results may vary depending on
        handwriting and preprocessing.
      </div>
    </div>
  );
}
