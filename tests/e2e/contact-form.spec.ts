import { test, expect } from "@playwright/test";

test.describe("contact form", () => {
  test("submit happy path shows success state (mocked API)", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/#contact");
    await page.waitForTimeout(500);
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();

    await contact.getByLabel(/name/i).fill("Test User");
    await contact.getByLabel(/email/i).fill("test@example.com");
    await contact.getByLabel(/message/i).fill("Hello from playwright e2e.");

    await contact.getByRole("button", { name: /send message/i }).click();
    await expect(contact.getByText(/message sent/i)).toBeVisible({ timeout: 5000 });
  });

  test("submit error path surfaces fallback message", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to submit" }),
      });
    });

    await page.goto("/#contact");
    await page.waitForTimeout(500);
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();

    await contact.getByLabel(/name/i).fill("Test User");
    await contact.getByLabel(/email/i).fill("test@example.com");
    await contact.getByLabel(/message/i).fill("Triggering an error.");

    await contact.getByRole("button", { name: /send message/i }).click();
    await expect(contact.getByText(/something went wrong/i)).toBeVisible({ timeout: 5000 });
  });
});
