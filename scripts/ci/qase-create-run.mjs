import {mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";

const token = process.env.QASE_TESTOPS_API_TOKEN ?? process.env.QASE_TOKEN;
const projectCode = process.env.QASE_TESTOPS_PROJECT ?? process.env.QASE_PROJECT;
const runTitle =
  process.env.QASE_TESTOPS_RUN_TITLE ??
  `Playwright Run ${new Date().toISOString().slice(0, 10)}`;
const runDescription =
  process.env.QASE_TESTOPS_RUN_DESCRIPTION ?? "Parallel Playwright pipeline run";
const outputPath = process.env.QASE_RUN_ID_FILE ?? ".qase/run-id.txt";
const ciProvider = process.env.GITHUB_ACTIONS
  ? "github-actions"
  : process.env.BITBUCKET_BUILD_NUMBER
    ? "bitbucket"
    : "local";

if (!token) {
  throw new Error("Missing QASE_TESTOPS_API_TOKEN/QASE_TOKEN");
}

if (!projectCode) {
  throw new Error("Missing QASE_TESTOPS_PROJECT/QASE_PROJECT");
}

const response = await fetch(`https://api.qase.io/v1/run/${projectCode}`, {
  method: "POST",
  headers: {
    Token: token,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    title: runTitle,
    description: runDescription,
    is_autotest: true,
    cases: [],
    tags: [ciProvider, "parallel"],
  }),
});

if (!response.ok) {
  throw new Error(`Qase create run failed with status ${response.status}`);
}

const payload = await response.json();
const runId = payload?.result?.id;

if (typeof runId !== "number") {
  throw new Error("Qase create run did not return a numeric run id");
}

mkdirSync(path.dirname(outputPath), {recursive: true});
writeFileSync(outputPath, `${runId}\n`, "utf8");

console.log(`Created Qase run ${runId}`);
