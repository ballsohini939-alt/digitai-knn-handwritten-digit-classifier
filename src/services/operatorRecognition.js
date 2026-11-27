
export function recognizeOperator(canvas, symbol) {
  if (!canvas || !symbol) {
    throw new Error("Canvas or operator symbol not found.");
  }

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  const imageData = context.getImageData(
    symbol.x,
    symbol.y,
    symbol.width,
    symbol.height
  );

  const { data, width, height } = imageData;

  const pixels = Array.from({ length: height }, () =>
    new Array(width).fill(false)
  );

  const rowCounts = new Array(height).fill(0);
  const columnCounts = new Array(width).fill(0);

  // Detect foreground pixels.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 20) {
        pixels[y][x] = true;
        rowCounts[y]++;
        columnCounts[x]++;
      }
    }
  }

  const maxRowCount = Math.max(...rowCounts);
  const maxColumnCount = Math.max(...columnCounts);

  const horizontalCoverage = maxRowCount / width;
  const verticalCoverage = maxColumnCount / height;
const aspectRatio = width / Math.max(height, 1);
  // Count connected foreground components.
  const visited = Array.from({ length: height }, () =>
    new Array(width).fill(false)
  );

  let componentCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!pixels[y][x] || visited[y][x]) continue;

      componentCount++;

      const queue = [[x, y]];
      visited[y][x] = true;

      while (queue.length > 0) {
        const [currentX, currentY] = queue.shift();

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nextX = currentX + dx;
            const nextY = currentY + dy;

            if (
              nextX >= 0 &&
              nextX < width &&
              nextY >= 0 &&
              nextY < height &&
              pixels[nextY][nextX] &&
              !visited[nextY][nextX]
            ) {
              visited[nextY][nextX] = true;
              queue.push([nextX, nextY]);
            }
          }
        }
      }
    }
  }

 // Measure actual pixel occupancy along both diagonal lines.
function calculateDiagonalCoverage(reverse = false) {
  const samples = Math.min(width, height);
  let hits = 0;

  for (let i = 0; i < samples; i++) {
    const progress = i / Math.max(samples - 1, 1);

    const centerX = Math.round(progress * (width - 1));

    const centerY = Math.round(
      (reverse ? 1 - progress : progress) * (height - 1)
    );

    let foundPixel = false;

    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (
          x >= 0 &&
          x < width &&
          y >= 0 &&
          y < height &&
          pixels[y][x]
        ) {
          foundPixel = true;
          break;
        }
      }

      if (foundPixel) break;
    }

    if (foundPixel) hits++;
  }

  return hits / samples;
}

const diagonalCoverage1 = calculateDiagonalCoverage(false);
const diagonalCoverage2 = calculateDiagonalCoverage(true);

  console.log("OPERATOR SHAPE ANALYSIS:", {
    horizontalCoverage: horizontalCoverage.toFixed(2),
    verticalCoverage: verticalCoverage.toFixed(2),
    diagonalCoverage1: diagonalCoverage1.toFixed(2),
    diagonalCoverage2: diagonalCoverage2.toFixed(2),
    componentCount,
    aspectRatio: aspectRatio.toFixed(2),
  });

 // Division: horizontal bar with two separate dots.
// Check this before addition because both contain a horizontal stroke.
const hasDivisionShape =
  componentCount >= 3 &&
  horizontalCoverage >= 0.45;

if (hasDivisionShape) {
  return "/";
}

// Subtraction: long, thin horizontal stroke.
if (
  aspectRatio >= 3.0 &&
  horizontalCoverage >= 0.70 &&
  componentCount === 1
) {
  return "-";
}

// Multiplication: two diagonal stroke directions.
if (
  diagonalCoverage1 >= 0.45 &&
  diagonalCoverage2 >= 0.45
) {
  return "*";
}

// Addition: horizontal and vertical strokes crossing.
if (
  horizontalCoverage >= 0.55 &&
  verticalCoverage >= 0.55
) {
  return "+";
}

// Subtraction: predominantly horizontal stroke.
if (
  horizontalCoverage >= 0.55 &&
  verticalCoverage < 0.45
) {
  return "-";
}

return null;
}
