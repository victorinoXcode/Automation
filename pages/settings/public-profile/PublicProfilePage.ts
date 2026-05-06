import {type Page} from "@playwright/test";

const PUBLIC_PROFILE_PATH = "/dashboard/settings/public-profile";

/**
 * Page Object for the Public Profile settings page (advisor dashboard).
 * Includes the bio editor (Draft.js contenteditable) and Save Changes button.
 */
export class PublicProfilePage {
  constructor(
    private readonly page: Page,
    private readonly baseUrl: string,
  ) {}

  /** Navigate to the Public Profile URL. */
  async goto() {
    await this.page.goto(`${this.baseUrl}${PUBLIC_PROFILE_PATH}`);
  }

  /** Bio editor (Draft.js): contenteditable with role="textbox". */
  get bioEditor() {
    return this.page.getByRole("textbox", {name: /./}).first();
  }

  /** Replace bio content: focus, select all, type text. */
  async setBioText(text: string) {
    const editor = this.bioEditor;
    await editor.click();
    await this.page.keyboard.press("ControlOrMeta+a");
    await this.page.keyboard.type(text, {delay: 20});
  }

  /** Save Changes button (primary blue). */
  get saveChangesButton() {
    return this.page.getByRole("button", {name: "Save Changes"});
  }

  async clickSaveChanges() {
    await this.saveChangesButton.click();
  }
}
