import { test, expect, Page } from "@playwright/test";

async function dragToBowl(page: Page, ingredientId: string) {
  const ingredient = page.getByTestId(`ingredient-${ingredientId}`);
  await expect(ingredient).toBeVisible();
  const bowlArea = page.getByTestId("bowl-area");
  const bowlBox = await bowlArea.boundingBox();
  const ingredientBox = await ingredient.boundingBox();
  if (!bowlBox || !ingredientBox) throw new Error("err");
  const sx = ingredientBox.x + ingredientBox.width / 2;
  const sy = ingredientBox.y + ingredientBox.height / 2;
  const ex = bowlBox.x + bowlBox.width * 0.5;
  const ey = bowlBox.y + bowlBox.height * 0.5;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(sx + ((ex - sx) * i) / 10, sy + ((ey - sy) * i) / 10);
    await page.waitForTimeout(10);
  }
  await page.mouse.up();
}

test("snackbar DOM dump", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await dragToBowl(page, "rice");
  await page.waitForTimeout(200);

  // Dump the snackbar parent hierarchy
  const dump = await page.evaluate(() => {
    const el = document.querySelector(".seed-snackbar__message");
    if (!el) return "snackbar message not found";
    const chain: string[] = [];
    let cur: HTMLElement | null = el as HTMLElement;
    while (cur && cur !== document.body) {
      const r = cur.getBoundingClientRect();
      chain.push(`${cur.tagName}.${cur.className.slice(0, 60)} | w=${r.width.toFixed(0)} x=${r.x.toFixed(0)}`);
      cur = cur.parentElement;
    }
    return chain;
  });
  console.log("Snackbar chain:", JSON.stringify(dump, null, 2));

  const button = page.locator("button", { hasText: "쓱쓱 비비기!" });
  const bb = await button.boundingBox();
  console.log("Button:", JSON.stringify(bb));
});
