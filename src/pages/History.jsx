
import { useEffect, useRef, useState } from "react";import {
  History as HistoryIcon,
  Trash2,
  Clock3,
  Hash,
  Sparkles,
  Database,
  SearchX,
  AlertTriangle,
} from "lucide-react";

import {
  getPredictionHistory,
  deletePrediction,
  clearPredictionHistory,
} from "../services/history";

function HistoryThumbnail({ pixels }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

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

  if (!pixels || pixels.length !== 784) {
    return <div className="history-thumbnail-placeholder">—</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      className="history-thumbnail-canvas"
    />
  );
}

export default function History() {
  const [records, setRecords] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setRecords(getPredictionHistory());
  }, []);

  function handleDelete(id) {
    const updated = deletePrediction(id);
    setRecords(updated);
  }

  function handleClearAll() {
    clearPredictionHistory();
    setRecords([]);
    setShowConfirm(false);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="page-content history-page">
      <section className="history-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> PREDICTION RECORDS
          </div>
          <h1>Prediction <span>History</span></h1>
<p>Review and manage your saved handwritten digit predictions.</p>
        </div>

        {records.length > 0 && (
          <button
            className="history-clear-button"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={15} />
            Clear All
          </button>
        )}
      </section>

      <section className="history-stats">
        <article className="history-stat-card">
          <div className="history-stat-icon"><Database size={18} /></div>
          <div>
            <span>Total predictions</span>
            <strong>{records.length}</strong>
          </div>
        </article>

        <article className="history-stat-card">
          <div className="history-stat-icon"><Sparkles size={18} /></div>
          <div>
            <span>Prediction mode</span>
<strong>
  {records.length === 0
    ? "—"
    : records.every((item) => item.mode === "knn")
      ? "Real KNN"
      : records.some((item) => item.mode === "knn")
        ? "Mixed"
        : "Demo"}
</strong>          </div>
        </article>

        <article className="history-stat-card">
          <div className="history-stat-icon"><Hash size={18} /></div>
          <div>
            <span>Unique digits</span>
            <strong>{new Set(records.map((item) => item.digit)).size}</strong>
          </div>
        </article>
      </section>

      <section className="history-list-panel">
        <div className="history-list-heading">
          <div>
            <h3>Recent predictions</h3>
<p>Your saved recognition activity</p>
          </div>
          <span className="history-count">{records.length} RECORDS</span>
        </div>

        {records.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">
              <SearchX size={27} />
            </div>
            <h3>No prediction history yet</h3>
            <p>
              Your predictions will appear here after you draw a digit
and run a KNN prediction in Recognition Studio.
            </p>
            <a href="/recognition" className="history-start-link">
              Open Recognition Studio <span>→</span>
            </a>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Prediction</th>
                  <th>Predicted digit</th>
                  <th>Date and time</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id}>
                    <td>
  <div className="history-prediction-cell">
    <HistoryThumbnail pixels={record.image} />

    <span className="history-index">
      #{String(records.length - index).padStart(3, "0")}
    </span>
  </div>
</td>

                    <td>
                      <span className="history-digit">
                        {record.digit}
                      </span>
                    </td>

                    <td>
                      <span className="history-date">
                        <Clock3 size={13} />
                        {formatDate(record.createdAt)}
                      </span>
                    </td>

                    <td>
  <span
    className={`history-mode ${
      record.mode === "knn" ? "knn-mode" : "demo-mode"
    }`}
  >
    <span />
    {record.mode === "knn" ? "REAL KNN" : "DEMO"}
  </span>
</td>

                    <td>
                      <button
                        className="history-delete-button"
                        onClick={() => handleDelete(record.id)}
                        title="Delete this prediction"
                        aria-label={`Delete prediction ${record.id}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="history-disclaimer">
  <AlertTriangle size={15} />
  New records store the processed 28×28 image and KNN prediction details
  in this browser. Older records may not include image thumbnails.
</div>

      {showConfirm && (
        <div className="history-modal-overlay">
          <div className="history-confirm-modal">
            <div className="history-modal-icon"><Trash2 size={21} /></div>
            <h3>Clear prediction history?</h3>
            <p>
              This will permanently delete all {records.length} saved
prediction records from this browser.
            </p>

            <div className="history-modal-actions">
              <button
                className="history-cancel-button"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="history-confirm-button"
                onClick={handleClearAll}
              >
                Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
