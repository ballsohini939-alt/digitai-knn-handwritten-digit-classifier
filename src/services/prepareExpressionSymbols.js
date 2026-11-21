
export function prepareExpressionSymbols(canvas, components) {
  if (!canvas || !components?.length) {
    throw new Error("No expression symbols found.");
  }

  return components.map((symbol) => {
    const output = document.createElement("canvas");
    output.width = 28;
    output.height = 28;

    const context = output.getContext("2d", {
      willReadFrequently: true,
    });

    context.fillStyle = "black";
    context.fillRect(0, 0, 28, 28);

    const scale =
      20 / Math.max(symbol.width, symbol.height);

    const resizedWidth = Math.max(
      1,
      Math.round(symbol.width * scale)
    );

    const resizedHeight = Math.max(
      1,
      Math.round(symbol.height * scale)
    );

    const x = Math.floor((28 - resizedWidth) / 2);
    const y = Math.floor((28 - resizedHeight) / 2);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      canvas,
      symbol.x,
      symbol.y,
      symbol.width,
      symbol.height,
      x,
      y,
      resizedWidth,
      resizedHeight
    );

    const imageData = context.getImageData(0, 0, 28, 28);
    const pixels = new Uint8Array(784);

    for (let i = 0; i < 784; i++) {
      pixels[i] = imageData.data[i * 4];
    }

    return {
      ...symbol,
      pixels,
      preview: output.toDataURL("image/png"),
    };
  });
}
