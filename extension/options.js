// Token lives in chrome.storage.local on this device only — never Chrome sync,
// never the Vinted page. Sent only to resaleiq.dev from the service worker.
const status = document.getElementById("status");
const tok = document.getElementById("tok");
const msg = document.getElementById("msg");

function paintStatus(connected) {
  status.className = "status" + (connected ? "" : " off");
  status.textContent = connected
    ? "Connected — checks count against your plan."
    : "Not signed in — using free daily checks.";
}

async function refresh() {
  const { riq_token } = await chrome.storage.local.get("riq_token");
  paintStatus(!!(riq_token && String(riq_token).trim()));
}

document.getElementById("signin").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://resaleiq.dev/login" });
});

document.getElementById("disconnect").addEventListener("click", async () => {
  await chrome.storage.local.set({ riq_token: "" });
  tok.value = "";
  msg.textContent = "Disconnected.";
  paintStatus(false);
});

document.getElementById("save").addEventListener("click", async () => {
  const value = tok.value.trim();
  await chrome.storage.local.set({ riq_token: value });
  tok.value = "";
  msg.textContent = value ? "Saved." : "Cleared — using free checks.";
  paintStatus(!!value);
});

refresh();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.riq_token) refresh();
});
