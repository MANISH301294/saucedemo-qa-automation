import { Given, Then } from '@cucumber/cucumber';
import users from '../testdata/users.json';
import { environment } from '../config/environment';
import { AutomationWorld } from '../support/world';

Given('I attempt login with invalid credentials', async function (this: AutomationWorld) {
  await this.loginPage!.open(environment.baseUrl);
  await this.loginPage!.login(users.invalid.username, users.invalid.password);
});

Then('I should see an authentication error message', async function (this: AutomationWorld) {
  await this.loginPage!.expectError();
});

Then('I should remain on the login page', async function (this: AutomationWorld) {
  await this.loginPage!.expectLoginPage();
});
