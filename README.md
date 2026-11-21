# DigitAI — Handwritten Digit Classification Using KNN

<p align="center">
  <strong>An interactive handwritten digit recognition application powered by the K-Nearest Neighbors algorithm and the MNIST dataset.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Machine%20Learning-KNN-purple" />
  <img src="https://img.shields.io/badge/Accuracy-93.27%25-success" />
</p>

<p align="center">
  <a href="https://digitai-knn-handwritten-digit-class.vercel.app/"><strong>🚀 Live Demo</strong></a> ·
  <a href="https://github.com/ballsohini939-alt/digitai-knn-handwritten-digit-classifier"><strong>GitHub Repository</strong></a>
</p>

---

## 📌 Overview

**DigitAI** is a web-based handwritten digit recognition application built using React and JavaScript. It implements the **K-Nearest Neighbors (KNN)** algorithm to recognize handwritten digits from 0 to 9 using the MNIST dataset.

The application transforms handwritten drawings into 28 × 28 pixel images, processes them, and predicts the corresponding digit using a browser-based KNN classifier.

It also provides model evaluation tools to explore classification performance through accuracy, precision, recall, F1-score, confusion matrix and digit distribution.

## ✨ Features

- **Interactive Drawing Canvas** — Draw handwritten digits directly in the browser.
- **Digit Recognition** — Classify handwritten digits from 0 to 9.
- **Live Camera Mode** — Capture handwritten digits using a camera.
- **Image Preprocessing** — Convert drawings into 28 × 28 grayscale images.
- **Center-of-Mass Alignment** — Center digits for improved classification.
- **Expression Recognition** — Experiment with handwritten arithmetic expressions and operator detection.
- **Model Evaluation** — Evaluate performance using the independent MNIST test dataset.
- **Performance Metrics** — View accuracy, precision, recall and F1-score.
- **Confusion Matrix** — Explore classification results across all ten digits.
- **Evaluation History** — Save evaluation results using browser local storage.

## 🧠 Machine Learning Details

DigitAI uses a supervised machine learning approach based on the K-Nearest Neighbors algorithm.

| Parameter | Configuration |
|---|---|
| Algorithm | K-Nearest Neighbors (KNN) |
| Learning Type | Supervised Learning |
| Distance Metric | Euclidean Distance |
| Number of Neighbors | K = 5 |
| Voting Method | Majority Voting |
| Input Dimensions | 784 pixels (28 × 28) |
| Training Examples | 5,000 |
| Test Examples | 10,000 |
| Dataset | MNIST |

### 📊 Model Performance

**Measured Test Accuracy: 93.27%**

| Metric | Result |
|---|---:|
| Correct Predictions | 9,327 |
| Total Test Images | 10,000 |
| Training Examples | 5,000 |
| Test Accuracy | 93.27% |

The training subset contains 500 selected examples per digit. Model evaluation uses the separate MNIST test dataset.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| JavaScript | Application logic |
| Vite | Development and build tool |
| Recharts | Data visualization |
| Lucide React | Interface icons |
| HTML5 Canvas | Drawing and image processing |
| MNIST | Handwritten digit dataset |
| CSS3 | Responsive interface styling |

## 📂 Project Structure

```text
digitai-knn-handwritten-digit-classifier/
│
├── public/
│   └── mnist/
│       ├── train-images-idx3-ubyte.gz
│       ├── train-labels-idx1-ubyte.gz
│       ├── t10k-images-idx3-ubyte.gz
│       └── t10k-labels-idx1-ubyte.gz
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 🚀 Getting Started

Follow these instructions to run DigitAI locally.

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ballsohini939-alt/digitai-knn-handwritten-digit-classifier.git
```

### 2. Navigate to the Project Directory

```bash
cd digitai-knn-handwritten-digit-classifier
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Application

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173/
```

## 📚 Dataset

DigitAI uses the **MNIST handwritten digit dataset**, a widely used dataset in machine learning and image classification.

The dataset contains grayscale images of handwritten digits from 0 to 9.

- Image dimensions: 28 × 28 pixels
- Number of classes: 10
- Training subset used: 5,000 images
- Independent test set: 10,000 images

Dataset source: [MNIST Database](https://yann.lecun.com/exdb/mnist/)

The required compressed dataset files are included in the `public/mnist/` directory.

## 🔮 Future Improvements

- Improve handwritten digit classification accuracy.
- Enhance arithmetic operator recognition.
- Expand handwritten mathematical expression support.
- Compare KNN with other machine learning algorithms.
- Generate downloadable model evaluation reports.
- Improve image preprocessing and recognition robustness.

## 👩‍💻 Author

**Sohini Ball**

B.Tech Computer Science and Engineering Student  
Interested in Software Engineering, Machine Learning and AI-powered applications.

- GitHub: [@ballsohini939-alt](https://github.com/ballsohini939-alt)
- LinkedIn: [Sohini Ball](https://linkedin.com/in/sohini-ball-698012381/)

---

<p align="center">
  <strong>DigitAI — Turning Handwriting into Predictions.</strong>
  <br>
  Built with React, JavaScript and Machine Learning.
</p>
