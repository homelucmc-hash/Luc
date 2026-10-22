/**
 * Exemple de test Playwright à intégrer dans le projet si @playwright/test est installé.
 * Ne fonctionne que lorsque la page d'accueil rend CoffeeScrollSequence ET que de VRAIES frames existent.
 * Ne prouve pas que le liquide se remplit : inspection visuelle obligatoire.
 */
import { test, expect } from "@playwright/test";

test("le café suit le scroll aller ET retour", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stage = page.getByTestId("coffee-sequence");
  await expect(stage).toHaveAttribute("data-frame-count", /\d+/);
  await expect(stage).toHaveAttribute("data-current-frame", /\d+/);
  const height = await page.evaluate(() => innerHeight);
  const seen: number[] = [];
  for (const p of [0, 0.25, 0.5, 0.75, 0.98, 0.75, 0.5, 0.25, 0]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(p * height * 4));
    await page.waitForTimeout(500);
    const desired = Number(await stage.getAttribute("data-target-frame"));
    await expect.poll(async () => Number(await stage.getAttribute("data-current-frame")), { timeout: 10000 }).toBe(desired);
    seen.push(desired);
    await page.screenshot({ path: `test-results/coffee-${String(p).replace(".", "_")}-${seen.length}.png`, fullPage: false });
  }
  expect(seen[0]).toBeLessThan(seen[1]);
  expect(seen[1]).toBeLessThan(seen[2]);
  expect(seen[2]).toBeLessThan(seen[3]);
  expect(seen[3]).toBeLessThan(seen[4]);
  expect(seen[4]).toBeGreaterThan(seen[5]);
  expect(seen[5]).toBeGreaterThan(seen[6]);
  expect(seen[6]).toBeGreaterThan(seen[7]);
  expect(seen[7]).toBeGreaterThan(seen[8]);
});
