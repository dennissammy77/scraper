import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

(async()=>{
	const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();
	// await page.setViewport({
	// 	width:800,
	// 	height: 1000,
	// 	isMobile: false,
	// 	isLandscape: true,
	// 	hasTouch: false,
	// 	deviceScaleFactor: 1
	// });
    // iqX8V*cBWu$dz
	
	const url = 'https://spribe.co/games/aviator'
	await page.goto(url);
    let html = await page.evaluate(()=> document.body.innerHTML);
    const $ = cheerio.load(html);

    const event = await page.$('a.demo-link');
    await event.evaluate( event => event.click() );
    
    const eventmodal = await page.$('button.btn.btn-md.btn-primary.btn-age.mt-3.mt-lg-0');
    await eventmodal.evaluate( eventmodal => eventmodal.click() );

    const amountpayout = await page?.$('span.amount.font-weight-bold');
    await amountpayout.evaluate( amountpayout => amountpayout.text() );
    //const payouts = await $('span.amount.font-weight-bold').text();
    console.log(amountpayout)
    // await new Promise( ( resolve, reject ) =>
    // {
    //     let i = 0;

    //     const interval = setInterval( async () =>
    //     {
    //         const payouts = await page.evaluate( () => document.getElementsByClassName('bubble-multiplier.font-weight-bold') ) ;
    //         //console.log( await page.evaluate( () => document.getElementById( 'div.payouts-block' ) ) );
    //         if ( ++i === 20 )
    //         {
    //             clearInterval( interval );
    //             resolve( await browser.close() );
    //         }

    //     }, 1000 );
    // });
    // const payouts = await page.$('div.payouts-block');
    // console.log(payouts)
      // Wait and click on first result
    // console.log($('a.btn.btn-primary.btn-lg.px-5.btn-demo.btn-danger').text())
    // const ABtnSelector = $('button.btn.btn-primary.btn-lg.px-5.btn-demo.btn-danger');
    // console.log(ABtnSelector)
    // await page.waitForSelector(ABtnSelector);
    // await page.click(ABtnSelector);

    //await checkPrice(page)
	//await browser.close();
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