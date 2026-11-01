// يولد أيقونات التطبيق من رسم HTML بسيط.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
for (const [name, size, pad] of [['icon-192', 192, 0], ['icon-512', 512, 0], ['maskable-512', 512, 60], ['apple-touch', 180, 0]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0;background:#1B6F8A;display:grid;place-items:center;height:100vh;font-family:Tahoma,sans-serif">
    <div style="width:${size - pad * 2}px;height:${size - pad * 2}px;display:grid;place-items:center">
      <div style="background:#FFC93C;border-radius:50%;width:78%;height:78%;display:grid;place-items:center;color:#16324F;font-weight:800;font-size:${(size - pad * 2) * 0.46}px;line-height:1">ع</div>
    </div></body>`);
  await page.screenshot({ path: `public/icons/${name}.png` });
  await page.close();
}
await browser.close();
