
export function extractSymbols(canvas) {
  if (!canvas) {
    throw new Error("Drawing canvas not found.");
  }

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const visited = new Uint8Array(width * height);
  const components = [];

  // Find connected white-pixel regions.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      const alpha = data[start * 4 + 3];

      if (alpha <= 20 || visited[start]) continue;

      const queue = [start];
      visited[start] = 1;

      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let area = 0;

      for (let head = 0; head < queue.length; head++) {
        const current = queue[head];
        const currentX = current % width;
        const currentY = Math.floor(current / width);

        area++;

        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);

        // Check all eight neighbouring pixels.
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = currentX + dx;
            const ny = currentY + dy;

            if (
              nx < 0 ||
              ny < 0 ||
              nx >= width ||
              ny >= height
            ) {
              continue;
            }

            const next = ny * width + nx;

            if (
              !visited[next] &&
              data[next * 4 + 3] > 20
            ) {
              visited[next] = 1;
              queue.push(next);
            }
          }
        }
      }

      // Ignore tiny accidental marks.
      if (area >= 8) {
        components.push({
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
          area,
        });
      }
    }
  }

  // Read symbols from left to right.
  components.sort((a, b) => a.x - b.x);

  return components;
}
