
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

  const rowCounts = new Array(height).fill(0);
  const columnCounts = new Array(width).fill(0);

  // Count foreground pixels in every row and column.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 20) {
        rowCounts[y]++;
        columnCounts[x]++;
      }
    }
  }

  const maxRowCount = Math.max(...rowCounts);
  const maxColumnCount = Math.max(...columnCounts);

  const horizontalCoverage = maxRowCount / width;
  const verticalCoverage = maxColumnCount / height;

  console.log("OPERATOR SHAPE ANALYSIS:", {
    horizontalCoverage: horizontalCoverage.toFixed(2),
    verticalCoverage: verticalCoverage.toFixed(2),
  });

  // A plus sign has a strong horizontal and vertical stroke.
  if (
    horizontalCoverage >= 0.55 &&
    verticalCoverage >= 0.55
  ) {
    return "+";
  }

  return null;
}
