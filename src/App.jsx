import { useState } from "react";

import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import Analytics from "./pages/Analytics";

import Recognition from "./pages/Recognition";

import PredictionHistory from "./pages/History";

import About from "./pages/About";

import { getPredictionHistory } from "./services/history";

import {

  LayoutDashboard,

  PenLine,

  BookOpen,

  Brain,

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

  ArrowRight,

  ArrowUpRight,

  ArrowLeft,

  Cpu,

  Monitor,

  FileImage,

  BarChart3,

  Info,

  History,

  Activity,

  Sparkles,

  X,

  Menu,

  Settings,

  Search,

  Bell,

  ChevronDown,

  ChevronRight,

  MoreHorizontal,

  Clock3,

} from "lucide-react";

const navigation = [

  { label: "Dashboard", path: "/", icon: LayoutDashboard },

  { label: "Recognition Studio", path: "/recognition", icon: PenLine },

  { label: "Model Analytics", path: "/analytics", icon: BarChart3 },

  { label: "Prediction History", path: "/history", icon: History },

  { label: "About Project", path: "/about", icon: BookOpen },

];

function Sidebar({ mobileOpen, closeMobile }) {

  return (

    <>

      {mobileOpen && (

        <button

          className="sidebar-overlay"

          onClick={closeMobile}

          aria-label="Close menu"

        />

      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>

        <div className="brand">

          <div className="brand-icon">

            <Brain size={23} />

          </div>

          <div>

            <div className="brand-name">

              Digit<span>AI</span>

            </div>

            <div className="brand-subtitle">INTELLIGENCE LAB</div>

          </div>

          <button

            className="mobile-close"

            onClick={closeMobile}

            aria-label="Close menu"

          >

            <X size={19} />

          </button>

        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink

                key={item.path}

                to={item.path}

                end={item.path === "/"}

                onClick={closeMobile}

                className={({ isActive }) =>

                  `nav-link ${isActive ? "active" : ""}`

                }

              >

                <Icon size={18} strokeWidth={1.8} />

                <span>{item.label}</span>

                {item.path === "/recognition" && (

                  <span className="nav-new">TRY</span>

                )}

              </NavLink>

            );

          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="help-card">

            <div className="help-icon">

              <Sparkles size={17} />

            </div>

            <div className="help-title">Explore the model</div>

            <p>

              Discover how K-Nearest Neighbors classifies handwritten digits.

            </p>

            <Link to="/about" onClick={closeMobile}>

              Learn more <ArrowRight size={14} />

            </Link>

          </div>

          <div className="sidebar-user">

            <div className="avatar">SB</div>

            <div className="user-info">

              <strong>Student Workspace</strong>

              <span>Personal project</span>

            </div>

            <Settings size={17} className="user-settings" />

          </div>

        </div>

      </aside>

    </>

  );

}

function Topbar({ onMenuClick }) {

  const location = useLocation();

  const current = navigation.find(

    (item) => item.path === location.pathname

  );

  const [searchOpen, setSearchOpen] = useState(false);

  return (

    <header className="topbar">

      <div className="topbar-left">

        <button

          className="mobile-menu"

          onClick={onMenuClick}

          aria-label="Open menu"

        >

          <Menu size={21} />

        </button>

        <div className="breadcrumb">

          Workspace <span>/</span>{" "}

          <strong>{current?.label || "Dashboard"}</strong>

        </div>

      </div>

      <div className="topbar-actions">

        {searchOpen && (

          <input

            className="top-search-input"

            autoFocus

            placeholder="Search this workspace..."

            onKeyDown={(event) => {

              if (event.key === "Escape") setSearchOpen(false);

            }}

          />

        )}

        <button

          className="icon-button"

          aria-label="Search"

          onClick={() => setSearchOpen(!searchOpen)}

        >

          <Search size={18} />

        </button>

        <button

          className="icon-button notification-button"

          aria-label="Notifications"

        >

          <Bell size={18} />

          <span />

        </button>

        <div className="top-divider" />

        <button className="profile-button">

          <div className="avatar small-avatar">SB</div>

          <span>Student</span>

          <ChevronDown size={15} />

        </button>

      </div>

    </header>

  );

}

function StatCard({ item }) {

  const Icon = item.icon;

  return (

    <article className="stat-card">

      <div className="stat-top">

        <div className={`stat-icon ${item.color}`}>

          <Icon size={19} />

        </div>

        <button className="subtle-icon" aria-label="More information">

          <MoreHorizontal size={19} />

        </button>

      </div>

      <div className="stat-value">{item.value}</div>

      <div className="stat-label">{item.label}</div>

      <div className="stat-footnote">{item.change}</div>

    </article>

  );

}

function Dashboard() {

    const [evaluationResults] = useState(() => {

    try {

      const savedResults = localStorage.getItem("digitai-knn-evaluation");

      return savedResults ? JSON.parse(savedResults) : null;

    } catch {

      return null;

    }

  });

    const [predictionRecords] = useState(() =>

    getPredictionHistory().filter((record) => record.mode === "knn")

  );

  const digitCounts = Array.from({ length: 10 }, (_, digit) => ({

    digit,

    count: predictionRecords.filter(

      (record) => record.digit === digit

    ).length,

  }));

  const maxDigitCount = Math.max(

    ...digitCounts.map((item) => item.count),

    1

  );

  const stats = [

    {

      label: "Test accuracy",

      value: evaluationResults

        ? `${evaluationResults.accuracy.toFixed(2)}%`

        : "—",

      change: evaluationResults

        ? `Measured using K = ${evaluationResults.k}`

        : "Run Model Analytics to measure",

      icon: Target,

      color: "purple",

    },

    {

      label: "Correct predictions",

      value: evaluationResults

        ? evaluationResults.correct.toLocaleString()

        : "—",

      change: evaluationResults

        ? `Out of ${evaluationResults.total.toLocaleString()} test images`

        : "Awaiting model evaluation",

      icon: CheckCircle2,

      color: "blue",

    },

    {

      label: "Test images evaluated",

      value: evaluationResults

        ? evaluationResults.total.toLocaleString()

        : "—",

      change: "Independent MNIST test dataset",

      icon: BarChart3,

      color: "pink",

    },

    {

      label: "Training examples",

      value: "5,000",

      change: "Selected from MNIST training data",

      icon: Cpu,

      color: "orange",

    },

  ];

  return (

    <div className="page-content">

      <section className="welcome-row">

        <div>

          <div className="eyebrow">

            <span className="eyebrow-dot" /> YOUR AI WORKSPACE

          </div>

          <h1>

            Good to see you, <span>Explorer.</span>

          </h1>

          <p className="welcome-description">

            Your workspace for exploring handwritten digit recognition with KNN.

          </p>

        </div>

        <Link to="/recognition" className="primary-button">

          <PenLine size={17} /> Open Recognition Studio <ArrowRight size={16} />

        </Link>

      </section>

      <section className="hero-panel">

        <div className="hero-content">

          <div className="hero-chip">

            <Sparkles size={14} /> MACHINE LEARNING PROJECT

          </div>

          <h2>

            Every digit tells<br />

            a <span>story.</span>

          </h2>

          <p>

            Draw a handwritten number and explore how the K-Nearest Neighbors

            algorithm can identify it by comparing similar examples.

          </p>

          <Link to="/recognition" className="hero-button">

            Try digit recognition <ArrowUpRight size={16} />

          </Link>

          <div className="hero-meta">

            <span><CheckCircle2 size={14} /> Interactive drawing canvas</span>

            <span><CheckCircle2 size={14} /> KNN concept demonstration</span>

          </div>

        </div>

        <div className="digit-art" aria-hidden="true">

          <div className="digit-orbit orbit-one" />

          <div className="digit-orbit orbit-two" />

          <div className="digit-glow" />

          <div className="digit-number">8</div>

          <div className="digit-tag tag-top">

            <span className="tag-dot" /> PIXEL PATTERN

          </div>

          <div className="digit-tag tag-bottom">

            28 × 28 <span>GRID</span>

          </div>

          <div className="pixel-decoration pixel-one" />

          <div className="pixel-decoration pixel-two" />

        </div>

      </section>

      <section className="section-heading">

        <div>

          <h2>Project overview</h2>

          <p>A quick look at the demonstration workspace</p>

        </div>

        <span className="demo-label">

  <span />

  {evaluationResults ? "REAL EVALUATION" : "AWAITING EVALUATION"}

</span>

      </section>

      <section className="stats-grid">

        {stats.map((item) => (

          <StatCard key={item.label} item={item} />

        ))}

      </section>

      <section className="bottom-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Prediction activity</h3>
              <p>Saved KNN predictions by digit</p>
            </div>

            <span className="demo-label">
              <span />
              REAL DATA
            </span>
          </div>

          <div className="chart-area">
            <div className="chart-y-labels">
              <span>{maxDigitCount}</span>
              <span>{Math.ceil(maxDigitCount * 0.75)}</span>
              <span>{Math.ceil(maxDigitCount * 0.5)}</span>
              <span>{Math.ceil(maxDigitCount * 0.25)}</span>
              <span>0</span>
            </div>

            <div className="chart-main">
              <div className="chart-grid-lines">
                <i /><i /><i /><i /><i />
              </div>

              <div className="bar-chart">
                {digitCounts.map((item) => (
                  <div className="bar-column" key={item.digit}>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${(item.count / maxDigitCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span>{item.digit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-footnote">
            <span className="legend-dot" />
            Actual saved predictions
            <span className="chart-note">
              {predictionRecords.length} KNN predictions
            </span>
          </div>
        </article>

        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent predictions</h3>
              <p>Your latest saved KNN results</p>
            </div>

            <Link to="/history" className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="prediction-list">
            {predictionRecords.length > 0 ? (
              predictionRecords.slice(0, 3).map((record) => (
                <div className="prediction-item" key={record.id}>
                  <div className="digit-thumbnail purple">
                    {record.digit}
                  </div>

                  <div className="prediction-info">
                    <strong>
                      Digit {record.digit} <span>· KNN</span>
                    </strong>

                    <small>
                      <Clock3 size={12} />
                      {record.createdAt
                        ? new Date(record.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </small>
                  </div>

                  <span className="demo-result">REAL KNN</span>
                </div>
              ))
            ) : (
              <div className="empty-predictions">
                <p>No saved KNN predictions yet.</p>
                <Link to="/recognition" className="text-link">
                  Try Recognition Studio <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </article>
      </section>

      <div className="disclaimer">

  <Activity size={15} />

  {evaluationResults

    ? `Dashboard statistics reflect the saved KNN evaluation: ${evaluationResults.accuracy.toFixed(2)}% accuracy across ${evaluationResults.total.toLocaleString()} independent MNIST test images using K = ${evaluationResults.k}.`

    : "No measured performance is available yet. Run the evaluation in Model Analytics to display real KNN results here."}

</div>

    </div>

  );

}

function PlaceholderPage({ title, description, icon: Icon }) {

  return (

    <div className="page-content placeholder-page">

      <div className="eyebrow">

        <span className="eyebrow-dot" /> DIGITAI WORKSPACE

      </div>

      <div className="placeholder-card">

        <div className="placeholder-icon">

          <Icon size={28} />

        </div>

        <h1>{title}</h1>

        <p>{description}</p>

        <span className="coming-soon">

          <span /> BUILDING THIS SECTION

        </span>

      </div>

    </div>

  );

}

function App() {

  const [mobileOpen, setMobileOpen] = useState(false);

  return (

    <div className="app-shell">

      <Sidebar

        mobileOpen={mobileOpen}

        closeMobile={() => setMobileOpen(false)}

      />

      <div className="main-area">

        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route path="/recognition" element={<Recognition />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/history" element={<PredictionHistory />} />

          <Route path="/about" element={<About />} />

          <Route path="*" element={<Dashboard />} />

        </Routes>

        <footer className="app-footer">

          <span>

            DigitAI <span className="footer-separator">·</span> Handwritten

            Digit Classification

          </span>

          <span>

            Built for learning <span className="footer-separator">·</span> Browser-based KNN

          </span>

        </footer>

      </div>

    </div>

  );

}

export default App;

