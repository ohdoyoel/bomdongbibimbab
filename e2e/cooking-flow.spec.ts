import { test, expect, Page } from "@playwright/test";

async function dragToBowl(page: Page, ingredientId: string, bowlOffsetX = 0.5, bowlOffsetY = 0.5) {
  const ingredient = page.getByTestId(`ingredient-${ingredientId}`);
  await expect(ingredient).toBeVisible();

  const bowlArea = page.getByTestId("bowl-area");
  const bowlBox = await bowlArea.boundingBox();
  const ingredientBox = await ingredient.boundingBox();
  if (!bowlBox || !ingredientBox) throw new Error("Could not locate elements");

  const startX = ingredientBox.x + ingredientBox.width / 2;
  const startY = ingredientBox.y + ingredientBox.height / 2;
  const endX = bowlBox.x + bowlBox.width * bowlOffsetX;
  const endY = bowlBox.y + bowlBox.height * bowlOffsetY;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      startX + ((endX - startX) * i) / steps,
      startY + ((endY - startY) * i) / steps,
    );
    await page.waitForTimeout(15);
  }

  await page.mouse.up();
  await page.waitForTimeout(200);
}

test.describe("봄동 비빔밥 조리 시뮬레이터", () => {
  test("랜딩 페이지가 정상적으로 표시된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "봄동 비빔밥" })).toBeVisible();
    await expect(page.getByText("조리 시뮬레이터")).toBeVisible();
    await expect(page.getByText("요리 시작하기")).toBeVisible();
  });

  test("요리 시작 시 식탁 씬이 나타난다", async ({ page }) => {
    await page.goto("/");
    await page.getByText("요리 시작하기").click();
    await expect(page.getByText("봄동 비빔밥 만들기")).toBeVisible();
    await expect(page.getByText("식탁 위 재료를 그릇으로 드래그하세요")).toBeVisible();
    // All ingredients visible on table
    await expect(page.getByTestId("ingredient-rice")).toBeVisible();
    await expect(page.getByTestId("ingredient-egg")).toBeVisible();
    await expect(page.getByTestId("ingredient-bomdong")).toBeVisible();
    // Bowl visible
    await expect(page.getByTestId("bowl-area")).toBeVisible();
  });

  test("재료 없이는 비비기 버튼이 없다", async ({ page }) => {
    await page.goto("/");
    await page.getByText("요리 시작하기").click();
    await expect(page.getByText("쓱쓱 비비기!")).not.toBeVisible();
  });

  test("재료를 드래그하면 그릇에 나타나고 비비기 버튼이 보인다", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/");
    await page.getByText("요리 시작하기").click();
    await dragToBowl(page, "rice", 0.45, 0.45);
    await expect(page.getByText("쓱쓱 비비기!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/\d+번 추가됨/)).toBeVisible();
  });

  test("그릇 용량을 초과하면 더 넣을 수 없다", async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/");
    await page.getByText("요리 시작하기").click();

    // rice=20% * 5 = 100%
    for (let i = 0; i < 5; i++) {
      await dragToBowl(page, "rice", 0.3 + i * 0.08, 0.4 + i * 0.04);
    }

    await expect(page.getByText("그릇이 가득 찼어요!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("100%")).toBeVisible();
  });

  test("비비기 후 완성 화면이 표시된다", async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/");
    await page.getByText("요리 시작하기").click();

    await dragToBowl(page, "rice", 0.4, 0.45);
    await dragToBowl(page, "bomdong", 0.55, 0.5);

    await page.getByText("쓱쓱 비비기!").click({ timeout: 10000 });
    await expect(page.getByText("쓱쓱 비비는 중...")).toBeVisible();
    await page.waitForTimeout(3500);

    await expect(page.getByRole("heading", { name: "완성!" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("공유하기")).toBeVisible();
    await expect(page.getByText("다시 만들기")).toBeVisible();
  });

  test("공유 카드가 열리고 닫힌다", async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/");
    await page.getByText("요리 시작하기").click();

    await dragToBowl(page, "rice", 0.5, 0.5);
    await page.getByText("쓱쓱 비비기!").click({ timeout: 10000 });
    await page.waitForTimeout(3500);

    await page.getByText("공유하기").click();
    await expect(page.getByText("오늘의 요리")).toBeVisible();
    await page.getByLabel("닫기").click();
    await expect(page.getByText("오늘의 요리")).not.toBeVisible();
  });

  test("다시 만들기가 동작한다", async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/");
    await page.getByText("요리 시작하기").click();

    await dragToBowl(page, "bomdong", 0.5, 0.5);
    await page.getByText("쓱쓱 비비기!").click({ timeout: 10000 });
    await page.waitForTimeout(3500);

    await page.getByText("다시 만들기").click();
    await expect(page.getByText("봄동 비빔밥 만들기")).toBeVisible();
    await expect(page.getByText("재료를 여기로 드래그해주세요!")).toBeVisible();
  });

  test("모바일 뷰포트에서 레이아웃이 깨지지 않는다", async ({ page }) => {
    await page.goto("/");
    const vp = page.viewportSize();
    const body = await page.locator("body").boundingBox();
    if (body && vp) expect(body.width).toBeLessThanOrEqual(vp.width + 1);
    await expect(page.getByRole("heading", { name: "봄동 비빔밥" })).toBeVisible();
  });
});
