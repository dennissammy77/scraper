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

		/**
		const eventmodal = await page.$('button.btn.btn-primary.btn-lg.px-5.btn-demo.btn-danger');

		const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));

		await eventmodal?.evaluate(eventmodal => eventmodal.click());

		const event_modal_2 = await page.$('button.btn.btn-md.btn-primary.btn-age.mt-3.mt-lg-0');
		
		await event_modal_2?.evaluate(event_modal_2 => event_modal_2.click());

		//const newPagePromise = browser.on('targetcreated', function(){
		//	console.log('New Tab Created');
		//})
		const newPage = await newPagePromise;

		//let html = await newPage.evaluate(()=>document.body.innerHTML);
		//console.log(html)

		console.log((await browser.pages()).length);
		console.log((await newPage.content()));
		 **/
		console.log('******Waiting*****');
	
	}catch(err){
		console.error(err)
	}
}

main()
