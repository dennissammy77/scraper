import puppeteer, { Puppeteer} from "puppeteer";
import cheerio from "cheerio"; // 
import { select, filter, is, some } from "cheerio-select";

async function main(){
	try{
		const browser = await puppeteer.launch({headless:false});

		const url_1 = 'https://aviator-demo.spribegaming.com/?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=95234&token=cjf19MhDJPVyXPlQ3buTd9ZP0cbH0H3L'
		const page = await browser.newPage();
		await page.goto(url_1,{timeout:0})
	
		//let html = await page.evaluate(()=> document.body.innerHTML);
		//let $ = cheerio.load(html);

		console.log(await page.$$eval('div > div', el => el.map(i => i.textContent)));
		
		
		//const url = 'https://spribe.co/games/aviator'
		//const url_1 = 'https://aviator-demo.spribegaming.com/?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=95234&token=cjf19MhDJPVyXPlQ3buTd9ZP0cbH0H3L'
		/**
		let html = await page.evaluate(()=> document.body.innerHTML);
		let $ = cheerio.load(html);

		const event = await page.$('a.demo.link');
		await event?.evaluate(event => event.click());

		const eventmodal = await page.$('button.btn.btn-primary.btn-lg.px-5.btn-demo.btn-danger');
		await eventmodal?.evaluate(eventmodal => eventmodal.click());

		const event_modal_2 = await page.$('button.btn.btn-md.btn-primary.btn-age.mt-3.mt-lg-0');
		await event_modal_2?.evaluate(event_modal_2 => event_modal_2.click());

		page.once('load', () => console.log('Page loaded!'));

		//	console.log(await $('#_ngcontent-ibv-c47 span.currency'))
//
//	**/
		page.once('load', () => console.log('Page loaded!'));
		console.log('******Waiting*****');
	
	}catch(err){
		console.error(err)
	}
}

main()
