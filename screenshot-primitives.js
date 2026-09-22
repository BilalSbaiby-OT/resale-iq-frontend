const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SCRATCH = process.env.TMPDIR || "/tmp";
const BASE_URL = "http://localhost:3099/design-preview";

async function screenshot(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  // let client-side styles inject
  await page.waitForTimeout(800);
  const file = path.join(SCRATCH, name);
  await page.screenshot({ path: file, fullPage: true });
  console.log("SAVED:", file);
  return file;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const desktop = await screenshot(page, "design-preview-1440.png", { width: 1440, height: 900 });
  const mobile  = await screenshot(page, "design-preview-390.png",  { width: 390,  height: 844 });

  await browser.close();

  const desktopExists = fs.existsSync(desktop);
  const mobileExists  = fs.existsSync(mobile);
  console.log("desktop:", desktop, desktopExists ? "OK" : "MISSING");
  console.log("mobile:", mobile, mobileExists ? "OK" : "MISSING");
})();
