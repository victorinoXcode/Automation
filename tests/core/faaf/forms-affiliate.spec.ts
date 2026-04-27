import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";
import {env} from "@/commons/env";
import {FaafFormsPage} from "@/pages/core/portal/FaafFormsPage";

const AFFILIATES: Array<{name: string; pathSlug: string; qaseId: number}> = [
  {name: "Bankrate", pathSlug: "bankrate", qaseId: 1980},
  {name: "Nerdwallet", pathSlug: "nerdwallet", qaseId: 1981},
  {name: "Moneywise", pathSlug: "moneywise", qaseId: 1982},
  {name: "USA-Today", pathSlug: "usa-today", qaseId: 1983},
  {name: "Forbes-Advisor", pathSlug: "forbes-advisor", qaseId: 1984},
  {name: "Money Talks news", pathSlug: "moneytalksnews", qaseId: 1985},
  {name: "MyBankTracker", pathSlug: "mybanktracker", qaseId: 1986},
  {name: "CNN", pathSlug: "cnn", qaseId: 1987},
  {name: "US News", pathSlug: "usnews", qaseId: 1988},
  {name: "Money", pathSlug: "money", qaseId: 1989},
  {name: "Investopedia", pathSlug: "investopedia", qaseId: 1990},
  {name: "Investor.com", pathSlug: "investor", qaseId: 1991},
  {name: "Generic for Marketplace (expertise.com)", pathSlug: "expertise", qaseId: 1992},
  {name: "Betterbuck.net", pathSlug: "betterbuck", qaseId: 1993},
  {name: "FinanceBuzz", pathSlug: "financebuzz", qaseId: 1994},
  {name: "Consumer Voice", pathSlug: "consumervoice", qaseId: 1995},
  {name: "Fortune Recommends", pathSlug: "fortune", qaseId: 1996},
  {name: "Kiplinger", pathSlug: "kiplinger", qaseId: 1997},
  {name: "Yep Ads", pathSlug: "yep-ads", qaseId: 1998},
  {name: "Synergy", pathSlug: "synergy", qaseId: 1999},
  {name: "Joywallet", pathSlug: "joywallet", qaseId: 2000},
  {name: "Reddit", pathSlug: "reddit", qaseId: 2001},
  {name: "Hearst", pathSlug: "hearst", qaseId: 2002},
  {name: "24/7 Wallstreet", pathSlug: "247wallst", qaseId: 2003},
  {name: "Morning Download", pathSlug: "morning-download", qaseId: 2004},
  {name: "Prime Women", pathSlug: "prime-women", qaseId: 2005},
  {name: "Moby", pathSlug: "moby", qaseId: 2006},
  {name: "Money Crashers", pathSlug: "money-crashers", qaseId: 2007},
  {name: "Kiplinger", pathSlug: "kiplinger-1", qaseId: 2008},
  {name: "Kiplinger", pathSlug: "kiplinger-2", qaseId: 2009},
  {name: "Kiplinger", pathSlug: "kiplinger-3", qaseId: 2010},
];

for (const {name: affiliate, pathSlug, qaseId} of AFFILIATES) {
  test.describe(`${affiliate} (${pathSlug}) Form Happy Path`, () => {
    test.beforeEach(async ({page}) => {
      await page.addInitScript(() => {
        indexedDB.deleteDatabase("localforage");
      });
    });

    test(`Should be able to fill ${affiliate} Form on boarding form`, async ({
      page,
    }) => {
      qase.id(qaseId);
      const baseUrl = env.BASE_URL_PORTAL;
      if (!baseUrl) throw new Error("BASE_URL_PORTAL must be set in .env");
      await page.goto(`${baseUrl}/forms/${pathSlug}`);
      await page.waitForTimeout(4000);
      const faaf = new FaafFormsPage(page);
      await faaf.faafAffiliate(affiliate);
      const sidebarMatchItems = faaf.leftMenuItemsBelowAdvisorMatches;
      await expect(sidebarMatchItems.first()).toBeVisible({timeout: 15_000});
      const count = await sidebarMatchItems.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
}
