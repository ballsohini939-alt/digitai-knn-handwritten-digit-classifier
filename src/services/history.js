
const STORAGE_KEY = "digitai_prediction_history";
export function getPredictionHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
export function savePrediction(record) {
  const history = getPredictionHistory();

  const updatedHistory = [record, ...history];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

  return updatedHistory;
}

export function deletePrediction(id) {
  const history = getPredictionHistory();
  const updatedHistory = history.filter((item) => item.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

  return updatedHistory;
}

export function clearPredictionHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
