import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput() { return this.page.getByRole('textbox', { name: 'Username' }); }
  private get passwordInput() { return this.page.getByRole('textbox', { name: 'Password' }); }
  private get loginButton() { return this.page.getByRole('button', { name: 'Login' }); }
  private get errorMessage() { return this.page.getByTestId('error'); }

  async open(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText('Username and password do not match');
  }

  async expectLoginPage(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
  }
}
