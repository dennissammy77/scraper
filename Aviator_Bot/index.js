import puppeteer, { Puppeteer} from "puppeteer";
import cheerio from "cheerio"; // 
import { select, filter, is, some } from "cheerio-select";

async function main(){
	const browser = await puppeteer.launch({headless:true});
	const page = await browser.newPage();
	//page.setDefaultNavigationTimeout(0);

	const url = 'https://spribe.co/games/aviator'
	await page.goto(url);
	let html = await page.evaluate(()=> document.body.innerHTML);
	let $ = cheerio.load(html);

	const event = await page.$('a.demo.link');
	await event?.evaluate(event => event.click());

	const eventmodal = await page.$('button.btn.btn-primary.btn-lg.px-5.btn-demo.btn-danger');
	await eventmodal?.evaluate(eventmodal => eventmodal.click());

	const event_modal_2 = await page.$('button.btn.btn-md.btn-primary.btn-age.mt-3.mt-lg-0');
	await event_modal_2?.evaluate(event_modal_2 => event_modal_2.click());

	console.log(await $('#_ngcontent-ibv-c47 span.currency'))
	console.log('******Waiting*****');


}

main()
