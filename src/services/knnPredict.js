
export function predictDigit(inputPixels, dataset, k = 5) {
  const { images, labels, imageCount } = dataset;

  if (!inputPixels || inputPixels.length !== 784) {
    throw new Error("Input must contain exactly 784 pixels.");
  }

  const distances = [];

  for (let i = 0; i < imageCount; i++) {
    let distance = 0;
    const offset = i * 784;

    for (let j = 0; j < 784; j++) {
      const difference = inputPixels[j] - images[offset + j];
      distance += difference * difference;
    }

    distances.push({
  distance,
  label: labels[i],
  image: images.slice(offset, offset + 784),
  index: i,
});
  }

  // Sort by distance and select the nearest k images
  distances.sort((a, b) => a.distance - b.distance);

  const nearestNeighbors = distances.slice(0, k);

  // Count votes for each digit
  const votes = Array(10).fill(0);

  nearestNeighbors.forEach((neighbor) => {
    votes[neighbor.label]++;
  });

  // Find the digit with the most votes
  let predictedDigit = 0;

  for (let digit = 1; digit < 10; digit++) {
    if (votes[digit] > votes[predictedDigit]) {
      predictedDigit = digit;
    }
  }

  const voteDistribution = votes.map((count, digit) => ({
    digit,
    count,
    percentage: (count / k) * 100,
  }));

  return {
    predictedDigit,
    votes: voteDistribution,
    neighbors: nearestNeighbors,
    k,
  };
}
