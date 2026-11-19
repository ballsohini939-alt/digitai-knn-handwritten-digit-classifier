import { useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleHelp,
  Fingerprint,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import DrawingCanvas from "../components/DrawingCanvas";
import { loadMNIST } from "../services/mnistLoader";
import { predictDigit } from "../services/knnPredict";
import { preprocessCanvas } from "../services/preprocessCanvas";
import { savePrediction } from "../services/history";

export default function Recognition() {
  const canvasRef = useRef(null);
  const datasetRef = useRef(null);

  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [message, setMessage] = useState("");

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
      // Load the real MNIST dataset once
      if (!datasetRef.current) {
        setMessage("Loading 5,000 MNIST training images...");
        datasetRef.current = await loadMNIST();
      }

      setMessage("Comparing your drawing with the nearest examples...");

      // Get the actual drawing canvas
      const canvas = canvasRef.current.getCanvas();

      // Convert drawing into 28 x 28 grayscale pixels
      const inputPixels = preprocessCanvas(canvas);

      // Run real KNN classification
      const prediction = predictDigit(
        inputPixels,
        datasetRef.current,
        5
      );
      console.log(
  "KNN nearest neighbors:",
  prediction.neighbors.map((neighbor, index) => ({
    rank: index + 1,
    digit: neighbor.label,
    distance: Math.round(neighbor.distance),
  }))
);

      

      const resultData = {
        digit: prediction.predictedDigit,
        votes: prediction.votes,
        mode: "knn",
        k: prediction.k,
      };

      // Save the actual prediction in History
      const record = {
        id: Date.now(),
        digit: resultData.digit,
        votes: resultData.votes,
        mode: "knn",
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
  }

  function handleUndo() {
    canvasRef.current?.undo();
    setResult(null);
    setMessage("");
  }

  const sortedVotes = result
    ? result.votes
        .filter((vote) => vote.count > 0)
        .sort((a, b) => b.count - a.count)
    : [];

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
            Draw a handwritten digit and let the real KNN classifier
            recognize it.
          </p>
        </div>

        <div className="studio-mode">
          <span /> KNN MODEL ACTIVE
        </div>
      </section>

      <div className="recognition-layout">
        <section className="recognition-main">
          <DrawingCanvas ref={canvasRef} />

          {message && (
            <div className="recognition-message">
              <CircleHelp size={16} /> {message}
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
                            vote.digit === result.digit ? "winner" : ""
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
                  <p>Write one number from 0 to 9 on the canvas.</p>
                </div>
              </div>

              <div className="guide-step">
                <span>02</span>
                <div>
                  <strong>Run prediction</strong>
                  <p>
                    KNN compares your drawing with 5,000 training
                    images.
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
                <strong>5</strong>
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

      <div className="disclaimer recognition-disclaimer">
        <CheckCircle2 size={15} />
        Predictions are generated locally using the KNN algorithm
        and MNIST training data. Results may vary depending on
        handwriting and preprocessing.
      </div>
    </div>
  );
}
