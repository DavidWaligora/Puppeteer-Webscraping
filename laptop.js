import puppeteer from "puppeteer";
import { scrapeSpecifications } from "./specificaties.js";
import { fileWrite } from "./filewriter.js";

async function scrapeLaptops() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );

  let laptops = [];
  let currentPage = 1;
  let nextPageExists = true;

  while (nextPageExists){
    await page.goto(
      `https://www.coolblue.be/nl/laptops/filter/besturingssysteem:windows,macos?pagina=${currentPage}`,
      { waitUntil: "networkidle0" }
    );


  const laptopsOnPage = await page.$$eval(".product-card", (rows) => {
    return rows.map((row) => ({
      productTitle: row
        .querySelector(".product-card__title")
        .textContent.trim(),

        price: parseFloat(
          row
            .querySelector(".sales-price__current")
            .textContent
            .trim()
            .replace(",-", "")         // Remove any ',-' suffix
            .replace(/\./g, "")        // Remove dots used as thousand separators
            .replace(",", ".")         // Replace comma with a period (decimal separator)
        ) || 0,
      //reviews parsen naar float
      reviews: parseFloat(
        row
          .querySelector(".review-rating__reviews")
          .textContent.trim()
          .replace(" ", "")
          .replace("reviews", "")
      ) || 0,
      beschikbaarheid: row.querySelector(".color--available") != null,
      productLink: row.querySelector(".product-card__title a").href,
    }));
  });

  for (let laptop of laptopsOnPage) {
    if (laptop.productLink != "") {
      try {
        const specifications = await scrapeSpecifications(laptop.productLink);
        laptop.specificaties = specifications;
      } catch (err) {
        console.error(`errortje ${laptop.productTitle} heeft een fout: `, err);
      }
    }
  }
  laptops = laptops.concat(laptopsOnPage)

  // Checken of next pagina  bestaat
  nextPageExists = await page.$('.pagination__link[rel="next"]') !== null;
  
  nextPageExists ? currentPage++ : null;

}

const filteredProducts = laptops.filter((laptop) => {
  // Ensure the price is treated as a number
  const price = parseFloat(laptop.price);
  
  return (
    parseFloat(laptop.specificaties.ram.trim().replace('GB', '')) >= 16 &&
    laptop.specificaties.processor === 'Intel Core i7' &&
    parseFloat(laptop.specificaties.schermdiagonaal.trim().replace('inch', '')) >= 15 &&
    price <= 1500
  );
});
  
  

  console.log("Laptops", laptops);

  console.log("Mijnkeuze", filteredProducts);

  // schrijven van het bestand (enkel als het bestand nog niet bestaat)
  const dirPath = "./mijnKeuzeLaptops.json";
  fileWrite(filteredProducts, dirPath);

  await browser.close();
}

export { scrapeLaptops };
