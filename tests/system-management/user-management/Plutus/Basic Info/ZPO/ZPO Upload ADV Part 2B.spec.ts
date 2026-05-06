import {expect, test} from "@playwright/test";
import {rm} from "node:fs/promises";
import {basename} from "node:path";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {createDummyPdf} from "@/utils/pdf";

const TARGET_USER_SEARCH = "zoe.qautomation+advisor@gmail.com";

async function assertCanUploadAdvPart2B(
  browser: import("@playwright/test").Browser,
) {
  const filePath = await createDummyPdf("zpo", "upload-adv-part-2b");
  const fileName = basename(filePath);
  let context:
    | Awaited<ReturnType<typeof browser.newContext>>
    | undefined;
  let page:
    | Awaited<ReturnType<Awaited<ReturnType<typeof browser.newContext>>["newPage"]>>
    | undefined;

  try {
    context = await browser.newContext({
      storageState: AUTH_STORAGE_STATE.zpo,
    });
    page = await context.newPage();

    const usersPage = new UsersManagementPage(page, requireDashboardBaseUrl());
    const basicInfoPage = new BasicInfoPage(page);

    await usersPage.goto();
    await usersPage.openUserBySearch(TARGET_USER_SEARCH);
    await basicInfoPage.waitUntilLoaded();

    await basicInfoPage.clearUploadedAdvPart2BDocuments();
    await basicInfoPage.uploadAdvPart2BDocument(filePath);

    await expect(basicInfoPage.getUploadedAdvPart2BFileName(fileName)).toBeVisible();
    await expect(basicInfoPage.advPart2BPreviewLink).toBeVisible();
  } finally {
    if (page) {
      const basicInfoPage = new BasicInfoPage(page);
      await basicInfoPage.clearUploadedAdvPart2BDocuments().catch(() => {});
    }
    await context?.close().catch(() => {});
    await rm(filePath, {force: true}).catch(() => {});
  }
}

test.describe("ZPO Upload ADV Part 2B", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("ZPO can upload ADV Part 2B document", async ({browser}) => {
    qase.id(2120);
    await assertCanUploadAdvPart2B(browser);
  });
});
