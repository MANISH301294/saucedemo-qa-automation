import { Given, When, Then } from '@cucumber/cucumber';
import users from '../testdata/users.json';
import checkoutData from '../testdata/checkout.json';
import { environment } from '../config/environment';
import { AutomationWorld } from '../support/world';

Given('I am logged in as a standard user', async function (this: AutomationWorld) {
  await this.loginPage!.open(environment.baseUrl);
  await this.loginPage!.login(users.standard.username, users.standard.password);
  await this.inventoryPage!.expectLoaded();
});

When('I add {string} to the cart', async function (this: AutomationWorld, productName: string) {
  await this.inventoryPage!.addToCart(productName);
  await this.inventoryPage!.openCart();
  await this.cartPage!.expectProduct(productName);
  await this.cartPage!.checkout();
});

When('I complete checkout with valid customer details', async function (this: AutomationWorld) {
  await this.checkoutPage!.enterCustomerDetails(checkoutData.validCustomer);
  await this.checkoutPage!.finishOrder();
});

Then('I should see the order confirmation page', async function (this: AutomationWorld) {
  await this.checkoutPage!.expectOrderComplete();
});
