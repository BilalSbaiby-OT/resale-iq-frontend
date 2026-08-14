// Stored with chrome.storage.sync and sent only to resaleiq.dev, from the
// service worker. It is never exposed to the Vinted page.
const tok = document.getElementById("tok");
const msg = document.getElementById("msg");
chrome.storage.sync.get("riq_token").then(({ riq_token }) => {
  if (riq_token) tok.value = riq_token;
});
document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.sync.set({ riq_token: tok.value.trim() });
  msg.textContent = tok.value.trim() ? "Saved." : "Cleared — using free checks.";
});
