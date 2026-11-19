import { loadMNIST } from "./services/mnistLoader";

async function testDataset() {
  console.log("Starting MNIST test...");

  try {
    const dataset = await loadMNIST();

    console.log("TEST SUCCESSFUL!");
    console.log("Total images:", dataset.imageCount);
    console.log("Total labels:", dataset.labels.length);
    console.log("Pixels per image:", dataset.rows * dataset.columns);
    console.log("First image label:", dataset.labels[0]);
    console.log("First 20 pixel values:", dataset.images.slice(0, 20));
  } catch (error) {
    console.error("TEST FAILED:", error);
  }
}

testDataset();
