import {
  BrainCircuit,
  Database,
  Image,
  Scan,
  Calculator,
  Layers,
  Code2,
  Workflow,
  Target,
  Zap,
  CheckCircle2,
  ArrowDown,
  Cpu,
  Monitor,
  FileImage,
  BarChart3,
  Info,
} from "lucide-react";

const technologies = [
  {
    icon: Code2,
    name: "React",
    description: "Component-based user interface",
    category: "FRONTEND",
    color: "purple",
  },
  {
    icon: Zap,
    name: "Vite",
    description: "Fast development environment",
    category: "BUILD TOOL",
    color: "orange",
  },
  {
    icon: Layers,
    name: "CSS",
    description: "Responsive styling and layouts",
    category: "DESIGN",
    color: "blue",
  },
  {
    icon: BarChart3,
    name: "Recharts",
    description: "Interactive analytics charts",
    category: "VISUALIZATION",
    color: "pink",
  },
  {
    icon: BrainCircuit,
    name: "KNN",
    description: "Supervised classification algorithm",
    category: "ML ALGORITHM",
    color: "purple",
  },
  {
    icon: Database,
    name: "MNIST",
    description: "Handwritten digit dataset",
    category: "DATASET",
    color: "green",
  },
];

const workflow = [
  {
    number: "01",
    icon: Scan,
    title: "Input image",
    description: "The user draws a handwritten digit on the recognition canvas.",
  },
  {
    number: "02",
    icon: Image,
    title: "Preprocessing",
    description: "The image is converted into a consistent grayscale 28 × 28 representation.",
  },
  {
    number: "03",
    icon: Calculator,
    title: "Feature extraction",
    description: "The pixel values are flattened into a numerical feature vector.",
  },
  {
    number: "04",
    icon: BrainCircuit,
    title: "KNN classification",
    description: "Distances to labelled training examples are calculated and the nearest neighbors vote.",
  },
  {
    number: "05",
    icon: Target,
    title: "Predicted digit",
    description: "The digit with the highest number of neighbor votes becomes the predicted class.",
  },
];

const architecture = [
  {
    icon: Monitor,
    title: "Presentation layer",
    description: "React pages, drawing canvas, charts and navigation.",
  },
  {
    icon: FileImage,
    title: "Input processing layer",
    description: "Canvas image capture and image preprocessing.",
  },
  {
    icon: Cpu,
    title: "Classification layer",
    description: "KNN distance calculation, nearest-neighbor selection and voting.",
  },
  {
    icon: Database,
    title: "Data layer",
    description: "MNIST training examples and saved prediction history.",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="about-section-heading">
      <span className="about-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function About() {
  return (
    <div className="page-content about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> PROJECT DOCUMENTATION
          </div>

          <h1>
            Understanding <span>DigitAI</span>
          </h1>

          <p>
            Exploring how computers recognize handwritten numbers using
            image processing, numerical features and the K-Nearest
            Neighbors classification algorithm.
          </p>

          <div className="about-hero-tags">
            <span><BrainCircuit size={13} /> Machine Learning</span>
            <span><Image size={13} /> Image Processing</span>
            <span><Target size={13} /> Classification</span>
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="digit-orbit orbit-one" />
          <div className="digit-orbit orbit-two" />
          <div className="digit-glow" />
          <div className="digit-display">8</div>
          <div className="digit-caption">HANDWRITTEN DIGIT</div>
          <div className="digit-floating digit-floating-one">0</div>
          <div className="digit-floating digit-floating-two">5</div>
          <div className="digit-floating digit-floating-three">9</div>
        </div>
      </section>

      <section className="about-overview-section">
        <SectionHeading
          eyebrow="01 — INTRODUCTION"
          title="What is handwritten digit classification?"
          description="A computer vision and machine learning task that teaches computers to identify handwritten numerical digits."
        />

        <div className="about-overview-grid">
          <article className="about-overview-card">
            <div className="about-card-icon purple"><BrainCircuit size={20} /></div>
            <h3>The concept</h3>
            <p>
              Handwritten digit classification is the process of recognizing
              numbers from images. A classification model analyses the
              patterns in an image and assigns it to one of ten classes,
              from 0 to 9.
            </p>
          </article>

          <article className="about-overview-card">
            <div className="about-card-icon blue"><Target size={20} /></div>
            <h3>Project objective</h3>
            <p>
              The objective is to understand how image data can be
              represented numerically and classified using the K-Nearest
              Neighbors algorithm.
            </p>
          </article>

          <article className="about-overview-card">
            <div className="about-card-icon pink"><Zap size={20} /></div>
            <h3>Real-world applications</h3>
            <p>
              Digit recognition is useful in postal code reading, cheque
              processing, form digitization, bank document processing and
              automated number entry.
            </p>
          </article>
        </div>
      </section>

      <section className="about-dataset-section">
        <SectionHeading
          eyebrow="02 — DATASET"
          title="Meet the MNIST dataset"
          description="A widely used benchmark dataset for handwritten digit recognition."
        />

        <div className="dataset-layout">
          <article className="dataset-main-card">
            <div className="dataset-card-top">
              <div>
                <span className="dataset-label">DATASET REFERENCE</span>
                <h3>MNIST</h3>
                <p>Modified National Institute of Standards and Technology database</p>
              </div>
              <div className="dataset-icon"><Database size={24} /></div>
            </div>

            <div className="dataset-stats">
              <div><strong>70,000</strong><span>Total images</span></div>
              <div><strong>60,000</strong><span>Training images</span></div>
              <div><strong>10,000</strong><span>Test images</span></div>
            </div>

            <div className="dataset-progress">
              <div className="dataset-progress-label">
                <span>Training set</span><strong>85.7%</strong>
              </div>
              <div className="dataset-progress-track">
                <div className="dataset-progress-fill" />
              </div>
              <div className="dataset-progress-label">
                <span>Testing set</span><strong>14.3%</strong>
              </div>
            </div>
          </article>

          <article className="pixel-card">
            <div className="pixel-card-heading">
              <div>
                <span className="dataset-label">IMAGE REPRESENTATION</span>
                <h3>28 × 28 pixels</h3>
              </div>
              <Image size={20} />
            </div>

            <div className="pixel-demo">
              {Array.from({ length: 100 }, (_, i) => {
                const row = Math.floor(i / 10);
                const col = i % 10;
                const distance = Math.abs(col - 4.5);
                const ring = Math.abs(row - 4.5);
                const intensity = Math.max(
                  0,
                  1 - Math.abs(distance - 2.2) * 0.6 - Math.abs(ring - 2.2) * 0.4
                );

                return (
                  <span
                    key={i}
                    style={{
                      opacity: 0.08 + intensity * 0.9,
                      background: `rgb(${155 + intensity * 80}, ${130 + intensity * 80}, 255)`,
                    }}
                  />
                );
              })}
            </div>

            <p>
              Each image contains 784 pixel values. The image can be
              flattened into a vector of 784 numerical features.
            </p>
          </article>
        </div>
      </section>

      <section className="about-knn-section">
        <SectionHeading
          eyebrow="03 — ALGORITHM"
          title="How does KNN work?"
          description="K-Nearest Neighbors is a supervised, instance-based learning algorithm that classifies a new example using its closest labelled examples."
        />

        <div className="knn-explanation-grid">
          <article className="knn-concept-card">
            <div className="knn-concept-icon"><BrainCircuit size={22} /></div>
            <h3>Learn from neighbors</h3>
            <p>
              KNN stores labelled training examples. When a new image
              arrives, it compares that image with the stored examples.
            </p>
          </article>

          <article className="knn-concept-card">
            <div className="knn-concept-icon"><Calculator size={22} /></div>
            <h3>Calculate distance</h3>
            <p>
              It calculates how different the new feature vector is from
              each training example, commonly using Euclidean distance.
            </p>
          </article>

          <article className="knn-concept-card">
            <div className="knn-concept-icon"><Target size={22} /></div>
            <h3>Majority voting</h3>
            <p>
              The K closest examples vote. The class receiving the most
              votes is selected as the predicted digit.
            </p>
          </article>
        </div>

        <article className="knn-formula-card">
          <div>
            <span className="dataset-label">EUCLIDEAN DISTANCE</span>
            <h3>How is distance calculated?</h3>
            <p>
              The algorithm measures the straight-line distance between
              two feature vectors.
            </p>
          </div>
          <div className="knn-formula">
            <span>d(x, y) =</span>
            <span className="formula-root">√</span>
            <span className="formula-sum">Σ (xᵢ − yᵢ)²</span>
          </div>
        </article>

        <article className="knn-k-card">
          <div className="knn-k-heading">
            <div className="about-card-icon purple"><Target size={19} /></div>
            <div>
              <h3>Understanding the value of K</h3>
              <p>K determines the number of nearest neighbors used for voting.</p>
            </div>
          </div>

          <div className="knn-k-options">
            <div><strong>1</strong><span>Very local decision</span></div>
            <div className="selected-k"><strong>5</strong><span>Example setting</span></div>
            <div><strong>9</strong><span>Broader neighborhood</span></div>
          </div>
          <p className="knn-k-note">
            The best K value should be selected using validation data.
            K = 5 here is an example configuration, not a measured optimum.
          </p>
        </article>
      </section>

      <section className="about-workflow-section">
        <SectionHeading
          eyebrow="04 — WORKFLOW"
          title="From drawing to prediction"
          description="The conceptual pipeline followed by a handwritten digit recognition system."
        />

        <div className="workflow-list">
          {workflow.map((step, index) => {
            const Icon = step.icon;

            return (
              <div className="workflow-item" key={step.number}>
                <div className="workflow-number">{step.number}</div>
                <div className="workflow-icon"><Icon size={19} /></div>
                <div className="workflow-text">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {index < workflow.length - 1 && (
                  <ArrowDown className="workflow-arrow" size={16} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="about-architecture-section">
        <SectionHeading
          eyebrow="05 — ARCHITECTURE"
          title="Inside the system"
          description="A conceptual view of the components involved in a complete KNN digit recognition application."
        />

        <div className="architecture-stack">
          {architecture.map((layer, index) => {
            const Icon = layer.icon;

            return (
              <div className="architecture-layer" key={layer.title}>
                <div className="architecture-layer-number">0{index + 1}</div>
                <div className="architecture-layer-icon"><Icon size={20} /></div>
                <div className="architecture-layer-text">
                  <h3>{layer.title}</h3>
                  <p>{layer.description}</p>
                </div>
                <CheckCircle2 size={17} className="architecture-check" />
              </div>
            );
          })}
        </div>

        <div className="architecture-note">
          <Info size={16} />
          <p>
            This is the intended conceptual architecture. The current
            application is a frontend demonstration and does not yet
            connect to a trained KNN model or live classification API.
          </p>
        </div>
      </section>

      <section className="about-tech-section">
        <SectionHeading
          eyebrow="06 — TECHNOLOGY"
          title="Tools and technologies"
          description="The tools used in the current frontend demonstration and the algorithm and dataset it explains."
        />

        <div className="technology-grid">
          {technologies.map((tech) => {
            const Icon = tech.icon;

            return (
              <article className="technology-card" key={tech.name}>
                <div className={`technology-icon ${tech.color}`}>
                  <Icon size={20} />
                </div>
                <div className="technology-category">{tech.category}</div>
                <h3>{tech.name}</h3>
                <p>{tech.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-final-card">
        <div className="about-final-icon"><BrainCircuit size={25} /></div>
        <span>THE IDEA BEHIND DIGITAI</span>
        <h2>Turning handwritten patterns into digital understanding.</h2>
        <p>
          This project demonstrates how image representation, distance
          measurement and classification can work together to recognize
          handwritten digits.
        </p>
      </section>

      <div className="about-footer-note">
        DigitAI · Handwritten Digit Classification · KNN Demonstration
      </div>
    </div>
  );
}
