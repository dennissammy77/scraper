import puppeteer, { Puppeteer} from "puppeteer";
import cheerio from "cheerio"; // 
import { select, filter, is, some } from "cheerio-select";
//import { once } from 'events';

async function main(){
	try{
		const page = await Launcher();	
		const url = 'https://www.betika.com/en-ke/aviator'
		await page.goto(url,{timeout:0})
		
		const event = await page.$('button.account__payments__submit.button.button__secondary.purple');
		await event?.evaluate(event => event.click());

		let BetState = false;	
		// Find the iframe using its ID
		// Wait for the iframe to be available in the DOM
  
		await page.waitForSelector('#aviator-iframe');
		const iframeElementHandle = await page.$('#aviator-iframe');
		
		if (iframeElementHandle) {
    
			const iframe = await iframeElementHandle.contentFrame();
        
			if (iframe) {

				GET_WALLET_AMOUNT(iframe);
				SET_AUTO_BET(iframe);
				SET_AUTO_CASHOUT(iframe);
				SET_AUTO_CASHOUT_VALUE(iframe);
				
				async function HANDLE_BUTTON_BET_STATE(){

					const bet_selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.first-row.auto-game-feature > div.buttons-block > button'
					const cancel_bet_selector_value = '.btn.btn-danger.bet'
					const bet_label_selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.first-row.auto-game-feature.auto-game > div.buttons-block > button > span > label.label.text-uppercase'
					const curr_stake_value_selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.second-row > div.cashout-block > div.cashout-spinner-wrapper > div > app-spinner > div > div.input.full-width > input'
					
					await iframe.waitForSelector(curr_stake_value_selector_value);
					const fieldHandle = await iframe.$(curr_stake_value_selector_value);
					let fieldValue = await iframe.evaluate(x => x.value, fieldHandle);
					console.log(fieldValue)

					if (fieldValue !== '1.15'){
						SET_AUTO_CASHOUT_VALUE(iframe)
						return;
					}

					await iframe.waitForSelector(bet_selector_value, cancel_bet_selector_value,  { timeout: 600000 });

//					await iframe.waitForSelector(cancel_bet_selector_value, { timeout: 600000 });


					// Locate the specific element within the iframe
					const BetElementHandle = await iframe.$(bet_selector_value, { timeout: 600000 });      
					const CancelElementHandle = await iframe.$(cancel_bet_selector_value, { timeout: 600000 });  
					if (CancelElementHandle){
						console.log('betting');
						//return false;
						return;
					}
					GET_WALLET_AMOUNT(iframe)

					await iframe.waitForSelector(bet_label_selector_value)
					let betLabel = '';
					const betLabelHandle = await iframe.$(bet_label_selector_value);      
					if (betLabelHandle) {
						// Extract the content of the element
						betLabel = await iframe.evaluate(el => el.textContent.trim(), betLabelHandle);
					} 
					console.log(betLabel)
					
					if ( betLabel === 'Bet' ) {
						BetElementHandle?.evaluate(event => event.click());
						console.log('Bet clicked')
					}
					
					return;
				}
				setInterval(
					HANDLE_BUTTON_BET_STATE,
					1500
				);
				//let state = true;
				/*
				while (!BetState) {
					START_BET(iframe);				
					state = false
				}
				*/
			}
		}

		console.log('******Waiting*****');
		/**
		const newPage = await page.waitForSelector('div.header.h-100.d-flex.justify-content-between.align-items-center')


		let html = await newPage.evaluate(() => document.body.innerHTML);
		console.log(html);
		*/
	}catch(err){
		console.error(err)
	}
}

async function Launcher(){
	const browser = await puppeteer.launch({headless:false});
	const page = await browser.newPage();
	return page;
};

async function GET_WALLET_AMOUNT(iframe){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.main-header > app-header > div > div.second-block.d-flex > div > div.balance.px-2.d-flex.justify-content-end.align-items-center > div > span.amount.font-weight-bold'

	await iframe.waitForSelector(selector_value);     
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);      
	if (ElementHandle) {
		// Extract the content of the element
		const spanText = await iframe.evaluate(el => el.textContent.trim(), ElementHandle);
		console.log('Wallet Ammount:', spanText);
	} else {
		console.log('Element not found within the iframe.');
	}
}

async function SET_AUTO_BET(iframe){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > app-navigation-switcher > div > button:nth-child(3)'

	await iframe.waitForSelector(selector_value);     
	
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);      
	

	if (ElementHandle) {
		// click button to set to auto bet
		await ElementHandle?.evaluate(event => event.click());
		console.log('Auto Bet selected');
	} else {
		console.log('Element not found within the iframe.');
	}
}

async function SET_AUTO_CASHOUT(iframe){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.second-row > div.cashout-block > div.cash-out-switcher > app-ui-switcher > div > span'

	await iframe.waitForSelector(selector_value);     
	
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);      
	

	if (ElementHandle) {
		// click button to set to auto cashout
		await ElementHandle?.evaluate(event => event.click());
		console.log('Auto Cashout selected',);
	} else {
		console.log('Element not found within the iframe.');
	}
}

async function SET_AUTO_CASHOUT_VALUE(iframe){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.second-row > div.cashout-block > div.cashout-spinner-wrapper > div > app-spinner > div > div.input.full-width > input'
	let cashout_value = '1.15';

	await iframe.waitForSelector(selector_value);     
	
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);
	
	if (ElementHandle) {
		// Use the keyboard method to select all and delete:
		await iframe.click(selector_value, { clickCount: 3 }); // Triple-click to select all text
		//await iframe.keyboard.press('Backspace'); // Press backspace to delete selected text
		await iframe.type(selector_value,cashout_value, { delay: 100 })

		console.log('Auto Cashout value entered:',cashout_value);
	} else {
		console.log('Element not found within the iframe.');
	}
}

async function HANDLE_BUTTON_BET_STATE(iframe){
	const bet_selector_value = '.btn.btn-success.bet'
	const cancel_bet_selector_value = '.btn.btn-danger.bet'

	await iframe.waitForSelector(bet_selector_value, cancel_bet_selector_value);     
	
	// Locate the specific element within the iframe
    const BetElementHandle = await iframe.$(bet_selector_value);      
    const CancelElementHandle = await iframe.$(cancel_bet_selector_value);  

	if (CancelElementHandle){
		console.log('betting');
		//return false;
	}
	BetElementHandle?.evaluate(event => event.click());
	console.log('Bet clicked')
//	return true
}


async function START_BET(iframe){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.first-row.auto-game-feature > div.buttons-block > button'

	await iframe.waitForSelector(selector_value);     
	
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);      
	

	if (ElementHandle) {
		// click button to set to auto cashout
		await ElementHandle?.evaluate(event => event.click());
		console.log('Bet started');
	} else {
		console.log('Element not found within the iframe.');
	}
}


async function EXTRACT_MY_BETS(iframe){
	const parent_selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.info-board.pt-2 > app-bets-widget > div > app-my-bets-tab > div.h-100.scroll-y';
	const child_selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.info-board.pt-2 > app-bets-widget > div > app-my-bets-tab > div.h-100.scroll-y > app-bet-item > div';
	
	let extractedBets = []; // Initialize an empty array to store extracted bets

	await iframe.waitForSelector('div.h-100.scroll-y');   

	const parentElement = iframe.querySelector('div.h-100.scroll-y');
    const betItems = parentElement.querySelectorAll('app-bet-item');
/*
	const parentElementHandle = await iframe.querySelector(parent_selector_value);
	const childElementsHandle = await parentElementHandle.querySelectorAll('app-bet-item');
	*/
	betItems.forEach((betItem)=>{
		const time = betItem.querySelector('.date > div')?.textContent.trim() || '';
		const betAmount = betItem.querySelector('.bet .ng-star-inserted')?.textContent.trim() || '';
		const multiplier = betItem.querySelector('.multiplier-block .bubble-multiplier')?.textContent.trim() || '';
		const cashOut = betItem.querySelector('.cash-out')?.textContent.trim() || '';

		// Store the extracted data in an object
		extractedBets.push({
			time,
			betAmount,
	        multiplier,
		    cashOut
		});
	})
	console.log(extractedBets)
}

main()
