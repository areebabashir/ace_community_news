import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeLinks() {
  try {
    const url = "https://www.padelfip.com/news/";
    const { data } = await axios.get(url);

    // Load HTML into cheerio
    const $ = cheerio.load(data);

    // Collect all anchor hrefs with class "item__link"
    const links = [];
    $("a.item__link").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        // Convert relative URLs to absolute
        const fullLink = href.startsWith("http") ? href : new URL(href, url).href;
        links.push(fullLink);
      }
    });

    console.log(links);
    return links;
  } catch (error) {
    console.error("Error scraping:", error.message);
  }
}

scrapeLinks();
