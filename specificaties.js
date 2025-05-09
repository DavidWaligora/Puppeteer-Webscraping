import puppeteer from "puppeteer";

async function scrapeSpecifications(link) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
    );
    await page.goto(link, { waitUntil: 'networkidle0' });

    const specifications = await page.evaluate(() => {
        const getSpecValue = (name) => {
            const specRow = [...document.querySelectorAll('.product-specs__list-item')].find(
                el => el.getAttribute('data-property-name').includes(name)
            );
            
            // If the row is found, get the value from the data-property-value attribute
            return specRow ? specRow.querySelector('.js-spec-value').textContent.trim() : 'Not Available';
        };

        // Extract the necessary specifications
        return {
            ram: getSpecValue('Intern werkgeheugen (RAM)'),        // RAM
            processor: getSpecValue('Processor'),                  // Processor
            storage: getSpecValue('Totale opslagcapaciteit'),       // Storage
            schermdiagonaal: getSpecValue('Schermdiagonaal')        // Screen size
        };
    });

    await browser.close();

    return specifications;  // Return the scraped specifications
}

export { scrapeSpecifications };
