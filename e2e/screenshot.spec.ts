import { test, Page } from "@playwright/test";

async function dragToBowl(page: Page, ingredientId: string, bx = 0.5, by = 0.5) {
  const ingredient = page.getByTestId(`ingredient-${ingredientId}`);
  const bowlArea = page.getByTestId("bowl-area");
  const bowlBox = await bowlArea.boundingBox();
  const ingredientBox = await ingredient.boundingBox();
  if (!bowlBox || !ingredientBox) return;
  const sx = ingredientBox.x + ingredientBox.width / 2;
  const sy = ingredientBox.y + ingredientBox.height / 2;
  const ex = bowlBox.x + bowlBox.width * bx;
  const ey = bowlBox.y + bowlBox.height * by;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(sx + ((ex - sx) * i) / 10, sy + ((ey - sy) * i) / 10);
    await page.waitForTimeout(10);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);
}

test("README screenshots", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");

  // 1. Cooking screen (empty)
  await page.screenshot({ path: "screenshots/01-cooking.png" });

  // 2. Add ingredients for a nice bibimbap
  await dragToBowl(page, "rice", 0.45, 0.45);
  await dragToBowl(page, "rice", 0.55, 0.55);
  await dragToBowl(page, "bomdong", 0.35, 0.5);
  await dragToBowl(page, "bomdong", 0.6, 0.35);
  await dragToBowl(page, "egg", 0.5, 0.45);
  await dragToBowl(page, "gochujang", 0.4, 0.6);
  await dragToBowl(page, "gochugaru", 0.55, 0.4);
  await dragToBowl(page, "sesameOil", 0.45, 0.55);
  await dragToBowl(page, "sesameSeeds", 0.5, 0.5);
  await dragToBowl(page, "garlic", 0.4, 0.45);

  // 3. Cooking screen with ingredients
  await page.screenshot({ path: "screenshots/02-ingredients.png" });

  // 4. Mix
  await page.getByText("쓱쓱 비비기!").click();
  await page.waitForTimeout(3500);

  // 5. Done screen
  await page.screenshot({ path: "screenshots/03-done.png" });

  // 6. Share card
  await page.getByText("공유하기").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/04-share.png" });
});
