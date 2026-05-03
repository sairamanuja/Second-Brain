const API_URL = "http://localhost:3000/api/v1";

// check if already logged in
chrome.storage.local.get("token", (data) => {
  if (data.token) {
    showLoggedIn();
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  if (!username || !password) {
    errorEl.textContent = "Fill in both fields";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      chrome.storage.local.set({ token: data.token });
      showLoggedIn();
    } else {
      errorEl.textContent = data.message || "Login failed";
    }
  } catch (err) {
    errorEl.textContent = "Can't connect to server";
  }
});

document.getElementById("add-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("add-status");
  statusEl.style.color = "#888";
  statusEl.textContent = "Saving...";

  const data = await chrome.storage.local.get("token");
  if (!data.token) {
    showLogin();
    return;
  }

  // get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const title = tab.title || "Untitled";

  // only http/https pages can be saved — chrome:// and devtools:// urls will fail server validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    statusEl.style.color = "#ef4444";
    statusEl.textContent = "Can't save this page";
    return;
  }

  let type = "article";
  if (url.includes("twitter.com") || url.includes("x.com")) type = "twitter";
  else if (url.includes("youtube.com") || url.includes("youtu.be")) type = "youtube";

  try {
    const res = await fetch(`${API_URL}/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.token}`
      },
      body: JSON.stringify({ link: url, title, type, content: "" })
    });

    if (res.ok) {
      statusEl.style.color = "#16a34a";
      statusEl.textContent = "Saved!";
      setTimeout(() => { statusEl.textContent = ""; }, 2000);
    } else {
      const body = await res.json().catch(() => ({}));
      statusEl.style.color = "#ef4444";
      statusEl.textContent = body.message || `Error ${res.status}`;
    }
  } catch (err) {
    statusEl.style.color = "#ef4444";
    statusEl.textContent = "Can't connect to server";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  chrome.storage.local.remove("token");
  showLogin();
});

function showLoggedIn() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("logged-in-view").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("logged-in-view").classList.add("hidden");
}
