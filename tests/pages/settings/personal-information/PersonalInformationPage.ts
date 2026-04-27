import {expect, type Locator, type Page} from "@playwright/test";

const PERSONAL_INFORMATION_PATH = "/dashboard/settings/personal-information";

export class PersonalInformationPage {
  constructor(private readonly page: Page) {}

  get personalInformationHeading(): Locator {
    return this.page.getByRole("heading", {name: "Personal Information"});
  }

  get readonlyMessage(): Locator {
    return this.page.getByText(
      "This information can only be updated by another ZPO or PM.",
      {exact: true},
    );
  }

  get firstNameInput(): Locator {
    return this.page.getByRole("textbox", {name: "First Name"});
  }

  get lastNameInput(): Locator {
    return this.page.getByRole("textbox", {name: "Last Name"});
  }

  get emailInput(): Locator {
    return this.page.getByRole("textbox", {name: "Email"});
  }

  get phoneNumberInput(): Locator {
    return this.page.getByRole("textbox", {name: "Phone Number"});
  }

  get saveChangesButton(): Locator {
    return this.page.getByRole("button", {name: "Save Changes"});
  }

  async waitUntilLoaded() {
    await expect(this.page).toHaveURL(
      new RegExp(`${PERSONAL_INFORMATION_PATH.replace(/\//g, "\\/")}$`),
    );
    await expect(this.personalInformationHeading).toBeVisible();
  }
}
