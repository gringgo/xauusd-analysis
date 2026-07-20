const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log("URL after navigation:", page.url());
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("Root HTML length:", rootHtml.length);
  if (rootHtml.length < 500) {
      console.log("Root HTML:", rootHtml);
  }
  
  await browser.close();
})();
