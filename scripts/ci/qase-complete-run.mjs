import {readFileSync} from "node:fs";

const token = process.env.QASE_TESTOPS_API_TOKEN ?? process.env.QASE_TOKEN;
const projectCode = process.env.QASE_TESTOPS_PROJECT ?? process.env.QASE_PROJECT;
const runIdPath = process.env.QASE_RUN_ID_FILE ?? ".qase/run-id.txt";
const runId = readFileSync(runIdPath, "utf8").trim();

if (!token) {
  throw new Error("Missing QASE_TESTOPS_API_TOKEN/QASE_TOKEN");
}

if (!projectCode) {
  throw new Error("Missing QASE_TESTOPS_PROJECT/QASE_PROJECT");
}

if (!runId) {
  throw new Error(`Missing run id in ${runIdPath}`);
}

const response = await fetch(
  `https://api.qase.io/v1/run/${projectCode}/${runId}/complete`,
  {
    method: "POST",
    headers: {
      Token: token,
      Accept: "application/json",
    },
  },
);

if (!response.ok) {
  throw new Error(`Qase complete run failed with status ${response.status}`);
}

console.log(`Completed Qase run ${runId}`);
