import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const url = 'https://spribe.co/games/aviator';

  try {
    await page.goto(url);

    // Click on elements
    let html = await page.evaluate(()=> document.body.innerHTML);
    const $ = cheerio.load(html);

    const event = await page.$('a.demo-link');
    await event.evaluate( event => event.click() );

    const eventmodal = await page.$('button.btn.btn-md.btn-primary.btn-age.mt-3.mt-lg-0');
    await eventmodal.evaluate( eventmodal => eventmodal.click() );

    const trackDataChanges = async () => {
        //await page.waitForSelector('div.payouts-block > div.payouts.ng-star-inserted');

        const htmlContent = await page.content(); // Get the HTML content of the page
        const $ = cheerio.load(htmlContent); // Load the HTML content into Cheerio
    
        let trackedData = [];
        $('div.payouts-block > div.payouts.ng-star-inserted').each((index, element) => {
          const multiplier = $(element).find('div.bubble-multiplier').text().trim();
          console.log('Multiplier:', multiplier);
          trackedData.push(multiplier);
        });

        console.log('Tracked Data:', trackedData);
    };

    // Track data changes every 5 seconds (adjust interval as needed)
    setInterval(trackDataChanges, 5000);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    //await browser.close();
  }
})();
