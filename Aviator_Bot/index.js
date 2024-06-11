import puppeteer, { Puppeteer} from "puppeteer";
import cheerio from "cheerio"; // 
import { select, filter, is, some } from "cheerio-select";
//import { once } from 'events';

async function main(){
	try{
		const browser = await puppeteer.launch({headless:false});
		
		const url = 'https://www.betika.com/en-ke/aviator'

		const page = await browser.newPage();
		await page.goto(url,{timeout:0})
			
		const event = await page.$('button.account__payments__submit.button.button__secondary.purple');
		await event?.evaluate(event => event.click());

		const newPage = await page.waitForSelector('div.header.h-100.d-flex.justify-content-between.align-items-center')


		let html = await newPage.evaluate(() => document.body.innerHTML);
		console.log(html);

		console.log('******Waiting*****');
	
	}catch(err){
		console.error(err)
	}
}

main()
