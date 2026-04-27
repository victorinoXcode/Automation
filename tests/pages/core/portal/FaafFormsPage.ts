import {type Locator, type Page} from "@playwright/test";

import {
  getRandomNumber,
  getRandomNumberWithZero,
  randomIntFromInterval,
} from "@/utils/math";

export class FaafFormsPage {
  private static readonly affiliatesWithExtraSidebarLogo = new Set<string>([
    // Legacy names (kept for backward compatibility)
    "Forbes",
    "NerdWallet",
    "Bankrate",
    "Fortune",
    "Investor",
    "PrimeWomen",
    "USAToday",
    "YepAds",

    // Current names from affiliate catalog
    "Nerdwallet",
    "Moneywise",
    "USA-Today",
    "Forbes-Advisor",
    "Money Talks news",
    "MyBankTracker",
    "CNN",
    "US News",
    "Money",
    "Investopedia",
    "Investor.com",
    "Betterbuck.net",
    "FinanceBuzz",
    "Fortune Recommends",
    "Kiplinger",
    "Yep Ads",
    "Joywallet",
    "24/7 Wallstreet",
  ]);

  constructor(private readonly page: Page) {}

  // ─── Localizadores: Getting Started form ─────────────────────────────────
  get nameInput(): Locator {
    return this.page.getByTestId("name-input");
  }
  get lastNameInput(): Locator {
    return this.page.getByTestId("last-name-input");
  }
  get emailInput(): Locator {
    return this.page.getByTestId("email-input");
  }
  get ageInput(): Locator {
    return this.page.getByTestId("age-input");
  }
  get locationInput(): Locator {
    return this.page.getByTestId("location-input");
  }
  get salaryInput(): Locator {
    return this.page.getByTestId("salary-input");
  }
  get assetInput(): Locator {
    return this.page.getByTestId("asset-input");
  }
  get mobileInput(): Locator {
    return this.page.getByTestId("mobile-input");
  }
  get buttonGetMyTop3Advisors(): Locator {
    return this.page.getByRole("button", {name: "Get My Top 3 Advisors"});
  }

  // ─── Localizadores: formularios affiliate / find-an-advisor (estilos module) ─
  /** Main content area for scoping find-an-advisor / affiliate flows (avoids header/footer). */
  get letsStartButton(): Locator {
    return this.page.getByRole("button", {name: "Let's Start"});
  }
  get mainContent(): Locator {
    return this.page.locator("main").first();
  }
  get baseInputWrapper(): Locator {
    return this.page.locator('[class*="styles-module_baseInput__inputWrapper__"]');
  }
  get buttonContinueModule(): Locator {
    return this.page
      .locator('[class*="styles-module_button__"]')
      .getByText("Continue");
  }
  get inputLocationById(): Locator {
    return this.page.locator('input[id="location"]').last();
  }

  get radioHasAdvisorNo(): Locator {
    return this.page.getByText("No");
  }
  get radioFinancialGoals(): Locator {
    return this.page.getByRole("radio", {name: /financial_goals/i});
  }
  get stepWrapperContinueButton(): Locator {
    return this.page
      .locator('[class*="styles_stepWrapper__controls_continue__"]')
      .getByRole("button");
  }
  get affiliateFormInputs(): Locator {
    return this.page.locator("input");
  }
  /** Inputs scoped to main (find-an-advisor flow) to avoid header/footer fields. */
  get affiliateFormInputsInMain(): Locator {
    return this.mainContent.locator("input");
  }

  // ─── Localizadores: onboarding / advisor-match (form-layout) ─────────────
  get headingHowOldAreYou(): Locator {
    return this.page.getByText(/how old are you\?/i);
  }
  get firstTextbox(): Locator {
    return this.page.getByRole("textbox").first();
  }
  /** Botón Continue/Next del flujo (clase styles_button___bkq4, styles_button__blue__..., etc.). */
  get formLayoutNextButton(): Locator {
    return this.page
      .locator('button[type="button"]')
      .filter({hasText: "Continue"});
  }

  get investmentsCard(): Locator {
    return this.page.getByText("Investments");
  }
  get investmentAccountsCard(): Locator {
    return this.page.getByText("Investment Accounts");
  }
  get zuICardContainer(): Locator {
    return this.page.locator(".ZUICard__container");
  }
  get zuISliderInput(): Locator {
    return this.page.locator(".ZUISlider__input");
  }
  get zuISliderAssetsInput(): Locator {
    return this.page.locator(".ZUISlider > .ZUISlider__input");
  }
  get inputName(): Locator {
    return this.page.getByRole("textbox", {name: /first name/i});
  }
  get inputLastName(): Locator {
    return this.page.getByRole("textbox", {name: /last name/i});
  }
  get inputEmail(): Locator {
    return this.page.getByRole("textbox", {name: /email/i});
  }
  get inputMobile(): Locator {
    return this.page.getByRole("textbox", {name: /phone number/i});
  }
  get inputAgeOnboarding(): Locator {
    return this.page.getByRole('textbox', { name: 'number number' });
  }
  get inputLocationOnboarding(): Locator {
    return this.page.getByRole('textbox', { name: 'zip zip' });
  }
  get buttonTypeButton(): Locator {
    return this.page.getByRole("button", {name: /see advisor matches/i});
  }

  // ─── Localizadores compartidos ──────────────────────────────────────────
  get buttonContinue(): Locator {
    return this.page.getByRole("button", {name: "Continue"});
  }
  get agreementFooterCta(): Locator {
    return this.page.locator('[class*="styles_agreement__footer_cta__"]');
  }

  /** Tarjetas de advisor match (varias variantes por si el front cambia la clase). */
  get matchCards(): Locator {
    return this.page.locator(
      '.match-card, [class*="match-card"], [class*="MatchCard"], [class*="advisor-card"], [data-testid*="match"], [data-testid*="advisor-card"]',
    );
  }

  /**
   * Left sidebar menu items below the "Advisor matches" heading (match result links).
   */
  get leftMenuItemsBelowAdvisorMatches(): Locator {
    const navList = this.page.getByRole("navigation").first().getByRole("list").first();
    return navList.getByRole("listitem").filter({hasNotText: /Advisor Matches/i});
  }

  get affiliateSidebarLogo(): Locator {
    return this.page.getByRole('img', { name: 'affiliate' });
  }

  async validateAffiliateSidebarLogoIfRequired(affiliate: string) {
    if (!FaafFormsPage.affiliatesWithExtraSidebarLogo.has(affiliate)) {
      return;
    }
    await this.affiliateSidebarLogo.first().waitFor({
      state: "visible",
      timeout: 15_000,
    });
  }

  /** Mueve el slider hacia la derecha con N pulsaciones de ArrowRight (Playwright solo acepta una tecla por press). */
  private async moveSlider(locator: Locator, steps: number) {
    await locator.waitFor({state: "visible"});
    await locator.click();
    for (let i = 0; i < steps; i++) {
      await locator.press("ArrowRight");
      await this.page.waitForTimeout(50);
    }
  }

  // ─── Métodos de flujo ────────────────────────────────────────────────────

  async gettingStartedForm() {
    await this.nameInput.fill("Test Auto");
    await this.lastNameInput.fill("Playwright gettingStartedform");
    await this.emailInput.fill(`zoe.prospect+playwright${Date.now()}@gmail.com`);
    await this.buttonContinue.click();
    await this.page.waitForTimeout(4000);
    await this.ageInput.fill(String(randomIntFromInterval(19, 80)));
    await this.locationInput.fill("10010");
    await this.salaryInput.fill(String(randomIntFromInterval(200000, 560000)));
    await this.assetInput.fill(String(randomIntFromInterval(200000, 560000)));
    await this.buttonContinue.click();
    await this.mobileInput.fill("3102548452");
    await this.buttonGetMyTop3Advisors.click();
    await this.page.waitForTimeout(8000);
    await this.agreementFooterCta.click();
  }

  async faafAffiliate(affiliate: string) {
    await this.validateAffiliateSidebarLogoIfRequired(affiliate);
    if (affiliate === "Hearst" || affiliate === "Moby") {
      await this.letsStartButton.click();
      await this.page.waitForTimeout(2000);
    }
    await this.radioHasAdvisorNo.click();
    await this.page.waitForTimeout(2000);
    const age = String(randomIntFromInterval(21, 55));
    await this.firstTextbox.waitFor({state: "visible", timeout: 15_000});
    await this.firstTextbox.fill(age);
    await this.page.waitForTimeout(2000);
    await this.formLayoutNextButton.click();
    await this.firstTextbox.waitFor({state: "visible", timeout: 15_000});
    await this.firstTextbox.fill("10010");
    await this.formLayoutNextButton.click();
    await this.page.waitForTimeout(3000);
    await this.investmentsCard.waitFor({state: "visible", timeout: 15_000});
    await this.investmentsCard.click();
    await this.formLayoutNextButton.click();
    await this.moveSlider(this.zuISliderInput.first(), 14);
    await this.formLayoutNextButton.click();
    await this.page.waitForTimeout(3000);
    await this.investmentAccountsCard.click();
    await this.formLayoutNextButton.click();
    await this.page.waitForTimeout(3000);
    await this.moveSlider(this.zuISliderInput.first(), 14);;
    await this.formLayoutNextButton.click();
    await this.inputName.waitFor({ state: "visible", timeout: 10000 });
    await this.validateAffiliateSidebarLogoIfRequired(affiliate);
    await this.inputName.fill("Test Auto");
    await this.inputLastName.fill(`Playwright ${affiliate}`);
    await this.inputEmail.fill(`zoe.prospect+playwright${Date.now()}@gmail.com`);
    await this.inputMobile.fill("3102548452");
    await this.buttonTypeButton.click();
    await this.leftMenuItemsBelowAdvisorMatches.first().waitFor({
      state: "visible",
      timeout: 25_000,
    });
    await this.agreementFooterCta.click();
    await this.page.waitForTimeout(2000);
   
  }

  async advisorMatch() {
    await this.headingHowOldAreYou.waitFor({state: "visible"});
    const age = String(randomIntFromInterval(21, 55));
    await this.firstTextbox.waitFor({state: "visible", timeout: 15_000});
    await this.firstTextbox.fill(age);
    await this.formLayoutNextButton.click();
    await this.firstTextbox.waitFor({state: "visible", timeout: 15_000});
    await this.firstTextbox.fill("10010");
    await this.formLayoutNextButton.click();
    await this.zuICardContainer.nth(getRandomNumberWithZero(5)).click();
    await this.formLayoutNextButton.click();
    await this.moveSlider(this.zuISliderInput.first(), 14);
    await this.formLayoutNextButton.click();
    await this.zuICardContainer.nth(getRandomNumberWithZero(5)).click();
    await this.formLayoutNextButton.click();
    await this.moveSlider(this.zuISliderAssetsInput.nth(1), getRandomNumber(22));
    await this.formLayoutNextButton.click();
    await this.inputName.fill("Test Auto");
    await this.inputLastName.fill("Playwright AdvisorMatch");
    await this.inputEmail.fill(`zoe.prospect+playwright${Date.now()}@gmail.com`);
    await this.inputMobile.fill("3102548452");
    await this.buttonTypeButton.click();
    await this.page.waitForTimeout(5000);
    await this.agreementFooterCta.click();
    await this.page.waitForTimeout(5000);
    
  }

  /**
   * Fills the Find-an-advisor flow and submits. This flow redirects to
   * /dashboard/advisors with no agreement step (unlike advisorMatch / faafAffiliate).
   */
  async findAnAdvisorForm() {

    await this.radioHasAdvisorNo.click();
    await this.page.waitForTimeout(2000);
    const age = String(randomIntFromInterval(21, 55));
    await this.firstTextbox.waitFor({state: "visible", timeout: 15_000});
    await this.firstTextbox.fill(age);
    await this.page.waitForTimeout(2000);
    await this.formLayoutNextButton.click();
    await this.firstTextbox.waitFor({state: "visible", timeout: 15_000});
    await this.firstTextbox.fill("10010");
    await this.formLayoutNextButton.click();
    await this.page.waitForTimeout(3000);
    await this.investmentsCard.waitFor({state: "visible", timeout: 15_000});
    await this.investmentsCard.click();
    await this.formLayoutNextButton.click();
    await this.moveSlider(this.zuISliderInput.first(), 14);
    await this.formLayoutNextButton.click();
    await this.page.waitForTimeout(3000);
    await this.investmentAccountsCard.click();
    await this.formLayoutNextButton.click();
    await this.page.waitForTimeout(3000);
    await this.moveSlider(this.zuISliderInput.first(), 14);;
    await this.formLayoutNextButton.click();
    await this.inputName.waitFor({ state: "visible", timeout: 10000 });
    await this.inputName.fill("Test Auto");
    await this.inputLastName.fill("Playwright AdvisorMatch");
    await this.inputEmail.fill(`zoe.prospect+playwright${Date.now()}@gmail.com`);
    await this.inputMobile.fill("3102548452");
    await this.buttonTypeButton.click();
    await this.leftMenuItemsBelowAdvisorMatches.first().waitFor({
      state: "visible",
      timeout: 25_000,
    });
    await this.agreementFooterCta.click();
    await this.page.waitForTimeout(3000);
  }

  async faafMatches(userInfo: {
    age: number;
    zipcode: number;
    needHelpwith: number;
    annualIncome: number;
    assets: number;
    assetSelected: number;
  }) {
    await this.page.context().clearCookies();
    await this.page.waitForTimeout(3000);
    await this.inputAgeOnboarding.fill(String(userInfo.age));
    await this.formLayoutNextButton.click();
    await this.inputLocationOnboarding.fill(String(userInfo.zipcode));
    await this.formLayoutNextButton.click();
    await this.zuICardContainer.nth(userInfo.needHelpwith).click();
    await this.formLayoutNextButton.click();
    if (userInfo.annualIncome > 0) {
      await this.moveSlider(
        this.zuISliderInput.first(),
        userInfo.annualIncome,
      );
      await this.formLayoutNextButton.click();
    } else {
      await this.formLayoutNextButton.click();
    }
    await this.zuICardContainer.nth(userInfo.assets).click();
    await this.formLayoutNextButton.click();
    if (userInfo.assetSelected > 0) {
      await this.moveSlider(
        this.zuISliderAssetsInput.nth(1),
        userInfo.assetSelected,
      );
      await this.formLayoutNextButton.click();
    } else {
      await this.formLayoutNextButton.click();
    }
    await this.inputName.fill("Testing-" + Date.now());
    await this.inputLastName.fill("Auto");
    await this.inputEmail.fill(`zoe.prospect+playwright${Date.now()}@gmail.com`);
    await this.inputMobile.fill("3102548452");
    await this.buttonTypeButton.click();
    await this.page.waitForTimeout(15_000);
  }

  async prospectOnBoarding() {
    await this.inputAgeOnboarding.fill(
      String(randomIntFromInterval(21, 99)),
    );
    await this.formLayoutNextButton.click({force: true});
    await this.inputLocationOnboarding.fill("10011");
    await this.formLayoutNextButton.click();
    await this.zuICardContainer.nth(getRandomNumberWithZero(5)).click();
    await this.formLayoutNextButton.click();
    await this.moveSlider(this.zuISliderInput.first(), 14);
    await this.formLayoutNextButton.click();
    await this.zuICardContainer.nth(getRandomNumberWithZero(5)).click();
    await this.formLayoutNextButton.click();
    await this.moveSlider(
      this.zuISliderAssetsInput.nth(1),
      getRandomNumber(22),
    );
    await this.formLayoutNextButton.click();
    await this.inputName.fill("Testing");
    await this.inputLastName.fill("Auto");
    await this.inputEmail.fill(`zoe.prospect+playwright${Date.now()}@gmail.com`);
    await this.inputMobile.fill("3102548452");
    await this.buttonTypeButton.click();
    await this.page.waitForTimeout(4000);
    await this.agreementFooterCta.click();
  }
}
