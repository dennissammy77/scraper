import puppeteer, { Puppeteer} from "puppeteer";
import cheerio from "cheerio"; // 
import { select, filter, is, some } from "cheerio-select";
//import { once } from 'events';
import moment from 'moment';
import fs from 'fs';
import path  from 'path';

async function main(){
	try{
		// Launch Bot
		const page = await Launcher();	
		const url = 'https://www.betika.com/en-ke/aviator'
		await page.goto(url,{timeout:0})
		
		// Initialize the game from menu
		INITIALIZE(page);
		await page.waitForSelector('#aviator-iframe');
		const iframeElementHandle = await page.$('#aviator-iframe');

		console.log('******Waiting*****');

		// IFRAME Set up
		if (!iframeElementHandle) {
			throw new Error('IFrame Handler could not be identified');
		};
		
		const iframe = await iframeElementHandle.contentFrame();
		if (!iframe){
			throw new Error('IFrame  could not be identified');
		}
		// SETUP PARAMETERS: Auto bet , Auto CashOut, Prediction Value, 
		// BET HISTORY 

		let BET_HISTORY_ARRAY = [];
		const starting_wallet_starting_amount = await GET_WALLET_AMOUNT(iframe);
		const starting_time = moment(Date.now()).format('h:mm:ss');;
		let elapsed_time, wallet_amount_after_bet, wallet_amount_before_bet, bet_amount_placed=10, prediction=1.15, gain, cashout;

		SETUP(iframe,JSON.stringify(prediction))
		// INITIALIZE BOT
		async function HANDLE_BUTTON_BET_STATE(){
			// Verify Prediction has been correctly placed
			const PREDICTION_VALUE = await PREDICTION_VERIFIER(iframe)
			
			if ( PREDICTION_VALUE !== JSON.stringify(prediction)){
				SET_AUTO_CASHOUT_VALUE(iframe,JSON.stringify(prediction))
				return;
			}

			// Verify Button State
			const BETTING_STATE = await BET_BUTTON_STATE(iframe)

			if (!BETTING_STATE){
				return;
			}

			// SET amount before bet
			wallet_amount_before_bet = await GET_WALLET_AMOUNT(iframe);

			// Track button state
			const BETTNG_STATE_TRACKER = await BET_BUTTON_STATE_TRACKER(iframe);

			if ( BETTNG_STATE_TRACKER ){
				BETTING_STATE?.evaluate(event => event.click());
				// Set amount after bet
				wallet_amount_after_bet = await GET_WALLET_AMOUNT(iframe);

				// Track bets
				if ( wallet_amount_after_bet > wallet_amount_before_bet ){
					cashout = bet_amount_placed * parseFloat(prediction); // bet won
				}
				
				if ( wallet_amount_after_bet === wallet_amount_before_bet ){
				//	return; // Do not push into bet history array
					cashout = 0
				}
				
				if ( wallet_amount_after_bet < wallet_amount_before_bet ){
					cashout = 0; // bet lost
				}
				gain = wallet_amount_after_bet - starting_wallet_starting_amount; // profit / loss tracker

				// Push into history array
				const data = {
					starting_time:		starting_time,
					time:				moment(Date.now()).format('h:mm:ss'),
					starting_amount:	starting_wallet_starting_amount,
					initial_amount:		wallet_amount_before_bet,
					final_amount:		wallet_amount_after_bet,
					stake:				bet_amount_placed,
					multiplier:			prediction,
					cashout:			cashout,
					p_l:				cashout - bet_amount_placed,
					gain:				gain

				};
				BET_HISTORY_ARRAY.push(data)
				//SAVE_TO_FILE('output.json', JSON.stringify(data));
				console.table(BET_HISTORY_ARRAY)
			}
		}
		// RUN after 1.5 sec
		setInterval(
			HANDLE_BUTTON_BET_STATE,
			1500
		);

	}catch(err){
		console.error(err)
	}
}

async function Launcher(){
	const browser = await puppeteer.launch({headless:true});
	const page = await browser.newPage();
	return page;
};

async function INITIALIZE(page){
	const event = await page.$('button.account__payments__submit.button.button__secondary.purple');
	await event?.evaluate(event => event.click());
	
	return
}

async function SETUP(iframe,prediction){
	GET_WALLET_AMOUNT(iframe);
	SET_AUTO_BET(iframe);
	SET_AUTO_CASHOUT(iframe);
	SET_AUTO_CASHOUT_VALUE(iframe,prediction);
}

async function GET_WALLET_AMOUNT(iframe){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.main-header > app-header > div > div.second-block.d-flex > div > div.balance.px-2.d-flex.justify-content-end.align-items-center > div > span.amount.font-weight-bold'

	await iframe.waitForSelector(selector_value);     
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);      
	if (ElementHandle) {
		// Extract the content of the element
		const spanText = await iframe.evaluate(el => el.textContent.trim(), ElementHandle);
		console.log('Wallet Ammount:', spanText);
		return parseFloat(spanText)
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

async function SET_AUTO_CASHOUT_VALUE(iframe,prediction){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.second-row > div.cashout-block > div.cashout-spinner-wrapper > div > app-spinner > div > div.input.full-width > input'
	let cashout_value = prediction;

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

async function PREDICTION_VERIFIER(iframe){
	const element_selector = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.second-row > div.cashout-block > div.cashout-spinner-wrapper > div > app-spinner > div > div.input.full-width > input'
	
	await iframe.waitForSelector(element_selector);
	const INPUTFIELD_HANDLER = await iframe.$(element_selector);
	
	if (INPUTFIELD_HANDLER) {
		let INPUTFIELD_VALUE = await iframe.evaluate(input => input.value, INPUTFIELD_HANDLER);
		console.log(INPUTFIELD_VALUE);
		return INPUTFIELD_VALUE;
	} else {
		throw new Error('Element not found within the iframe.');
		return null;
	}
}

async function BET_BUTTON_STATE(iframe){
	const bet_element_selector = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.first-row.auto-game-feature > div.buttons-block > button'
	const cancel_element_selector = '.btn.btn-danger.bet'
	
	await iframe.waitForSelector(bet_element_selector, cancel_element_selector,  { timeout: 600000 });
	
	// Locate the specific element within the iframe
	
	const BET_STATE_HANDLER = await iframe.$(bet_element_selector, { timeout: 600000 });
	const CANCEL_BET_STATE_HANDLER = await iframe.$(cancel_element_selector, { timeout: 600000 }); 
	
	if (CANCEL_BET_STATE_HANDLER){
		console.log('bet in progress');
		return false;
	}
	if (BET_STATE_HANDLER){
		return BET_STATE_HANDLER
	}
}

async function BET_BUTTON_STATE_TRACKER(iframe){
	const element_selector = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.first-row.auto-game-feature.auto-game > div.buttons-block > button > span > label.label.text-uppercase';

	await iframe.waitForSelector(element_selector);
	let Label = '';
	const LABEL_HANDLER = await iframe.$(element_selector);

	if (LABEL_HANDLER){
		// Extract the content of the element
		Label = await iframe.evaluate(el => el.textContent.trim(), LABEL_HANDLER);
		if ( Label === 'Bet' ) {
			return true;
		}
		return false;
	} else {
		throw new Error('Element not found within the iframe.');
	}
}

const SAVE_TO_FILE=(file, content)=>{
	const __dirname = path.resolve();
	const filePath = path.join(__dirname, file);

	fs.readFile(filePath,function(err,content){
		if(err) throw err;
		var parseJson = JSON.parse(content);
		for (i=0; i <11 ; i++){
			parseJson.table.push({id:i, square:i*i})
		}
		fs.writeFile('data.json',JSON.stringify(parseJson),function(err){
			if(err) throw err;
		})
	})

	// Append data to the file
    fs.appendFile(filePath, data + '\n', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Data saved:', data);
        }
    });
}

main()
