import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.thetennisgazette.com/news/";

async function scrapeArticle(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Title
    const headline = $(".hero-title h1").first().text().trim();

    // Published date
    let publishedAtText = $(".hero-title .post-date time").attr("datetime") 
                       || $(".hero-title .post-date time").text().trim();
    
    let publishedAt = null;
    if (publishedAtText) {
      publishedAt = new Date(publishedAtText);
      if (isNaN(publishedAt.getTime())) {
        publishedAt = new Date();
      }
    } else {
      publishedAt = new Date();
    }

    // Images (main hero image)
    const images = [];
    const heroImg = $(".hero-image img").attr("src");
    if (heroImg) images.push(heroImg);

    // Content (immediate <p> inside <article>)
    const content = $("article > p")
      .map((i, el) => $(el).text().trim())
      .get()
      .join("\n\n");

    return {
      title: headline,
      headline: headline,
      content: content,
      published_at: publishedAt,
      visuals: { images },
      category: "tennis",
      approved: false
    };
  } catch (error) {
    console.error(`❌ Error scraping article ${url}:`, error.message);
    return null;
  }
}

async function scrapeTennisGazette() {
  try {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    // Collect article links from h2 > a
    const links = [];
    $("h2 > a").each((i, el) => {
      const href = $(el).attr("href");
      if (href) links.push(href);
    });

    console.log(`🔗 Found ${links.length} links.`);

    // Visit each article
    const results = [];
    for (const link of links) {
      console.log(`📄 Scraping: ${link}`);
      const article = await scrapeArticle(link);
      if (article) results.push(article);
    }

    return results;
  } catch (error) {
    console.error("❌ Error scraping main page:", error.message);
    throw error;
  }
}

// Save to JSON
async function saveToJson(results) {
  try {
    fs.writeFileSync("tennis_articles.json", JSON.stringify(results, null, 2), "utf-8");
    console.log("✅ Saved results to tennis_articles.json");
    return results;
  } catch (error) {
    console.error("❌ Error saving to JSON:", error.message);
    throw error;
  }
}

// Save to SQL
async function saveToDatabase(results, SportsNewsModel) {
  try {
    const savedNews = [];
    const skippedNews = [];

    for (const newsItem of results) {
      try {
        const existingNews = await SportsNewsModel.findOne({
          where: {
            title: newsItem.title,
            published_at: newsItem.published_at
          }
        });

        if (!existingNews) {
          const savedItem = await SportsNewsModel.create(newsItem);
          savedNews.push(savedItem);
        } else {
          skippedNews.push(newsItem.title);
        }
      } catch (saveError) {
        console.error("Error saving news item:", saveError);
      }
    }

    console.log(`✅ Saved ${savedNews.length} new articles, skipped ${skippedNews.length} duplicates`);
    return { savedNews, skippedNews };
  } catch (error) {
    console.error("❌ Error saving to database:", error.message);
    throw error;
  }
}

// Main orchestrator
async function scrapeTennisGazetteNews(saveToJsonFlag = true, saveToSqlFlag = false, SportsNewsModel = null) {
  try {
    const results = await scrapeTennisGazette();

    let jsonResult = null;
    let sqlResult = null;

    if (saveToJsonFlag) {
      jsonResult = await saveToJson(results);
    }

    if (saveToSqlFlag && SportsNewsModel) {
      sqlResult = await saveToDatabase(results, SportsNewsModel);
    }

    return {
      scraped: results.length,
      json: jsonResult,
      sql: sqlResult
    };
  } catch (error) {
    console.error("❌ Error in scrapeTennisGazetteNews:", error.message);
    throw error;
  }
}

// For standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeTennisGazetteNews(true, true).catch(console.error);
}

export { scrapeTennisGazetteNews, scrapeTennisGazette, scrapeArticle, saveToJson, saveToDatabase };
