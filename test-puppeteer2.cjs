const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('https://ais-pre-tq5fo6bqih3rpcjxjuzrow-386512934665.asia-southeast1.run.app', { waitUntil: 'networkidle2' });
  
  console.log("URL after navigation:", page.url());
  const content = await page.content();
  console.log("HTML length:", content.length);
  
  await browser.close();
})();
