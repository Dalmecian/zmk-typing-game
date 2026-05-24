import { chromium } from 'playwright';

const mode = process.argv[2] || 'normal'; // 'normal' or 'timeattack'

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://127.0.0.1:5173/zmk-typing-game/');
await page.waitForTimeout(2000);

if (mode === 'timeattack') {
  await page.click('text=TIME ATTACK');
  await page.waitForTimeout(1000);
}

await page.screenshot({ path: '/tmp/zmk-screenshot.png', fullPage: false });
console.log('Screenshot saved to /tmp/zmk-screenshot.png');
await browser.close();
