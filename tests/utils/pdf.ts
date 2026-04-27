import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {tmpdir} from "node:os";

import {type AuthRole} from "@/commons/auth";

function buildDummyPdfContent(title: string) {
  return [
    "%PDF-1.1",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "endobj",
    "3 0 obj",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "endobj",
    "4 0 obj",
    "<< /Length 44 >>",
    "stream",
    "BT",
    "/F1 18 Tf",
    "72 96 Td",
    `(${title}) Tj`,
    "ET",
    "endstream",
    "endobj",
    "5 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "endobj",
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "0000000010 00000 n ",
    "0000000063 00000 n ",
    "0000000122 00000 n ",
    "0000000248 00000 n ",
    "0000000342 00000 n ",
    "trailer",
    "<< /Root 1 0 R /Size 6 >>",
    "startxref",
    "412",
    "%%EOF",
    "",
  ].join("\n");
}

export async function createDummyPdf(role: AuthRole, fileLabel: string) {
  const directory = join(tmpdir(), "zoe-playwright-dummies");
  const filePath = join(directory, `${role}-${fileLabel}-${Date.now()}.pdf`);

  await mkdir(directory, {recursive: true});
  await writeFile(filePath, buildDummyPdfContent("Dummy ADV Part 2B"), "utf8");

  return filePath;
}
