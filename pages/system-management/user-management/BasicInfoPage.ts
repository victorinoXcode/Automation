import {expect, type Locator, type Page} from "@playwright/test";
import {basename} from "node:path";

/**
 * Page Object for the Basic Info tab in System Management > User Management (user detail).
 * Contains the "Learn more" link next to Role that opens the roles matrix Google Sheet.
 */
export class BasicInfoPage {
  constructor(private readonly page: Page) {}

  private readonly supportedRoleOptions = [
    "Advisor",
    "Advisor as Rep",
    "Advisor Trader",
    "Advisor Operations",
    "Enterprise Operations",
    "Enterprise Trader",
    "Enterprise Admin",
    "Zoe Platform Operations",
    "Portfolio Manager",
  ] as const;

  get pageAlert(): Locator {
    return this.page.getByRole("alert");
  }

  get roleHeading(): Locator {
    return this.page.getByRole("heading", {name: "Role"});
  }

  /** "Learn more" link next to Role (opens roles matrix in new tab). */
  get learnMoreRoleLink(): Locator {
    return this.page.locator(
      'a[href*="docs.google.com/spreadsheets/d/1UCXwc5FOAsoYdw2lr-yxwSxcpKBrJFhQ_0XQ5r6xDjs"]',
    );
  }

  get firstNameInput(): Locator {
    return this.page.getByRole("textbox", {name: "First Name"});
  }

  get lastNameInput(): Locator {
    return this.page.getByRole("textbox", {name: "Last Name"});
  }

  get phoneNumberInput(): Locator {
    return this.page.getByRole("textbox", {name: "Phone Number"});
  }

  get saveChangesButton(): Locator {
    return this.page.getByRole("button", {name: "Save Changes"});
  }

  get saveSuccessDialog(): Locator {
    return this.page.getByRole("dialog", {name: "Changes saved successfully"});
  }

  get saveSuccessMessage(): Locator {
    return this.page.getByText("Changes saved successfully").first();
  }

  get saveSuccessCloseButton(): Locator {
    return this.page.getByRole("button", {name: "Close modal"});
  }

  get removeAccessButton(): Locator {
    return this.page.getByRole("button", {name: "Remove Access"}).last();
  }

  get restoreAccessButton(): Locator {
    return this.page.getByRole("button", {name: "Restore Access"}).last();
  }

  get removeAccessDialog(): Locator {
    return this.page.getByRole("dialog", {name: "Remove Access"});
  }

  get restoreAccessDialog(): Locator {
    return this.page.getByRole("dialog", {name: "Restore Access"});
  }

  get removeAccessConfirmButton(): Locator {
    return this.removeAccessDialog.getByRole("button", {name: "Remove Access"});
  }

  get restoreAccessConfirmButton(): Locator {
    return this.restoreAccessDialog.getByRole("button", {
      name: "Restore Access",
    });
  }

  get fieldErrorMessages(): Locator {
    return this.page.locator("p, span, div").filter({
      hasText: /must be|required|invalid|error/i,
    });
  }

  get uploadAdvPart2BHeading(): Locator {
    return this.page.getByRole("heading", {name: "Upload ADV Part 2B"});
  }

  get uploadAdvPart2BButton(): Locator {
    return this.page.getByRole("button", {name: /Browse.*drag files here/i});
  }

  get advPart2BDeleteButton(): Locator {
    return this.page.getByTestId("test-delete-icon").last();
  }

  get advPart2BPreviewLink(): Locator {
    return this.page.locator('a[href*="/user_documents/"]').last();
  }

  get deleteDocumentDialog(): Locator {
    return this.page.getByRole("dialog", {name: "Delete Document"});
  }

  get deleteDocumentConfirmButton(): Locator {
    return this.deleteDocumentDialog.getByRole("button", {name: "Delete"});
  }

  get deleteDocumentCloseButton(): Locator {
    return this.deleteDocumentDialog.getByRole("button", {name: "Close modal"});
  }

  get deleteDocumentSuccessMessage(): Locator {
    return this.deleteDocumentDialog.getByText("Document Successfully Deleted");
  }

  async waitUntilLoaded() {
    await expect(this.roleHeading).toBeVisible({timeout: 15_000});
  }

  /** Clicks the Learn more link; use with waitForEvent('page') to handle the new tab. */
  async clickLearnMoreRole() {
    await this.learnMoreRoleLink.scrollIntoViewIfNeeded();
    await this.learnMoreRoleLink.click();
  }

  async updateBasicInfo(details: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) {
    await this.replaceInputValue(this.firstNameInput, details.firstName);
    await this.replaceInputValue(this.lastNameInput, details.lastName);
    if (details.phoneNumber) {
      await this.replaceInputValue(this.phoneNumberInput, details.phoneNumber);
    }
    await this.roleHeading.click();
  }

  async getPhoneNumberValue() {
    return this.phoneNumberInput.inputValue();
  }

  async getLastNameValue() {
    return this.lastNameInput.inputValue();
  }

  async updatePhoneNumber(phoneNumber: string) {
    await this.phoneNumberInput.click();
    await this.phoneNumberInput.press("ControlOrMeta+a");
    await this.phoneNumberInput.fill(phoneNumber);
    await this.roleHeading.click();
  }

  async updateLastName(lastName: string) {
    await this.replaceInputValue(this.lastNameInput, lastName);
    await this.roleHeading.click();
  }

  private async replaceInputValue(input: Locator, value: string) {
    await input.click();
    await input.press("ControlOrMeta+a");
    await input.press("Delete");
    await input.type(value, {delay: 30});
  }

  async getFieldErrors(): Promise<string[]> {
    const errors = await this.fieldErrorMessages.allTextContents();
    return errors.map((error) => error.trim()).filter(Boolean);
  }

  async saveChanges() {
    await this.saveChangesButton.click();
    await expect(this.saveSuccessMessage).toBeVisible({timeout: 20_000});
  }

  getUploadedAdvPart2BFileName(fileName: string): Locator {
    return this.page.getByRole("heading", {
      name: new RegExp(this.escapeForRegex(fileName), "i"),
    });
  }

  async uploadAdvPart2BDocument(filePath: string) {
    await expect(this.uploadAdvPart2BHeading).toBeVisible({timeout: 15_000});
    await expect(this.uploadAdvPart2BButton).toBeVisible({timeout: 15_000});
    await this.uploadAdvPart2BButton.scrollIntoViewIfNeeded();

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.uploadAdvPart2BButton.click({force: true}),
    ]);
    await fileChooser.setFiles(filePath);

    const fileName = basename(filePath);
    await expect(this.getUploadedAdvPart2BFileName(fileName)).toBeVisible({
      timeout: 20_000,
    });
    await expect(this.advPart2BPreviewLink).toBeVisible({timeout: 20_000});
    await expect(this.advPart2BDeleteButton).toBeVisible({timeout: 20_000});
  }

  async hasUploadedAdvPart2BDocument() {
    return this.advPart2BDeleteButton.isVisible().catch(() => false);
  }

  async clearUploadedAdvPart2BDocuments() {
    let attempts = 0;

    while (await this.hasUploadedAdvPart2BDocument()) {
      attempts += 1;
      if (attempts > 3) {
        throw new Error("Could not clear existing ADV Part 2B documents");
      }

      await this.advPart2BDeleteButton.click();
      await expect(this.deleteDocumentDialog).toBeVisible({timeout: 10_000});
      await this.deleteDocumentConfirmButton.click();
      await expect(this.deleteDocumentSuccessMessage).toBeVisible({timeout: 20_000});
      await this.deleteDocumentCloseButton.click();
      await expect(this.deleteDocumentDialog).not.toBeVisible({timeout: 20_000});
    }

    await expect(this.uploadAdvPart2BButton).toBeVisible({timeout: 20_000});
  }

  async deleteUploadedAdvPart2BDocument(fileName: string) {
    if (!(await this.getUploadedAdvPart2BFileName(fileName).isVisible().catch(() => false))) {
      return;
    }

    await this.advPart2BDeleteButton.click();
    await expect(this.deleteDocumentDialog).toBeVisible({timeout: 10_000});
    await this.deleteDocumentConfirmButton.click();
    await expect(this.deleteDocumentSuccessMessage).toBeVisible({timeout: 20_000});
    await this.deleteDocumentCloseButton.click();
    await expect(this.getUploadedAdvPart2BFileName(fileName)).not.toBeVisible({
      timeout: 20_000,
    });
    await expect(this.uploadAdvPart2BButton).toBeVisible({timeout: 20_000});
  }

  getRoleRadio(roleName: string): Locator {
    return this.page.getByRole("radio", {name: roleName, exact: true});
  }

  async getSelectedRole(): Promise<string> {
    for (const roleName of this.supportedRoleOptions) {
      const roleRadio = this.getRoleRadio(roleName);
      if ((await roleRadio.count()) > 0 && (await roleRadio.isChecked())) {
        return roleName;
      }
    }

    throw new Error("Could not determine selected role in Basic Info");
  }

  async getFirstAvailableAlternativeRole(
    currentRole: string,
    filter?: (role: string) => boolean,
  ): Promise<string> {
    for (const roleName of this.supportedRoleOptions) {
      if (roleName === currentRole) {
        continue;
      }

      if (filter && !filter(roleName)) {
        continue;
      }

      const roleRadio = this.getRoleRadio(roleName);
      if ((await roleRadio.count()) === 0) {
        continue;
      }

      if (!(await roleRadio.isDisabled())) {
        return roleName;
      }
    }

    throw new Error(`Could not find an alternative role for "${currentRole}"`);
  }

  async selectRole(roleName: string) {
    const roleRadio = this.getRoleRadio(roleName);
    await roleRadio.scrollIntoViewIfNeeded();
    await roleRadio.click({force: true});
  }

  async dismissSaveSuccessDialog() {
    if (await this.saveSuccessCloseButton.isVisible().catch(() => false)) {
      await this.saveSuccessCloseButton.click();
    }
  }

  async isAccessRemoved() {
    return this.restoreAccessButton.isVisible().catch(() => false);
  }

  async removeAccess() {
    await this.removeAccessButton.click();
    await expect(this.removeAccessDialog).toBeVisible({timeout: 10_000});
    await this.removeAccessConfirmButton.click();
    await expect(this.restoreAccessButton).toBeVisible({timeout: 40_000});
    await expect(this.firstNameInput).toBeDisabled();
    await expect(this.lastNameInput).toBeDisabled();
    await expect(this.phoneNumberInput).toBeDisabled();
  }

  async restoreAccess() {
    await this.restoreAccessButton.click();
    await expect(this.restoreAccessDialog).toBeVisible({timeout: 10_000});
    await this.restoreAccessConfirmButton.click();
    await expect(this.removeAccessButton).toBeVisible({timeout: 20_000});
    await expect(this.firstNameInput).toBeEditable();
    await expect(this.lastNameInput).toBeEditable();
    await expect(this.phoneNumberInput).toBeEditable();
  }

  private escapeForRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
