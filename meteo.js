import puppeteer from "puppeteer";
import { fileWrite } from "./filewriter.js";

// Scrapen van meteo
async function scrapeMeteo() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );

  // Navigate the page to a URL.
  await page.goto("https://www.meteo.be/en/belgium", {
    waitUntil: "networkidle0",
  });

  //titel toevoegen en checken voor errors
  let pageTitle;
  try {
    pageTitle = await page.$eval(
      ".days-of-the-week__pre",
      (element) => element.textContent.trim() + " Belgium"
    );
  } catch (error) {
    console.error("Error getting page title:", error);
  }

  // days of week toevoegen aan console
  //ophalen van alle day of the week kaarten
  const weer = await page.$$eval("day-of-the-week", (kaarten) => {
    //mappen van iedere attribuut in kaarten > steekt het in weer.
    try {
      return kaarten.map((day) => {
        // de timestamp gebruiken om de datum te genereren voor iedere dag.
        const timestamp = parseInt(day.getAttribute("timestamp"));
        const d = new Date(timestamp * 1000);
        const date = d.toLocaleString("nl-BE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        //returnen van de attributen naar de kaart
        return {
          //dag ophalen
          dayName: day.getAttribute("name"),
          //date ophalen uit bovenstaande functie

          date,
          //mintemperatuur ophalen

          minTemp:
            parseInt(day.getAttribute("mintemp")) ||
            "< " + (day.getAttribute("maxtemp") || null),

          //maxtemp ophalen
          maxTemp:
            parseInt(day.getAttribute("maxtemp")) ||
            "> " + (day.getAttribute("mintemp") || null),

          //humidity ophalen
          humidityPercentage: parseInt(day.getAttribute("humiditypct")),

          //windsnelheid
          windSpeedBft: parseInt(day.getAttribute("windspeedbft")) || null,
        };
      });
    } catch (error) {
      console.error("Error parsing weather data:", error);
    }
  });

  console.log("Titel", pageTitle);
  console.log("Het weer in belgie", weer);

  const filteredwWeather = weer.filter((data) => {
   
    return (
        data.maxTemp >= 20 &&
        data.windSpeedBft < 4 &&
        data.humidityPercentage < 50
    );
  });
  const dirPath = "./goodWeatherDays.json";
  fileWrite(filteredwWeather, dirPath )

  await browser.close();
}

export { scrapeMeteo };
