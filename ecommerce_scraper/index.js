import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

(async()=>{
	const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();	
	const url = 'https://www.jumia.co.ke/flash-sales/'
	await page.goto(url);
    await FetchProducts(page)
	await browser.close();
})();

async function FetchProducts (page){
    await page.reload();
    let html = await page.evaluate(()=> document.body.innerHTML);
    const $ = cheerio.load(html);
    console.log($('p.-gy5.-phs').text())
    // const contents = $('h3.name').contents();
    // let arr = [];
    // for (let i=1;i <= contents.length;i++){
    //     arr.push({id: i, title: $('h3.name').text()});
    // }
    // console.log(arr)
    const listItems = $('div.-df.-d-co.-pbs').children('h3.name');
    console.log(`List item count: ${listItems.length}`);
};