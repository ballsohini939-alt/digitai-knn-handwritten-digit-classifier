
export function preprocessCanvas(canvas) {
  if (!canvas) {
    throw new Error("Drawing canvas not found.");
  }

  const sourceContext = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  const source = sourceContext.getImageData(
    0, 0, canvas.width, canvas.height
  );

  const { data, width, height } = source;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  // Find the drawing boundaries.
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

  // Resize while preserving the digit's aspect ratio.
  const scale = 20 / Math.max(cropWidth, cropHeight);

  const resizedWidth = Math.max(1, Math.round(cropWidth * scale));
  const resizedHeight = Math.max(1, Math.round(cropHeight * scale));

  const digitCanvas = document.createElement("canvas");
  digitCanvas.width = 28;
  digitCanvas.height = 28;

  const digitContext = digitCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  digitContext.fillStyle = "black";
  digitContext.fillRect(0, 0, 28, 28);

  const x = 4 + Math.floor((20 - resizedWidth) / 2);
  const y = 4 + Math.floor((20 - resizedHeight) / 2);

  digitContext.imageSmoothingEnabled = true;
  digitContext.imageSmoothingQuality = "high";

  digitContext.drawImage(
    canvas,
    minX, minY, cropWidth, cropHeight,
    x, y, resizedWidth, resizedHeight
  );

  // Read the resized image.
  const image = digitContext.getImageData(0, 0, 28, 28);
  const pixels = image.data;

  // Calculate center of mass.
  let mass = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let py = 0; py < 28; py++) {
    for (let px = 0; px < 28; px++) {
      const brightness = pixels[(py * 28 + px) * 4];

      mass += brightness;
      weightedX += px * brightness;
      weightedY += py * brightness;
    }
  }

  if (mass === 0) {
    throw new Error("No visible digit was found.");
  }

  const centerX = weightedX / mass;
  const centerY = weightedY / mass;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = 28;
  outputCanvas.height = 28;

  const outputContext = outputCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  outputContext.fillStyle = "black";
  outputContext.fillRect(0, 0, 28, 28);

  // Center the digit.
  outputContext.drawImage(
    digitCanvas,
    13.5 - centerX,
    13.5 - centerY
  );

  const finalImage = outputContext.getImageData(0, 0, 28, 28);
  const result = new Uint8Array(784);

  for (let i = 0; i < 784; i++) {
    result[i] = finalImage.data[i * 4];
  }

  return result;
}


export function preprocessCameraCanvas(canvas) {
  if (!canvas) {
    throw new Error("Camera image not found.");
  }

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  const image = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const { data, width, height } = image;

  // Convert the image into grayscale and build a histogram.
  const grayscale = new Uint8Array(width * height);
  const histogram = new Array(256).fill(0);

  for (let i = 0; i < grayscale.length; i++) {
    const offset = i * 4;

    const value = Math.round(
      0.299 * data[offset] +
      0.587 * data[offset + 1] +
      0.114 * data[offset + 2]
    );

    grayscale[i] = value;
    histogram[value]++;
  }

  // Calculate an adaptive Otsu threshold.
  const totalPixels = grayscale.length;
  let totalBrightness = 0;

  for (let i = 0; i < 256; i++) {
    totalBrightness += i * histogram[i];
  }

  let backgroundWeight = 0;
  let backgroundSum = 0;
  let maximumVariance = 0;
  let threshold = 0;

  for (let i = 0; i < 256; i++) {
    backgroundWeight += histogram[i];

    if (backgroundWeight === 0) continue;

    const foregroundWeight = totalPixels - backgroundWeight;

    if (foregroundWeight === 0) break;

    backgroundSum += i * histogram[i];

    const backgroundMean =
      backgroundSum / backgroundWeight;

    const foregroundMean =
      (totalBrightness - backgroundSum) / foregroundWeight;

    const variance =
      backgroundWeight *
      foregroundWeight *
      Math.pow(backgroundMean - foregroundMean, 2);

    if (variance > maximumVariance) {
      maximumVariance = variance;
      threshold = i;
    }
  }

  // Create a transparent background with white handwriting.
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;

  const maskContext = maskCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  const mask = maskContext.createImageData(width, height);

  for (let i = 0; i < grayscale.length; i++) {
    const offset = i * 4;

    if (grayscale[i] < threshold) {
      mask.data[offset] = 255;
      mask.data[offset + 1] = 255;
      mask.data[offset + 2] = 255;
      mask.data[offset + 3] = 255;
    } else {
      mask.data[offset + 3] = 0;
    }
  
  }

  maskContext.putImageData(mask, 0, 0);

  return preprocessCanvas(maskCanvas);
}
