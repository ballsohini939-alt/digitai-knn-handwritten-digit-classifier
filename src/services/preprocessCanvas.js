export function preprocessCanvas(canvas) {
  if (!canvas) {
    throw new Error("Drawing canvas not found.");
  }

  const sourceContext = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  const source = sourceContext.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const { data, width, height } = source;

  // Find the bounding box of the drawing
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;

      if (data[index + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error("Please draw a digit first.");
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  // Resize the digit to fit inside a 20 x 20 area
  const scale = 20 / Math.max(cropWidth, cropHeight);

  const resizedWidth = Math.max(
    1,
    Math.round(cropWidth * scale)
  );

  const resizedHeight = Math.max(
    1,
    Math.round(cropHeight * scale)
  );

  // Create a 28 x 28 black canvas
  const initialCanvas = document.createElement("canvas");
  initialCanvas.width = 28;
  initialCanvas.height = 28;

  const initialContext = initialCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  initialContext.fillStyle = "#000000";
  initialContext.fillRect(0, 0, 28, 28);

  // Place the resized digit inside the central 20 x 20 region
  const destinationX =
    4 + Math.floor((20 - resizedWidth) / 2);

  const destinationY =
    4 + Math.floor((20 - resizedHeight) / 2);

  initialContext.drawImage(
    canvas,
    minX,
    minY,
    cropWidth,
    cropHeight,
    destinationX,
    destinationY,
    resizedWidth,
    resizedHeight
  );

  // Calculate the center of mass of the digit
  const imageData = initialContext.getImageData(0, 0, 28, 28);
  const pixels = imageData.data;

  let totalMass = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const brightness = pixels[(y * 28 + x) * 4];

      totalMass += brightness;
      weightedX += x * brightness;
      weightedY += y * brightness;
    }
  }

  if (totalMass === 0) {
    throw new Error("No visible digit was found.");
  }

  const centerX = weightedX / totalMass;
  const centerY = weightedY / totalMass;

  // Shift the digit so its center of mass is near pixel 13.5
  const shiftX = 13.5 - centerX;
  const shiftY = 13.5 - centerY;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = 28;
  outputCanvas.height = 28;

  const outputContext = outputCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  outputContext.fillStyle = "#000000";
  outputContext.fillRect(0, 0, 28, 28);

  outputContext.drawImage(
    initialCanvas,
    shiftX,
    shiftY
  );

  // Extract the final 784 grayscale pixel values
  const output = outputContext.getImageData(0, 0, 28, 28);
  const result = new Uint8Array(784);

  for (let i = 0; i < 784; i++) {
    result[i] = output.data[i * 4];
  }

  return result;
}
