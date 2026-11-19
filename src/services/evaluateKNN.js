
export async function evaluateKNN(
  trainDataset,
  testDataset,
  sampleCount = 1000,
  k = 5,
  onProgress = () => {}
) {
  const {
    images: trainImages,
    labels: trainLabels,
    imageCount,
  } = trainDataset;

  const {
    images: testImages,
    labels: testLabels,
    imageCount: testImageCount,
  } = testDataset;

  const limit = Math.min(sampleCount, testImageCount);

  if (
    !trainImages ||
    !trainLabels ||
    !testImages ||
    !testLabels ||
    imageCount <= 0 ||
    limit <= 0 ||
    k <= 0 ||
    k > imageCount
  ) {
    throw new Error("Invalid training or test dataset.");
  }

  const confusionMatrix = Array.from(
    { length: 10 },
    () => Array(10).fill(0)
  );

  let correct = 0;

  for (let sample = 0; sample < limit; sample++) {
    const testOffset = sample * 784;
    const nearest = [];

    for (let i = 0; i < imageCount; i++) {
      const trainOffset = i * 784;
      let distance = 0;

      const cutoff =
        nearest.length === k
          ? nearest[k - 1].distance
          : Infinity;

      // Early pruning: stop if this image cannot enter the top K.
      for (let j = 0; j < 784; j++) {
        const difference =
          testImages[testOffset + j] -
          trainImages[trainOffset + j];

        distance += difference * difference;

        if (distance >= cutoff) {
          break;
        }
      }

      if (distance >= cutoff) {
        continue;
      }

      const neighbor = {
        distance,
        label: trainLabels[i],
      };

      if (nearest.length < k) {
        nearest.push(neighbor);
        nearest.sort((a, b) => a.distance - b.distance);
      } else {
        nearest[k - 1] = neighbor;

        for (
          let position = k - 1;
          position > 0;
          position--
        ) {
          if (
            nearest[position].distance <
            nearest[position - 1].distance
          ) {
            const temporary = nearest[position];
            nearest[position] = nearest[position - 1];
            nearest[position - 1] = temporary;
          } else {
            break;
          }
        }
      }
    }

    const votes = Array(10).fill(0);

    for (const neighbor of nearest) {
      votes[neighbor.label]++;
    }

    let predicted = 0;

    for (let digit = 1; digit < 10; digit++) {
      if (votes[digit] > votes[predicted]) {
        predicted = digit;
      }
    }

    const actual = testLabels[sample];

    confusionMatrix[actual][predicted]++;

    if (predicted === actual) {
      correct++;
    }

    if ((sample + 1) % 10 === 0 || sample + 1 === limit) {
      onProgress({
        processed: sample + 1,
        total: limit,
        percentage: Math.round(
          ((sample + 1) / limit) * 100
        ),
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const metrics = [];

  for (let digit = 0; digit < 10; digit++) {
    const truePositive = confusionMatrix[digit][digit];

    const falsePositive = confusionMatrix.reduce(
      (sum, row, actual) =>
        sum + (actual === digit ? 0 : row[digit]),
      0
    );

    const falseNegative = confusionMatrix[digit].reduce(
      (sum, value, predicted) =>
        sum + (predicted === digit ? 0 : value),
      0
    );

    const support = confusionMatrix[digit].reduce(
      (sum, value) => sum + value,
      0
    );

    const precision =
      truePositive + falsePositive === 0
        ? 0
        : truePositive / (truePositive + falsePositive);

    const recall =
      truePositive + falseNegative === 0
        ? 0
        : truePositive / (truePositive + falseNegative);

    const f1 =
      precision + recall === 0
        ? 0
        : (2 * precision * recall) / (precision + recall);

    metrics.push({
      digit,
      precision: precision * 100,
      recall: recall * 100,
      f1: f1 * 100,
      support,
    });
  }

  return {
    accuracy: (correct / limit) * 100,
    correct,
    total: limit,
    k,
    confusionMatrix,
    metrics,
  };
}
