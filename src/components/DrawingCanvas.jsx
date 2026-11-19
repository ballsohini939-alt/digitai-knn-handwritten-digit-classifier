
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Eraser, RotateCcw } from "lucide-react";

const DrawingCanvas = forwardRef(function DrawingCanvas(_, ref) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [hasDrawing, setHasDrawing] = useState(false);

  function getContext() {
    return canvasRef.current?.getContext("2d");
  }

  function updateDrawingStatus() {
    const ctx = getContext();
    if (!ctx) return;

    const pixels = ctx.getImageData(
      0, 0, canvasRef.current.width, canvasRef.current.height
    ).data;

    let found = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) {
        found = true;
        break;
      }
    }
    setHasDrawing(found);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    setHasDrawing(false);
  }

  function undoStroke() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx || historyRef.current.length === 0) return;

    const previous = historyRef.current.pop();
    ctx.putImageData(previous, 0, 0);
    updateDrawingStatus();
  }

  useImperativeHandle(ref, () => ({
  clear: clearCanvas,
  undo: undoStroke,
  hasDrawing: () => hasDrawing,
  getImage: () => canvasRef.current?.toDataURL("image/png"),
  getCanvas: () => canvasRef.current,
}));

  function getCanvasPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);

    if (historyRef.current.length >= 20) {
      historyRef.current.shift();
    }

    historyRef.current.push(
      ctx.getImageData(0, 0, canvas.width, canvas.height)
    );

    drawingRef.current = true;
    lastPointRef.current = getCanvasPoint(event);

    ctx.beginPath();
    ctx.arc(
      lastPointRef.current.x,
      lastPointRef.current.y,
      9,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    setHasDrawing(true);
  }

  function draw(event) {
    if (!drawingRef.current) return;

    event.preventDefault();
    const ctx = getContext();
    if (!ctx) return;

    const point = getCanvasPoint(event);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPointRef.current = point;
  }

  function stopDrawing() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  return (
    <div className="drawing-card">
      <div className="drawing-card-header">
        <div>
          <h3>Drawing canvas</h3>
          <p>Write a single digit between 0 and 9</p>
        </div>
        <span className="canvas-size">280 × 280 PX</span>
      </div>

      <div className="canvas-stage">
        <div className="canvas-grid">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onLostPointerCapture={stopDrawing}
            aria-label="Drawing canvas for a handwritten digit"
          />
          {!hasDrawing && (
            <div className="canvas-placeholder">
              <span className="placeholder-digit">8</span>
              <span>Draw your digit here</span>
            </div>
          )}
        </div>
      </div>

      <div className="canvas-controls">
        <span className={`canvas-status ${hasDrawing ? "is-drawn" : ""}`}>
          <span />
          {hasDrawing ? "Digit detected on canvas" : "Canvas is empty"}
        </span>
        <div className="canvas-actions">
          <button className="canvas-action" onClick={undoStroke} disabled={!hasDrawing}>
            <RotateCcw size={14} /> Undo
          </button>
          <button className="canvas-action clear-action" onClick={clearCanvas} disabled={!hasDrawing}>
            <Eraser size={14} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
});

export default DrawingCanvas;
