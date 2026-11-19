
const demoResults = [
  {
    digit: 7,
    votes: [2, 1, 2, 3, 1, 2, 4, 78, 5, 2],
  },
  {
    digit: 3,
    votes: [1, 2, 3, 72, 4, 2, 3, 5, 4, 4],
  },
  {
    digit: 9,
    votes: [1, 2, 2, 3, 3, 2, 4, 5, 3, 75],
  },
  {
    digit: 5,
    votes: [2, 1, 3, 4, 2, 76, 3, 4, 2, 3],
  },
  {
    digit: 2,
    votes: [2, 3, 74, 3, 4, 3, 2, 4, 3, 2],
  },
];

export function predictDemoDigit() {
  const result =
    demoResults[Math.floor(Math.random() * demoResults.length)];

  return {
    digit: result.digit,
    votes: result.votes.map((value, digit) => ({
      digit,
      percentage: value,
    })),
    mode: "demo",
  };
}
