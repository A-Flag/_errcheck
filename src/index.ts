import http from "http";
import { chromium } from "playwright";
import sirv from "sirv";
import polka from "polka";
import c from "picocolors";
export type WaitUntil =
  | "load"
  | "domcontentloaded"
  | "networkidle"
  | "commit"
  | undefined;
chromium.launch();

interface Options {
  servePath: string;
  port?: number;
  waitUntil: WaitUntil;
}

export interface ErrorLog {
  type: "error";
  timestamp: number;
  error: unknown;
}
export interface ConsoleErrorLog {
  type: "console";
  timestamp: number;
  arguments: unknown[];
}

export type RuntimeErrorLog = ErrorLog | ConsoleErrorLog;

export async function serveAndCheck(options: Options) {
  // const handler = require('serve-handler');

  // Init `sirv` handler
  const { port = 8238, servePath, waitUntil = "networkidle" } = options;

  // const PORT = 8288;

  const URL = `http://localhost:${port}`;

  polka()
    .use(sirv(servePath))
    .listen(port, (err: any) => {
      if (err) throw err;
      console.log(`> Served on :${URL}~!`);
    });

  const browser = await chromium.launch();
  console.log("> Browser initialed");
  const page = await browser.newPage();

  console.log("> New page created");

  const errorLogs: RuntimeErrorLog[] = [];
  const pageErrors: Error[] = [];
  const consoleLogs: { type: string; text: string }[] = [];

  page.on("console", async (message) => {
    if (message.type() === "error") {
      errorLogs.push({
        type: "console",
        timestamp: Date.now(),
        arguments: await Promise.all(message.args().map((i) => i.jsonValue())),
      });
    }
    // consoleLogs.push({
    //   type: message.type(),
    //   text: message.text(),
    // });
  });

  page.on("pageerror", (err) => {
    // pageErrors.push(err);
    errorLogs.push({
      type: "error",
      timestamp: Date.now(),
      error: err,
    });
  });

  await page.goto(URL, { waitUntil });
  console.log("> Navigate");

  // console.log({
  //   pageErrors,
  //   consoleLogs,
  // });
  // let hasError = false;
  // let hasError = errorLogs.length;
  // pageErrors.forEach((err) => {
  //   hasError = true;
  //   console.error(err);
  // });
  // consoleLogs.forEach((log) => {
  //   if (log.type === "error") {
  //     hasError = true;
  //   }
  //   console[log.type](log.text);
  // });

  // if (hasError) {
  //   process.exit(1);
  // } else {
  //   console.log("No error found");
  //   process.exit(0);
  // }

  Promise.all([page.close(), browser.close()]).catch();
  return errorLogs;
}

export function printErrorLogs(logs: ErrorLog[]) {
  console.log(
    c.inverse(c.bold(c.red(" DEPLOY CHECK "))) +
      c.red(`${logs.length} Runtiom errors found`)
  );
  logs.forEach((log, idx) => {
    console.log(
      c.yellow(
        `---------${new Date(log.timestamp).toLocaleTimeString()} ${
          idx + 1
        } ----------`
      )
    );
    if (log.type === "error") {
      console.error(log.error);
    } else {
      console.error(...log.arguments);
    }
  });
}
