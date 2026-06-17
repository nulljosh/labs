const API_BASE = "/api";

const form = document.getElementById("search-form");
const dbSelect = document.getElementById("database");
const queryInput = document.getElementById("query");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

async function loadDatabases() {
  statusEl.textContent = "Loading databases...";
  try {
    const res = await fetch(`${API_BASE}/databases`);
    const data = await res.json();
    const databases = data.caseDatabases ?? [];
    dbSelect.innerHTML = databases
      .map((db) => `<option value="${db.databaseId}">${db.name}</option>`)
      .join("");
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "Could not load databases.";
  }
}

async function runSearch(e) {
  e.preventDefault();
  const databaseId = dbSelect.value;
  const q = queryInput.value.trim();
  if (!databaseId || !q) return;

  statusEl.textContent = "Searching...";
  resultsEl.innerHTML = "";

  try {
    const params = new URLSearchParams({ databaseId, q });
    const res = await fetch(`${API_BASE}/search?${params}`);
    const data = await res.json();
    const results = data.results ?? [];

    if (results.length === 0) {
      statusEl.textContent = "No results.";
      return;
    }

    statusEl.textContent = `${results.length} result(s)`;
    resultsEl.innerHTML = results
      .map((r) => {
        const caseId = r.caseId?.en ?? "";
        const url = `https://www.canlii.org/en/${caseId}`;
        return `<li>
          <a href="${url}" target="_blank" rel="noopener">${r.title}</a>
          ${r.citation ? `<div class="citation">${r.citation}</div>` : ""}
        </li>`;
      })
      .join("");
  } catch (err) {
    statusEl.textContent = "Search failed.";
  }
}

form.addEventListener("submit", runSearch);
loadDatabases();
