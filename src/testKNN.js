import { loadMNIST } from "./services/mnistLoader";
import { predictDigit } from "./services/knnPredict";

async function testKNN() {
  console.log("Starting real KNN prediction test...");

  try {
    const dataset = await loadMNIST();

    // Use the first actual MNIST image
    const testImage = dataset.images.slice(0, 784);
    const actualLabel = dataset.labels[0];

    // Predict using the KNN algorithm
    const result = predictDigit(testImage, dataset, 5);

    console.log("KNN TEST SUCCESSFUL!");
    console.log("Actual digit:", actualLabel);
    console.log("Predicted digit:", result.predictedDigit);
    console.log("K value:", result.k);
    console.log("Nearest neighbor labels:",
      result.neighbors.map((n) => n.label)
    );
    console.log("Vote distribution:", result.votes);
    console.log("Prediction correct:",
      actualLabel === result.predictedDigit
    );
  } catch (error) {
    console.error("KNN TEST FAILED:", error);
  }
}

testKNN();
