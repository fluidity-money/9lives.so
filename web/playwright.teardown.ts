import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import EC from "eight-colors";
import { addCoverageReport } from "monocart-reporter";
import { CDPClient } from "monocart-coverage-reports";
import { PlaywrightTestConfig, TestInfo } from "@playwright/test";

const globalTeardown = async (config: PlaywrightTestConfig) => {
  console.log("globalTeardown ...");

  // [WebServer] the --inspect option was detected, the Next.js router server should be inspected at port 9230.
  const client = await CDPClient({
    port: 9230,
  });

  if (!client) {
    EC.logRed("not found CDPClient");
    return;
  }

  const dir = await client.writeCoverage();
  await client.stopCoverage();

  if (!fs.existsSync(dir)) {
    EC.logRed("not found coverage dir");
    return;
  }

  const files = fs.readdirSync(dir);
  for (const filename of files) {
    const content = fs
      .readFileSync(path.resolve(dir, filename))
      .toString("utf-8");
    const json = JSON.parse(content);
    let coverageList = json.result;

    // filter node internal files
    coverageList = coverageList.filter(
      (entry: { url: string }) => entry.url && entry.url.startsWith("file:"),
    );

    coverageList = coverageList.filter((entry: { url: string }) =>
      entry.url.includes("next/server/app"),
    );

    coverageList = coverageList.filter(
      (entry: { url: string }) => !entry.url.includes("manifest.js"),
    );

    if (!coverageList.length) {
      continue;
    }

    // console.log(coverageList.map((entry) => entry.url));

    // attached source content
    coverageList.forEach((entry: { url: string; source: string }) => {
      const filePath = fileURLToPath(entry.url);
      if (fs.existsSync(filePath)) {
        entry.source = fs.readFileSync(filePath).toString("utf8");
      } else {
        EC.logRed("not found file", filePath);
      }
    });

    // there is no test info on teardown, just mock one with required config
    const mockTestInfo = {
      config,
    } as TestInfo;
    await addCoverageReport(coverageList, mockTestInfo);
  }
};

export default globalTeardown;
