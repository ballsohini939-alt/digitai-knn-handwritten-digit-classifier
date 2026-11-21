
import { Navigate, Route, Routes } from "react-router-dom";
import Recognition from "./pages/Recognition";

function App() {
  return (
    <main className="app-shell">
      <Routes>
        <Route path="/" element={<Recognition />} />
        <Route path="/recognition" element={<Recognition />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
