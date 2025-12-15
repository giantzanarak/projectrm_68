// src/api/stocksApi.js
const API_BASE = "http://localhost:8000";

export async function fetchStocks() {
  const res = await fetch(`${API_BASE}/stocks_get.php`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log("stocks from API:", data);
  return data;
}