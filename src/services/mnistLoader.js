
const IMAGE_URL = "/mnist/train-images-idx3-ubyte.gz";
const LABEL_URL = "/mnist/train-labels-idx1-ubyte.gz";

export async function loadMNIST() {
  try {
    console.log("Loading MNIST dataset...");

    // Download both compressed files
    const [imageResponse, labelResponse] = await Promise.all([
      fetch(IMAGE_URL),
      fetch(LABEL_URL),
    ]);

    if (!imageResponse.ok || !labelResponse.ok) {
      throw new Error(
        "Could not download MNIST files. Check the public/mnist folder."
      );
    }
const [imageBuffer, labelBuffer] = await Promise.all([
  imageResponse.arrayBuffer(),
  labelResponse.arrayBuffer(),
]);

    // Decompress the files
    const imageBytes = new Uint8Array(imageBuffer);
const labelBytes = new Uint8Array(labelBuffer);

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

    // Read MNIST file headers
    const imageMagic = imageView.getUint32(0, false);
    const imageCount = imageView.getUint32(4, false);
    const rows = imageView.getUint32(8, false);
    const columns = imageView.getUint32(12, false);
    const labelMagic = labelView.getUint32(0, false);
    const labelCount = labelView.getUint32(4, false);

    if (
      imageMagic !== 2051 ||
      labelMagic !== 2049 ||
      rows !== 28 ||
      columns !== 28 ||
      imageCount !== labelCount
    ) {
      throw new Error("The MNIST dataset has an invalid format.");
    }

    const pixelsPerImage = rows * columns;
    const images = imageBytes.subarray(16);
    const labels = labelBytes.subarray(8);

    // Select 500 examples of each digit (5,000 total)
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

    if (selectedImages.length !== 5000) {
      throw new Error("Could not load 500 examples for every digit.");
    }

    // Combine images into one typed array
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
