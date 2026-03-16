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
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(sx + ((ex - sx) * i) / 8, sy + ((ey - sy) * i) / 8);
    await page.waitForTimeout(10);
  }
  await page.mouse.up();
  await page.waitForTimeout(200);
}

test("봄동 많이 넣고 결과 확인", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");

  // 밥 2번
  await dragToBowl(page, "rice", 0.4, 0.4);
  await dragToBowl(page, "rice", 0.6, 0.6);

  // 봄동 8번
  for (let i = 0; i < 8; i++) {
    await dragToBowl(page, "bomdong", 0.3 + (i % 3) * 0.2, 0.3 + Math.floor(i / 3) * 0.2);
  }

  // 고추장 1번
  await dragToBowl(page, "gochujang", 0.5, 0.5);

  await page.screenshot({ path: "screenshots/bomdong-before-mix.png" });

  // 비비기
  await page.getByText("쓱쓱 비비기!").click();
  await page.waitForTimeout(3500);

  await page.screenshot({ path: "screenshots/bomdong-after-mix.png" });
});
