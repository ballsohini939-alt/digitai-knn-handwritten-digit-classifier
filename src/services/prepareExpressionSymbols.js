
function preprocessSymbol(canvas, symbol) {
  // Crop the individual symbol from the original drawing.
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = Math.max(1, Math.ceil(symbol.width));
  cropCanvas.height = Math.max(1, Math.ceil(symbol.height));

  const cropContext = cropCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  cropContext.drawImage(
    canvas,
    symbol.x,
    symbol.y,
    symbol.width,
    symbol.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  const source = cropContext.getImageData(
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  const { data, width, height } = source;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  // Find the actual handwriting boundaries.
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
    throw new Error("An empty expression symbol was detected.");
  }

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  // Preserve aspect ratio and resize to 20x20 maximum.
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

  digitContext.imageSmoothingEnabled = true;
  digitContext.imageSmoothingQuality = "high";

  const x = 4 + Math.floor((20 - resizedWidth) / 2);
  const y = 4 + Math.floor((20 - resizedHeight) / 2);

  digitContext.drawImage(
    cropCanvas,
    minX,
    minY,
    cropWidth,
    cropHeight,
    x,
    y,
    resizedWidth,
    resizedHeight
  );

  // Calculate the centre of mass.
  const image = digitContext.getImageData(0, 0, 28, 28);
  const pixels = image.data;

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
    throw new Error("No visible handwriting was found.");
  }

  const centerX = weightedX / mass;
  const centerY = weightedY / mass;

  // Shift the digit so its centre of mass is at the image centre.
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = 28;
  outputCanvas.height = 28;

  const outputContext = outputCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  outputContext.fillStyle = "black";
  outputContext.fillRect(0, 0, 28, 28);

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

  return {
    pixels: result,
    preview: outputCanvas.toDataURL("image/png"),
  };
}

export function prepareExpressionSymbols(canvas, components) {
  if (!canvas || !components?.length) {
    throw new Error("No expression symbols found.");
  }

  return components.map((symbol) => ({
    ...symbol,
    ...preprocessSymbol(canvas, symbol),
  }));
}
