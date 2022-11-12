import http from "http";
import { chromium } from "playwright";
import { resolve } from "path";
import sirv from "sirv";
import polka from "polka";
import { fileURLToPath } from "url";
chromium.launch();

const root = resolve(fileURLToPath(import.meta.url), "../..");
const staticPath = resolve(root, "playground/dist");
// const handler = require('serve-handler');

// Init `sirv` handler
const PORT = 8288;

const URL = `http://localhost:${PORT}`;

polka()
  .use(sirv(staticPath))
  .listen(PORT, (err: any) => {
    if (err) throw err;
    console.log(`> Served on :${URL}~!`);
  });

const browser = await chromium.launch();
console.log("> Browser initialed");
const page = await browser.newPage();

console.log("> New page created");

const pageErrors: Error[] = [];
const consoleLogs: { type: string; text: string }[] = [];

page.on("console", (message) => {
  consoleLogs.push({
    type: message.type(),
    text: message.text(),
  });
});

page.on("pageerror", (err) => {
  pageErrors.push(err);
});

await page.goto(URL);
console.log("> Navigate");

// console.log({
//   pageErrors,
//   consoleLogs,
// });
let hasError = false;
pageErrors.forEach((err) => {
  hasError = true;
  console.error(err);
});
consoleLogs.forEach((log) => {
  if (log.type === "error") {
    hasError = true;
  }
  console[log.type](log.text);
});

if (hasError) {
  process.exit(1);
} else {
  console.log("No error found");
  process.exit(0);
}
