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

		const STARTING_WALLET_AMOUNT = await GET_WALLET_AMOUNT(iframe);
		const STARTING_TIME = moment(Date.now()).format('h:mm:ss');;
		let 
			ELAPSED_TIME_HOURS,
			CURRENT_TIME,
			WALLET_AMOUNT_AFTER_BET, 
			WALLET_AMOUNT_BEFORE_BET, 
			STAKE=10, 
			PREDICTION= process.argv[2] || 1.15,
			CLOSING_MULTIPLIER,
			CASHOUT, 
			P_L,
			IS_RUNNING=false
		;

		SETUP(iframe,JSON.stringify(PREDICTION))
		// INITIALIZE BOT
		async function HANDLE_BUTTON_BET_STATE(){
			// Verify Prediction has been correctly placed
			const PREDICTION_VALUE = await PREDICTION_VERIFIER(iframe)
			
			if ( PREDICTION_VALUE !== JSON.stringify(PREDICTION)){
				SET_AUTO_CASHOUT_VALUE(iframe,JSON.stringify(PREDICTION))
				return;
			}

			// Verify Button State
			const BETTING_STATE = await BET_BUTTON_STATE(iframe)
/*
			if (!BETTING_STATE){
				return;
			}
			*/
			// SET amount before bet

			// Track button state
			const BETTING_STATE_TRACKER = await BET_BUTTON_STATE_TRACKER(iframe,BETTING_STATE);
			//const NEXT_ROUND_STATE_TRACKER = await WAIT_FOR_NEXT_ROUND_STATE_TRACKER(iframe)
			// 
			// get wallet amount before bet is placed: 4959.80
			// Click button to start bet 
			// Wait for active run to end: Wait for next round shows
			// stake cash: 10
			// Track start of run: CashOut
			// Track run : Cashout
			// Track end of run : Cancel shows
			// record wallet amount, multiplier after bet is placed
			const CLEAR_RECORD_VALUES=()=>{
				CURRENT_TIME = ''
				ELAPSED_TIME_HOURS = 0
				WALLET_AMOUNT_BEFORE_BET = 0
				WALLET_AMOUNT_AFTER_BET = 0
				CLOSING_MULTIPLIER = 0
				CASHOUT = 0
				P_L = 0
			}
			console.log(BETTING_STATE_TRACKER)
			
			if ( BETTING_STATE ){ 
				CLEAR_RECORD_VALUES()
				// If bet window is open place a bet and record wallet amount before bet
				WALLET_AMOUNT_BEFORE_BET = await GET_WALLET_AMOUNT(iframe,'before bet');
			
				BETTING_STATE?.evaluate(event => event.click()); // place bet

				return;
			};

			if ( !BETTING_STATE){
				// If the bet has been cashed out and waiting for current round to end
				if (WALLET_AMOUNT_AFTER_BET?.length > 0){
					// Checks if wallet amount after bet exists
					return;	
				}
				const CURRENT_WALLET_AMOUNT = await GET_WALLET_AMOUNT(iframe,'after bet');
				if (CURRENT_WALLET_AMOUNT === WALLET_AMOUNT_BEFORE_BET){
					// Exit out of function to not record wallet amount, 
					// Since the stake has not been deducted
					// 
					return;
				}
				WALLET_AMOUNT_AFTER_BET = await GET_WALLET_AMOUNT(iframe,'Recording after bet'); // Record wallet amount	 
				return;
			}
			
			if ( !BETTING_STATE && await WAIT_FOR_NEXT_ROUND_STATE_TRACKER(iframe)){ 
				// Cancel bet placed
				// Next round is starting
				//wallet_amount_after_bet = await GET_WALLET_AMOUNT(iframe);
				if (CLOSING_MULTIPLIER?.length === 0 ){
					CLOSING_MULTIPLIER = await GET_MULTIPLIER(iframe); // record multiplier that closed off round
					ELAPSED_TIME = moment.duration(end.diff(STARTING_TIME));
					const ELAPSED_TIME_HOURS = duration.asHours();
					CURRENT_TIME = moment(Date.now()).format('h:mm:ss')
					if((WALLET_AMOUNT_AFTER_BET - WALLET_AMOUNT_BEFORE_BET ) > 0){
						CASHOUT = WALLET_AMOUNT_AFTER_BET - WALLET_AMOUNT_BEFORE_BET
					}else if((WALLET_AMOUNT_AFTER_BET - WALLET_AMOUNT_BEFORE_BET) < 0){
						CASHOUT = 0
					}
					P_L = CASHOUT - STAKE;
					// Push into history array
					const BET_RECORD_DATA = { 
						STARTED_AT:					STARTING_TIME,
						CURRENT_TIME:				CURRENT_TIME,
						ELAPSED_TIME:				ELAPSED_TIME_HOURS,
						STARTING_WALLET_AMOUNT:		STARTING_WALLET_AMOUNT,
						WALLET_AMOUNT_BEFORE_BET:	WALLET_AMOUNT_BEFORE_BET,
						WALLET_AMOUNT_AFTER_BET:	WALLET_AMOUNT_AFTER_BET ,
						STAKE:						STAKE,
						PREDICTION:					PREDICTION,
						MULTIPLIER:					CLOSING_MULTIPLIER,
						CASHOUT:					CASHOUT,
						P_L:						P_L,
					};

					BET_HISTORY_ARRAY.push(BET_RECORD_DATA)
					//SAVE_TO_FILE('output.json', JSON.stringify(data));
					console.table(BET_HISTORY_ARRAY)
				}
		
			}
		}
		// RUN after 1.5 sec
		setInterval(
			HANDLE_BUTTON_BET_STATE,
			2000
		);

	}catch(err){
		console.error(err)
	}
}

async function Launcher(){
	const browser = await puppeteer.launch({headless:false});
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

async function GET_WALLET_AMOUNT(iframe, message){
	const selector_value = 'body > app-root > app-game > div > div.main-container > div.main-header > app-header > div > div.second-block.d-flex > div > div.balance.px-2.d-flex.justify-content-end.align-items-center > div > span.amount.font-weight-bold'

	await iframe.waitForSelector(selector_value);     
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);      
	if (ElementHandle) {
		// Extract the content of the element
		const spanText = await iframe.evaluate(el => el.textContent.trim(), ElementHandle);
		console.log('Wallet Ammount:', spanText,message);
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

	await iframe.waitForSelector(selector_value);     
	
	// Locate the specific element within the iframe
    const ElementHandle = await iframe.$(selector_value);
	
	if (ElementHandle) {
		// Use the keyboard method to select all and delete:
		await iframe.click(selector_value, { clickCount: 2 }); // Triple-click to select all text
		//await iframe.keyboard.press('Backspace'); // Press backspace to delete selected text
		await iframe.type(selector_value,prediction)

		console.log('Prediction value entered:',prediction);
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
	try{
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
	}catch(error){
		console.error(error)
	}
}

async function BET_BUTTON_STATE_TRACKER(iframe,BET_BUTTON_STATE){
	const element_selector = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control:nth-child(1) > div > div.first-row.auto-game-feature.auto-game > div.buttons-block > button > span > label.label.text-uppercase';
	try{
		await iframe.waitForSelector(element_selector, { timeout: 600000 });
		let Label = '';
		const LABEL_HANDLER = await iframe.$(element_selector);
		
		if (LABEL_HANDLER && BET_BUTTON_STATE){
			// Extract the content of the element
		
			Label = await iframe.evaluate(el => el.textContent.trim(), LABEL_HANDLER);
			return Label;
		} else {
			throw new Error('Element not found within the iframe.');
		}
	}catch(error){
		console.error(error)
	}
}

async function WAIT_FOR_NEXT_ROUND_STATE_TRACKER(iframe){
	const ELEMENT_SELECTOR = 'body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.bet-controls > app-bet-controls > div > app-bet-control.bet-control.double-bet.ng-star-inserted > div > div.first-row.auto-game-feature > div.buttons-block > div';
	try{
		await iframe.waitForSelector(ELEMENT_SELECTOR,{ timeout: 600000 });
		let Label = '';
		const LABEL_HANDLER = await iframe.$(ELEMENT_SELECTOR);

		if (LABEL_HANDLER){
			return false
		} else {
			return true
			//throw new Error('Element not found within the iframe.');
			//return false
		}
	}catch(error){
		console.error(error)
	}
}

const GET_MULTIPLIER=async(iframe)=>{
	const ELEMENT_SELECTOR = `body > app-root > app-game > div > div.main-container > div.w-100.h-100 > div > div.game-play > div.result-history.disabled-on-game-focused.my-2 > app-stats-widget > div > div.payouts-wrapper > div > app-bubble-multiplier:nth-child(1) > div`
	await iframe.waitForSelector(ELEMENT_SELECTOR,{ timeout: 600000 });
	const ELEMENT_HANDLER = await iframe.$(ELEMENT_SELECTOR);
	try{
		if (ELEMENT_HANDLER) {
		// Extract the content of the element
			const ELEMENT_TEXT = await iframe.evaluate(el => el.textContent.trim(), ELEMENT_HANDLER);
			console.log('Multiplier:', ELEMENT_TEXT);
			return parseFloat(ELEMENT_TEXT)
		} else {
			console.log('Element not found within the iframe.');
		}
	}catch(error){
		console.error(error)
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
