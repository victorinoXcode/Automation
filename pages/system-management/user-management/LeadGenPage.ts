import {expect, type Locator, type Page} from "@playwright/test";

export type LeadGenProfileDetails = {
  zipCode: string;
};

export class LeadGenPage {
  constructor(private readonly page: Page) {}

  private dropdownContainerFollowingLabel(label: string): Locator {
    return this.page
      .locator(
        `xpath=//*[normalize-space(text())='${label}']/following::*[self::div or self::span][@class][.//*[@role='combobox']][1]`,
      )
      .first();
  }

  private comboboxFollowingLabel(label: string): Locator {
    return this.page
      .locator(
        `xpath=//*[normalize-space(text())='${label}']/following::*[@role='combobox'][1]`,
      )
      .first();
  }

  get leadGenTabLabel(): Locator {
    return this.page.getByRole("link", {name: /leadgen/i}).first();
  }

  get addLeadGenCardHeading(): Locator {
    return this.page.getByText("LeadGen Information", {exact: true});
  }

  get addLeadGenUserButton(): Locator {
    return this.page.getByRole("button", {name: /add leadgen user/i});
  }

  get saveChangesButton(): Locator {
    return this.page.getByRole("button", {name: /save changes/i}).first();
  }

  get saveSuccessDialog(): Locator {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByText("Changes saved successfully", {exact: true}),
    });
  }

  get saveSuccessCloseButton(): Locator {
    return this.saveSuccessDialog.getByRole("button", {name: /close modal/i});
  }

  get roleCombobox(): Locator {
    return this.comboboxFollowingLabel("Role");
  }

  get roleDropdownContainer(): Locator {
    return this.dropdownContainerFollowingLabel("Role");
  }

  get genderCombobox(): Locator {
    return this.comboboxFollowingLabel("Gender");
  }

  get genderDropdownContainer(): Locator {
    return this.dropdownContainerFollowingLabel("Gender");
  }

  get assetsMinInput(): Locator {
    return this.page.getByRole("textbox", {name: "Assets Min", exact: true});
  }

  get assetsMaxInput(): Locator {
    return this.page.getByRole("textbox", {name: "Assets Max", exact: true});
  }

  get incomeMinInput(): Locator {
    return this.page.getByRole("textbox", {name: "Income Min", exact: true});
  }

  get incomeMaxInput(): Locator {
    return this.page.getByRole("textbox", {name: "Income Max", exact: true});
  }

  get ageMinInput(): Locator {
    return this.page.getByRole("textbox", {name: "Age Min", exact: true});
  }

  get ageMaxInput(): Locator {
    return this.page.getByRole("textbox", {name: "Age Max", exact: true});
  }

  get zipCodeInput(): Locator {
    return this.page.getByRole("textbox", {name: "Zip Code", exact: true});
  }

  get cityInput(): Locator {
    return this.page.getByRole("textbox", {name: "City", exact: true});
  }

  get stateInput(): Locator {
    return this.page.getByRole("textbox", {name: "State", exact: true});
  }

  get leadGenNotEnabledHeading(): Locator {
    return this.page.getByText("LeadGen Not Enabled", {exact: true});
  }

  get goToCompanyButton(): Locator {
    return this.page.getByRole("button", {name: /go to company/i});
  }

  get disabledBadge(): Locator {
    return this.leadGenTabLabel.getByText("Disabled", {exact: true});
  }

  get enabledBadge(): Locator {
    return this.leadGenTabLabel.getByText("Enabled", {exact: true});
  }

  get algoOffBadge(): Locator {
    return this.leadGenTabLabel.getByText("Algo Off", {exact: true});
  }

  get publicProfileTab(): Locator {
    return this.page.getByRole("link", {name: /public profile/i});
  }

  get educationAndExperienceTab(): Locator {
    return this.page.getByRole("link", {name: /education and experience/i});
  }

  get algoStatusLabel(): Locator {
    return this.page.getByText("Algo Status", {exact: true});
  }

  get leadGenProfileFormMarker(): Locator {
    return this.roleCombobox.or(this.genderCombobox).first();
  }

  async open() {
    await this.leadGenTabLabel.click();

    await Promise.race([
      this.addLeadGenCardHeading.waitFor({state: "visible", timeout: 15_000}),
      this.addLeadGenUserButton.waitFor({state: "visible", timeout: 15_000}),
      this.leadGenProfileFormMarker.waitFor({state: "visible", timeout: 15_000}),
      this.leadGenNotEnabledHeading.waitFor({state: "visible", timeout: 15_000}),
    ]);

    if (await this.leadGenNotEnabledHeading.isVisible().catch(() => false)) {
      throw new Error(
        "LeadGen is not enabled for the selected company. The page shows 'LeadGen Not Enabled' and requires enabling it from company settings before adding a LeadGen user.",
      );
    }
  }

  async expectDisabledState() {
    await expect(this.disabledBadge).toBeVisible({timeout: 15_000});
    await expect(
      this.addLeadGenUserButton.or(this.leadGenNotEnabledHeading),
    ).toBeVisible({timeout: 15_000});
  }

  async addLeadGenUser() {
    await expect(this.addLeadGenUserButton).toBeEnabled({timeout: 15_000});
    await this.addLeadGenUserButton.click();
    await expect(this.roleCombobox).toBeVisible({timeout: 15_000});
  }

  async expectEnabledState() {
    await expect(this.addLeadGenUserButton).toBeHidden({timeout: 30_000});
    await Promise.race([
      this.enabledBadge.waitFor({state: "visible", timeout: 30_000}),
      this.algoOffBadge.waitFor({state: "visible", timeout: 30_000}),
      this.publicProfileTab.waitFor({state: "visible", timeout: 30_000}),
      this.algoStatusLabel.waitFor({state: "visible", timeout: 30_000}),
    ]);
    await expect(this.publicProfileTab).toBeVisible({timeout: 30_000});
  }

  async fillLeadGenProfile(details: LeadGenProfileDetails) {
    await this.ensureDropdownHasSelection(this.roleCombobox, this.roleDropdownContainer, [
      "Owner",
      "Partner",
    ]);
    await this.ensureDropdownHasSelection(
      this.genderCombobox,
      this.genderDropdownContainer,
      ["Male", "Female", "Non-Binary"],
    );
    await this.zipCodeInput.fill(details.zipCode);
    await expect(this.cityInput).not.toHaveValue("", {timeout: 15_000});
    await expect(this.stateInput).not.toHaveValue("", {timeout: 15_000});
    await expect(this.saveChangesButton).toBeEnabled({timeout: 15_000});
  }

  async saveLeadGenProfile() {
    await this.saveChangesButton.click();
    await expect(this.saveSuccessDialog).toBeVisible({timeout: 30_000});
    await this.saveSuccessCloseButton.click();
    await expect(this.saveSuccessDialog).toBeHidden({timeout: 10_000});
  }

  private async selectFirstAvailableDropdownOption(
    combobox: Locator,
    container: Locator,
    preferredOptions?: string[],
  ) {
    await container.click({force: true});

    if (preferredOptions && preferredOptions.length > 0) {
      await combobox.press("ArrowDown").catch(() => {});
      await combobox.press("Enter").catch(() => {});
      const selectedValue = (
        (await combobox.inputValue().catch(() => "")) ||
        (await container.textContent().catch(() => ""))
      )?.trim() ?? "";

      if (
        preferredOptions.some((value) =>
          selectedValue.toLowerCase().includes(value.toLowerCase()),
        )
      ) {
        return;
      }
    }

    await combobox.press("ArrowDown").catch(() => {});
    await combobox.press("Enter").catch(() => {});
  }

  private async ensureDropdownHasSelection(
    combobox: Locator,
    container: Locator,
    acceptedValues: string[],
  ) {
    const currentValue = (
      (await combobox.inputValue().catch(() => "")) ||
      (await combobox.textContent().catch(() => "")) ||
      (await container.textContent().catch(() => ""))
    )?.trim() ?? "";

    if (
      acceptedValues.some((value) =>
        currentValue.toLowerCase().includes(value.toLowerCase()),
      )
    ) {
      return;
    }

    await this.selectFirstAvailableDropdownOption(combobox, container, acceptedValues);
  }

  async isLeadGenBlockedByCompany() {
    return this.leadGenNotEnabledHeading.isVisible().catch(() => false);
  }
}
