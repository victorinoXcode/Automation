import {type Page} from "@playwright/test";

export type LoginUser = {email: string; password: string};

/**
 * Page Object for the dashboard login flow.
 * Used in auth.setup and in tests that require explicit login.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(baseUrl: string) {
    await this.page.goto(baseUrl, {waitUntil: "domcontentloaded"});
  }

  async fillEmail(email: string) {
    await this.page.locator("#username").fill(email);
  }

  async clickContinue() {
    await this.page.getByRole("button", {name: "Continue"}).click();
  }

  async fillPassword(password: string) {
    await this.page.locator("#password").fill(password);
  }

  async submit(password: string) {
    await this.fillPassword(password);
    await this.clickContinue();
  }

  /** Full login: email → Continue → wait for password → password → Continue */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.page
      .locator("#password")
      .waitFor({state: "visible", timeout: 15_000});
    await this.submit(password);
  }

  /** Login with user object (same as login, for compatibility with Cypress-style API). */
  async loginAsAdmin(user: LoginUser) {
    await this.login(user.email, user.password);
  }

  /** Trigger forgot password: click link and fill email. */
  async forgotPasswordLogin(email: string) {
    await this.page.getByRole("link", {name: /forgot password/i}).click();
    await this.page.locator("#username").fill(email);
    await this.page.getByRole("button", {name: "Continue"}).click();
  }

  /** Core app: go to /login and click "Login as concierge". */
  async gotoCoreLoginAsConcierge(baseUrl: string) {
    await this.page.setViewportSize({width: 1050, height: 800});
    await this.page.goto(`${baseUrl}/login`, {waitUntil: "domcontentloaded"});
    await this.page.getByRole("link", {name: /login as concierge/i}).click();
  }
}
