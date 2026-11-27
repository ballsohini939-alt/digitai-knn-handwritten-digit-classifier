
const IMAGE_URL = "/mnist/train-images-idx3-ubyte.gz";
const LABEL_URL = "/mnist/train-labels-idx1-ubyte.gz";

// Decompress only if the response still contains gzip-compressed data.
async function getDecompressedBuffer(buffer) {
  const bytes = new Uint8Array(buffer);

  // GZIP signature: 0x1F 0x8B
  const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;

  if (isGzip) {
    const stream = new Blob([buffer])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));

    return await new Response(stream).arrayBuffer();
  }

  // The browser or server has already decompressed the response.
  return buffer;
}

export async function loadMNIST() {
  try {
    console.log("Loading MNIST dataset...");

    // Download both MNIST files.
    const [imageResponse, labelResponse] = await Promise.all([
      fetch(IMAGE_URL),
      fetch(LABEL_URL),
    ]);

    if (!imageResponse.ok || !labelResponse.ok) {
      throw new Error(
        "Could not download MNIST files. Check the public/mnist folder."
      );
    }

    // Read the downloaded files.
    const [imageBuffer, labelBuffer] = await Promise.all([
      imageResponse.arrayBuffer(),
      labelResponse.arrayBuffer(),
    ]);

    console.log("Downloaded MNIST files:", {
      imageBytes: imageBuffer.byteLength,
      labelBytes: labelBuffer.byteLength,
    });

    // Handle compressed and already-decompressed responses.
    const [finalImageBuffer, finalLabelBuffer] = await Promise.all([
      getDecompressedBuffer(imageBuffer),
      getDecompressedBuffer(labelBuffer),
    ]);

    const imageBytes = new Uint8Array(finalImageBuffer);
    const labelBytes = new Uint8Array(finalLabelBuffer);

    // Create DataViews for reading MNIST headers.
    const imageView = new DataView(
      imageBytes.buffer,
      imageBytes.byteOffset,
      imageBytes.byteLength
    );

    const labelView = new DataView(
      labelBytes.buffer,
      labelBytes.byteOffset,
      labelBytes.byteLength
    );

    // Read image file header.
    const imageMagic = imageView.getUint32(0, false);
    const imageCount = imageView.getUint32(4, false);
    const rows = imageView.getUint32(8, false);
    const columns = imageView.getUint32(12, false);

    // Read label file header.
    const labelMagic = labelView.getUint32(0, false);
    const labelCount = labelView.getUint32(4, false);

    console.log("MNIST header information:", {
      imageMagic,
      imageCount,
      rows,
      columns,
      labelMagic,
      labelCount,
    });

    // Validate MNIST file format.
    if (
      imageMagic !== 2051 ||
      labelMagic !== 2049 ||
      rows !== 28 ||
      columns !== 28 ||
      imageCount !== labelCount
    ) {
      throw new Error("The MNIST dataset has an invalid format.");
    }

    // Extract image and label data.
    const pixelsPerImage = rows * columns;

    const images = imageBytes.subarray(16);
    const labels = labelBytes.subarray(8);

    // Select 500 examples of each digit (5,000 total).
    const samplesPerDigit = 500;
    const digitCounts = new Array(10).fill(0);

    const selectedImages = [];
    const selectedLabels = [];

    for (let i = 0; i < imageCount; i++) {
      const digit = labels[i];

      if (digitCounts[digit] < samplesPerDigit) {
        const start = i * pixelsPerImage;
        const end = start + pixelsPerImage;

        selectedImages.push(images.slice(start, end));
        selectedLabels.push(digit);

        digitCounts[digit]++;
      }

      if (digitCounts.every((count) => count === samplesPerDigit)) {
        break;
      }
    }

    // Ensure that all 10 digits have 500 examples.
    if (selectedImages.length !== 5000) {
      throw new Error(
        "Could not load 500 examples for every digit."
      );
    }

    // Combine all selected images into one typed array.
    const trainingImages = new Uint8Array(
      selectedImages.length * pixelsPerImage
    );

    selectedImages.forEach((image, index) => {
      trainingImages.set(image, index * pixelsPerImage);
    });

    const trainingLabels = new Uint8Array(selectedLabels);

    console.log("MNIST loaded successfully!");
    console.log("Training images:", selectedImages.length);
    console.log("Image dimensions:", `${rows} x ${columns}`);
    console.log("Examples per digit:", digitCounts);

    return {
      images: trainingImages,
      labels: trainingLabels,
      imageCount: selectedImages.length,
      rows,
      columns,
      samplesPerDigit,
    };
  } catch (error) {
    console.error("MNIST loading error:", error);
    throw error;
  }
}
