import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

(async()=>{
	const browser = await puppeteer.launch({headless:true});
	const page = await browser.newPage();
	await page.setViewport({
		width:800,
		height: 1000,
		isMobile: false,
		isLandscape: true,
		hasTouch: false,
		deviceScaleFactor: 1
	});
	
	const url = 'https://www.jumia.co.ke/skyworth-50g3a-50prime-4k-uhd-frameless-smart-android-tv-ndash-black-79130216.html'
	await page.goto(url);
    await checkPrice(page)
	await browser.close();
})();


async function checkPrice(page){
    await page.reload();
    let html = await page.evaluate(()=> document.body.innerHTML);
    const $ = cheerio.load(html);
    console.log($('h1.-fs20.-pts.-pbxs').text())
    console.log($('span.-b.-ubpt.-tal.-fs24.-prxs').text() || '-')
    console.log($('span.-m.-phxs').text() || '-')
    console.log($('span.-fsh0.-prs.-fs12').text() || ($('p.-df.-i-ctr.-fs12.-pbs.-rd5').text()))
    console.log($('time.-m.-ws-p').text() || '-')
}