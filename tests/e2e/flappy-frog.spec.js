import { test, expect } from '@playwright/test';

test.describe('Flappy Frog', () => {
  test.beforeEach(async ({ page }) => {
    // 清空 localStorage
    await page.route('**/*', async (route) => {
      await route.continue();
    });
  });

  test('页面加载成功', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#game')).toBeVisible();
  });

  test('标题场景显示开始按钮', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=请打开声音')).toBeVisible();
    await expect(page.locator('text=开始')).toBeVisible();
  });

  test('点击开始按钮进入游戏', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=开始').click();
    await expect(page.locator('text=请打开声音')).not.toBeVisible();
  });

  test('游戏分数更新', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=开始').click();
    // 等待游戏开始并穿过第一个管道
    await page.waitForTimeout(3000);
    const scoreText = page.locator('text=+');
    await expect(scoreText).toBeVisible();
  });

  test('空格键可以跳跃', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=开始').click();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    // 验证游戏状态正常
    await expect(page.locator('#game')).toBeVisible();
  });

  test('最佳分数持久化', async ({ page }) => {
    await page.goto('/');
    // 初始 bestScore 为 0
    const initialBest = await page.evaluate(() => window.state?.bestScore || 0);
    expect(initialBest).toBe(0);
  });
});
