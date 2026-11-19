# DigitAI — Handwritten Digit Classification using KNN

DigitAI is a web-based handwritten digit recognition application built with React and JavaScript. It uses the **K-Nearest Neighbors (KNN)** algorithm to classify handwritten digits from 0 to 9 using the MNIST dataset.

## Features

- Draw handwritten digits on an interactive canvas.
- Recognize digits from 0 to 9 using a real KNN classifier.
- Preprocess drawings into 28 × 28 grayscale images.
- Center handwritten digits using center-of-mass alignment.
- Evaluate the classifier using the independent MNIST test dataset.
- View accuracy, precision, recall and F1-score.
- Explore the 10 × 10 confusion matrix and digit distribution.
- Save evaluation results in browser local storage.

## Machine Learning Details

| Parameter | Configuration |
|---|---|
| Algorithm | K-Nearest Neighbors (KNN) |
| Learning type | Supervised learning |
| Distance metric | Euclidean distance |
| Number of neighbors | K = 5 |
| Voting method | Majority voting |
| Input dimensions | 784 pixels (28 × 28) |
| Training examples | 5,000 |
| Test examples | 10,000 |

### Model Performance

**Measured test accuracy: 93.27%**

- Correct predictions: 9,327
- Total test images: 10,000
- Training examples: 5,000

The training subset contains 500 selected examples per digit. The evaluation uses the separate MNIST test dataset.

## Technology Stack

- React
- JavaScript
- Vite
- Recharts
- Lucide React
- HTML5 Canvas
- MNIST dataset

## Project Structure

```text
digitai-knn-handwritten-digit-classifier/
├── public/
│   └── mnist/
│       ├── train-images-idx3-ubyte.gz
│       ├── train-labels-idx1-ubyte.gz
│       ├── t10k-images-idx3-ubyte.gz
│       └── t10k-labels-idx1-ubyte.gz
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/ballsohini939-alt/digitai-knn-handwritten-digit-classifier.git
```

Navigate into the project directory:

```bash
cd digitai-knn-handwritten-digit-classifier
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Dataset

This project uses the MNIST handwritten digit dataset, containing grayscale images of handwritten digits.

Dataset information: https://yann.lecun.com/exdb/mnist/

The required MNIST dataset files are included in the `public/mnist/` directory.

## Future Improvements

- Downloadable model evaluation reports.
- Improved classification performance.
- Additional model comparisons.
- Deployment as a live web application.

---

**DigitAI — Handwritten Digit Classification**

Built as a learning project exploring machine learning, image preprocessing and frontend development.
# digitai-knn-handwritten-digit-classifier
Handwritten Digit Classification using KNN, React and the MNIST dataset.
