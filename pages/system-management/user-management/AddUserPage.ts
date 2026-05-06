import {expect, type Locator, type Page} from "@playwright/test";

const DEFAULT_ROLE_NAME = "Advisor as Rep";

export class AddUserPage {
  constructor(private readonly page: Page) {}

  get firstNameInput(): Locator {
    return this.page
      .getByRole("textbox", {name: "First Name"})
      .or(this.page.getByLabel("First Name"));
  }

  get lastNameInput(): Locator {
    return this.page
      .getByRole("textbox", {name: "Last Name"})
      .or(this.page.getByLabel("Last Name"));
  }

  get emailInput(): Locator {
    return this.page
      .getByRole("textbox", {name: "Email"})
      .or(this.page.getByLabel("Email"));
  }

  get phoneNumberInput(): Locator {
    return this.page
      .getByRole("textbox", {name: "Phone Number"})
      .or(this.page.getByLabel("Phone Number"));
  }

  get companyCombobox(): Locator {
    return this.page
      .getByRole("combobox", {name: /company/i})
      .or(this.page.getByLabel("Company"))
      .or(this.page.getByRole("combobox").first())
      .or(this.page.locator('input[name*="company" i]').first());
  }

  get createUserButton(): Locator {
    return this.page.getByRole("button", {
      name: /add new user|create user|save changes/i,
    });
  }

  get successMessage(): Locator {
    return this.page.getByText(/changes saved successfully|user created/i).first();
  }

  get createUserErrorDialog(): Locator {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByText(/error creating user/i),
    });
  }

  get pageHeading(): Locator {
    return this.page.getByRole("heading", {
      name: /add new user|create new user/i,
    });
  }

  getRoleRadio(roleName: string): Locator {
    return this.page.getByRole("radio", {name: roleName, exact: true});
  }

  async waitUntilLoaded(roleName = DEFAULT_ROLE_NAME) {
    await expect(
      this.pageHeading.or(this.firstNameInput),
    ).toBeVisible({timeout: 20_000});
    await expect(this.getRoleRadio(roleName)).toBeVisible({timeout: 20_000});
    await expect(this.createUserButton).toBeVisible({timeout: 20_000});
  }

  async fillUserDetails(details: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company?: string;
    role?: string;
  }) {
    await this.selectRole(details.role ?? DEFAULT_ROLE_NAME);
    await expect(this.firstNameInput).toBeEnabled({timeout: 10_000});
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.emailInput.fill(details.email);
    await this.phoneNumberInput.fill(details.phoneNumber);
    if (details.company) {
      await this.selectCompany(details.company);
    }
  }

  async selectRole(roleName: string) {
    const roleRadio = this.getRoleRadio(roleName);
    await roleRadio.scrollIntoViewIfNeeded();
    await roleRadio.click({force: true});
  }

  async selectCompany(companyName: string) {
    await this.companyCombobox.click();
    if (await this.companyCombobox.isEditable().catch(() => false)) {
      await this.companyCombobox.fill(companyName);
    } else {
      await this.page.keyboard.type(companyName);
    }

    const companyOption = this.page.getByRole("option", {
      name: new RegExp(companyName, "i"),
    });
    const companyTextOption = this.page.getByText(new RegExp(`^${companyName}$`, "i"));

    if (await companyOption.isVisible().catch(() => false)) {
      await companyOption.click();
    } else if (await companyTextOption.isVisible().catch(() => false)) {
      await companyTextOption.click();
    } else {
      await this.companyCombobox.press("ArrowDown");
      await this.companyCombobox.press("Enter");
    }

  }

  async submit() {
    await expect(this.createUserButton).toBeEnabled({timeout: 15_000});
    await this.createUserButton.click();
  }

  async waitForCreateResult() {
    const createError = this.createUserErrorDialog
      .waitFor({state: "visible", timeout: 30_000})
      .then(async () => {
        const message = (
          await this.createUserErrorDialog.textContent().catch(() => "")
        )?.trim();
        throw new Error(message || "Error creating user");
      });

    await Promise.race([
      this.page.waitForURL(/\/dashboard\/management\/users\/.+\/basic-info/i, {
        timeout: 30_000,
      }),
      this.page.waitForURL(/\/dashboard\/management\/users$/i, {
        timeout: 30_000,
      }),
      this.successMessage.waitFor({state: "visible", timeout: 30_000}),
      createError,
    ]);
  }
}
