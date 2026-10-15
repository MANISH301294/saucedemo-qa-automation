@smoke
Feature: SauceDemo purchase flow

  Scenario: Standard user purchases the Sauce Labs Backpack
    Given I am logged in as a standard user
    When I add "Sauce Labs Backpack" to the cart
    And I complete checkout with valid customer details
    Then I should see the order confirmation page
