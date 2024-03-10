import puppeteer from 'puppeteer';

(async()=>{
	const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();
	await page.setViewport({
		width:800,
		height: 1000,
		isMobile: false,
		isLandscape: true,
		hasTouch: false,
		deviceScaleFactor: 1
	});
	
	const url = 'https://www.jumia.co.ke/'
	await page.goto(url)
	
	await browser.close();
})();
