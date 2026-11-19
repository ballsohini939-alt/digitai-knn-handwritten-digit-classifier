import { Fragment, useState } from "react";

import {
  Activity,
  BarChart3,
  Brain,
  ChartColumnIncreasing,
  Info,
  Target,
  TrendingUp,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { loadMNIST } from "../services/mnistLoader";
import { loadMNISTTest } from "../services/mnistTestLoader";
import { evaluateKNN } from "../services/evaluateKNN";

const digitColors = [
  "#a78bfa",
  "#7c9cff",
  "#65c6c0",
  "#e6a66b",
  "#e88cb7",
  "#8d79dc",
  "#65a9d9",
  "#c08ce8",
  "#7ebd91",
  "#d49b74",
];

function AnalyticsStat({ icon: Icon, label, value, note, color }) {
  return (
    <article className="analytics-stat">
      <div className={`analytics-stat-icon ${color}`}>
        <Icon size={19} />
      </div>
      <div className="analytics-stat-label">{label}</div>
      <div className="analytics-stat-value">{value}</div>
      <div className="analytics-stat-note">{note}</div>
    </article>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-chart-tooltip">
      <strong>Digit {label}</strong>
      <span>{Number(payload[0].value).toFixed(2)}% recall</span>
    </div>
  );
}

export default function Analytics() {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progress, setProgress] = useState({
    processed: 0,
    total: 10000,
    percentage: 0,
  });
const [results, setResults] = useState(() => {
  try {
    const savedResults = localStorage.getItem("digitai-knn-evaluation");
    return savedResults ? JSON.parse(savedResults) : null;
  } catch {
    return null;
  }
});
  const [error, setError] = useState("");

  async function handleEvaluation() {
    if (isEvaluating) return;

    setIsEvaluating(true);
    setError("");
    setProgress({
      processed: 0,
      total: 10000,
      percentage: 0,
    });

    try {
      const [trainingDataset, testDataset] = await Promise.all([
        loadMNIST(),
        loadMNISTTest(),
      ]);

      const evaluationResults = await evaluateKNN(
        trainingDataset,
        testDataset,
        10000,
        5,
        (currentProgress) => {
          setProgress(currentProgress);
        }
      );

localStorage.setItem(
  "digitai-knn-evaluation",
  JSON.stringify(evaluationResults)
);

setResults(evaluationResults);
    } catch (evaluationError) {
      console.error("KNN evaluation failed:", evaluationError);
      setError(
        evaluationError.message ||
          "Something went wrong while evaluating the model."
      );
    } finally {
      setIsEvaluating(false);
    }
  }

  const digitData = results
    ? results.metrics.map((item) => ({
        name: String(item.digit),
        value: item.support,
        percentage: (item.support / results.total) * 100,
      }))
    : [];

  const recallData = results
    ? results.metrics.map((item) => ({
        digit: String(item.digit),
        recall: Number(item.recall.toFixed(2)),
      }))
    : [];

  const confusionMatrix =
    results?.confusionMatrix ||
    Array.from({ length: 10 }, () => Array(10).fill(0));

  return (
    <div className="page-content analytics-page">
      <section className="analytics-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> MODEL INSIGHTS
          </div>

          <h1>
            Model <span>Analytics</span>
          </h1>

          <p>
            Evaluate your KNN handwritten digit classifier using unseen
            MNIST test images and real performance metrics.
          </p>
        </div>

        <span className="analytics-demo-badge">
          <span />
          {results ? "EVALUATION COMPLETE" : "REAL MODEL EVALUATION"}
        </span>
      </section>

      <section className="analytics-notice">
        <Info size={17} />

        <div>
          <strong>Independent MNIST test evaluation</strong>
          <p>
            The classifier is tested against images from the separate
            MNIST test dataset. These images are not part of the selected
            training examples.
          </p>
        </div>
      </section>

      <section className="analytics-panel" style={{ marginBottom: 22 }}>
        <div className="analytics-panel-heading">
          <div className="analytics-panel-title">
            <div className="analytics-panel-icon">
              <Brain size={17} />
            </div>

            <div>
              <h3>Run model evaluation</h3>
              <p>
Compare all 10,000 test images against 5,000 training examples using K = 5.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEvaluation}
          disabled={isEvaluating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            padding: "12px 20px",
            marginTop: 12,
            border: "1px solid #9b7be8",
            borderRadius: 10,
            background: isEvaluating
              ? "#55456f"
              : "linear-gradient(135deg, #8966d8, #6548a8)",
            color: "#ffffff",
            fontWeight: 600,
            cursor: isEvaluating ? "not-allowed" : "pointer",
            opacity: isEvaluating ? 0.75 : 1,
          }}
        >
          {isEvaluating ? (
            <Activity size={17} />
          ) : (
            <Play size={17} />
          )}

          {isEvaluating ? "Evaluating model..." : "Run KNN Evaluation"}
        </button>

        {isEvaluating && (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 8,
                color: "#bcb4ce",
                fontSize: 12,
              }}
            >
              <span>
                Evaluated {progress.processed} of {progress.total} images
              </span>

              <strong>{progress.percentage}%</strong>
            </div>

            <div
              style={{
                width: "100%",
                height: 8,
                overflow: "hidden",
                borderRadius: 20,
                background: "#302a40",
              }}
            >
              <div
                style={{
                  width: `${progress.percentage}%`,
                  height: "100%",
                  borderRadius: 20,
                  background: "linear-gradient(90deg, #8c6bd8, #c09bff)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>

            <p style={{ color: "#9990aa", fontSize: 12, marginTop: 9 }}>
              Please keep this page open while the evaluation runs.
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              marginTop: 16,
              color: "#ff9caa",
              fontSize: 13,
            }}
          >
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {results && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginTop: 16,
              color: "#8fddb5",
              fontSize: 13,
            }}
          >
            <CheckCircle2 size={17} />
            Evaluation completed successfully using {results.total} test images.
          </div>
        )}
      </section>

      <section className="analytics-stats-grid">
        <AnalyticsStat
          icon={Target}
          label="Test accuracy"
          value={results ? `${results.accuracy.toFixed(2)}%` : "—"}
          note={
            results
              ? `${results.correct} correct out of ${results.total}`
              : "Run evaluation to measure"
          }
          color="purple"
        />

        <AnalyticsStat
          icon={Brain}
          label="Algorithm"
          value="KNN"
          note="Supervised learning"
          color="blue"
        />

        <AnalyticsStat
          icon={Activity}
          label="Training examples"
          value="5,000"
          note="Selected from MNIST training data"
          color="pink"
        />

        <AnalyticsStat
          icon={TrendingUp}
          label="Selected K"
          value="5"
          note="Majority voting"
          color="orange"
        />
      </section>

      <section className="analytics-chart-grid">
        <article className="analytics-panel accuracy-panel">
          <div className="analytics-panel-heading">
            <div className="analytics-panel-title">
              <div className="analytics-panel-icon">
                <ChartColumnIncreasing size={17} />
              </div>

              <div>
                <h3>Recall by digit</h3>
                <p>Percentage of each digit correctly identified</p>
              </div>
            </div>

            <span className="chart-unit">PERCENTAGE</span>
          </div>

          <div className="accuracy-chart">
            {results ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recallData}
                  margin={{ top: 15, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#ffffff12"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="digit"
                    tick={{ fill: "#9690a6", fontSize: 10 }}
                    axisLine={{ stroke: "#ffffff15" }}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#858095", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "#ffffff08" }}
                  />

                  <Bar
                    dataKey="recall"
                    name="Recall"
                    radius={[6, 6, 0, 0]}
                    barSize={35}
                  >
                    {recallData.map((entry, index) => (
                      <Cell
                        key={entry.digit}
                        fill={digitColors[index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  color: "#9990aa",
                  fontSize: 13,
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Run the evaluation to see measured recall for each digit.
              </div>
            )}
          </div>

          <div className="chart-caption">
            <span className="caption-dot" />
            <span>
              {results
                ? "Measured recall from the MNIST test evaluation"
                : "No evaluation results yet"}
            </span>
          </div>
        </article>

        <article className="analytics-panel distribution-panel">
          <div className="analytics-panel-heading">
            <div className="analytics-panel-title">
              <div className="analytics-panel-icon blue-icon">
                <BarChart3 size={17} />
              </div>

              <div>
                <h3>Test digit distribution</h3>
                <p>Number of evaluated examples for each digit</p>
              </div>
            </div>
          </div>

          <div className="distribution-content">
            <div className="pie-wrap">
              {results && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={digitData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={49}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {digitData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={digitColors[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [
                        `${value} images`,
                        `Digit ${name}`,
                      ]}
                      contentStyle={{
                        background: "#1b1928",
                        border: "1px solid #39334d",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              <div className="pie-center">
                <strong>{results ? results.total : "10"}</strong>
                <span>{results ? "TEST IMAGES" : "DIGITS"}</span>
              </div>
            </div>

            <div className="digit-legend">
              {results ? (
                digitData.map((item, index) => (
                  <div className="legend-item" key={item.name}>
                    <span
                      className="legend-color"
                      style={{ background: digitColors[index] }}
                    />

                    <span>Digit {item.name}</span>

                    <strong>{item.value}</strong>
                  </div>
                ))
              ) : (
                <p style={{ color: "#9990aa", fontSize: 12 }}>
                  Digit counts will appear after evaluation.
                </p>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="analytics-panel confusion-panel">
        <div className="analytics-panel-heading">
          <div className="analytics-panel-title">
            <div className="analytics-panel-icon pink-icon">
              <Target size={17} />
            </div>

            <div>
              <h3>Confusion matrix</h3>
              <p>
                Actual digits compared with the model's predicted digits
              </p>
            </div>
          </div>

          <span className="chart-unit">
            {results ? "MEASURED COUNTS" : "AWAITING EVALUATION"}
          </span>
        </div>

        <div className="matrix-wrapper">
          <div className="matrix-y-label">ACTUAL DIGIT</div>

          <div className="matrix-content">
            <div className="matrix-column-label">PREDICTED DIGIT</div>

            <div className="confusion-matrix">
              <div className="matrix-cell matrix-header" />

              {Array.from({ length: 10 }, (_, i) => (
                <div className="matrix-cell matrix-header" key={`head-${i}`}>
                  {i}
                </div>
              ))}

              {confusionMatrix.map((row, rowIndex) => (
                <Fragment key={`row-${rowIndex}`}>
                  <div className="matrix-cell matrix-row-label">
                    {rowIndex}
                  </div>

                  {row.map((value, colIndex) => (
                    <div
                      className={`matrix-cell matrix-value ${
                        rowIndex === colIndex ? "diagonal" : ""
                      }`}
                      key={`${rowIndex}-${colIndex}`}
                      title={`Actual ${rowIndex}, predicted ${colIndex}: ${value}`}
                      style={{
                        background:
                          rowIndex === colIndex
                            ? `rgba(154, 119, 235, ${
                                value === 0 ? 0.05 : 0.12 + value / 140
                              })`
                            : `rgba(116, 96, 155, ${value / 180})`,
                      }}
                    >
                      {results ? value : "—"}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="matrix-legend">
          <span>
            <i className="matrix-correct" /> Diagonal: correct classifications
          </span>

          <span>
            <i className="matrix-other" /> Off-diagonal: incorrect classifications
          </span>
        </div>
      </section>

      <section className="analytics-bottom-grid">
        <article className="analytics-panel configuration-panel">
          <div className="analytics-panel-heading">
            <div className="analytics-panel-title">
              <div className="analytics-panel-icon">
                <Brain size={17} />
              </div>

              <div>
                <h3>Classification metrics</h3>
                <p>Precision, recall and F1-score for each digit</p>
              </div>
            </div>
          </div>

          {results ? (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ color: "#a99fba" }}>
                    <th style={{ padding: "10px 6px" }}>Digit</th>
                    <th style={{ padding: "10px 6px" }}>Precision</th>
                    <th style={{ padding: "10px 6px" }}>Recall</th>
                    <th style={{ padding: "10px 6px" }}>F1-score</th>
                    <th style={{ padding: "10px 6px" }}>Support</th>
                  </tr>
                </thead>

                <tbody>
                  {results.metrics.map((item) => (
                    <tr
                      key={item.digit}
                      style={{
                        borderTop: "1px solid #ffffff12",
                        color: "#e4deee",
                      }}
                    >
                      <td style={{ padding: "10px 6px" }}>{item.digit}</td>
                      <td style={{ padding: "10px 6px" }}>
                        {item.precision.toFixed(2)}%
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {item.recall.toFixed(2)}%
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {item.f1.toFixed(2)}%
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {item.support}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#9990aa", fontSize: 13 }}>
              Run the evaluation to calculate classification metrics.
            </p>
          )}
        </article>

        <article className="analytics-panel insight-panel">
          <div className="insight-icon">
            <TrendingUp size={19} />
          </div>

          <span className="insight-label">MODEL CONFIGURATION</span>

          <h3>Your KNN settings</h3>

          <p>
            The model compares pixel values using Euclidean distance.
            The five nearest training examples vote to determine the
            predicted digit.
          </p>

          <div className="configuration-list">
            <div>
              <span>Algorithm</span>
              <strong>K-Nearest Neighbors</strong>
            </div>

            <div>
              <span>Number of neighbors</span>
              <strong>K = 5</strong>
            </div>

            <div>
              <span>Distance metric</span>
              <strong>Euclidean distance</strong>
            </div>

            <div>
              <span>Voting method</span>
              <strong>Majority voting</strong>
            </div>

            <div>
              <span>Input dimensions</span>
              <strong>784 (28 × 28)</strong>
            </div>
          </div>
        </article>
      </section>

      <div className="disclaimer analytics-disclaimer">
        <Info size={15} />

        {results
          ? `These metrics were calculated from ${results.total} separate MNIST test images using ${results.k}-nearest neighbors and ${"5,000"} training examples.`
          : "No performance values are displayed as measured until you run the evaluation. The page will calculate them from the MNIST datasets."}
      </div>
    </div>
  );
}