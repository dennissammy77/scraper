import puppeteer from 'puppeteer';

const searchTermCLI =  process.argv.length > 3 ? process.argv[2] : 'sandwich maker';
(async()=>{
	const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();
	const url = 'https://www.jumia.co.ke/'
	await page.goto(url);
	await page.waitForSelector('#fi-q');
	await page.type('#fi-q',searchTermCLI, {delay: 100});

	await Promise.all([
		page.waitForNavigation(),
		page.click('#search')
	]);
	// wait till next page
	
	await browser.close();
})();
