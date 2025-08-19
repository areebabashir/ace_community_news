import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.padelfip.com/news/";

async function scrapeArticle(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Title
    const headline = $("h1").first().text().trim();

    // Images
    const images = [];

    $(".item__img img").each((i, el) => {
      let imgUrl = $(el).attr("src");
  
      // If it's a placeholder, try lazy-load attributes
      if (imgUrl && imgUrl.startsWith("data:image")) {
        imgUrl = $(el).attr("data-src") || $(el).attr("data-srcset") || $(el).attr("srcset");
      }
  
      if (imgUrl) {
        images.push(imgUrl);
      }
    });

    // Published date
    const publishedAtText = $(".item__date span").last().text().trim();

    // Content
    const content = $(".item__content p")
      .map((i, el) => $(el).text().trim())
      .get()
      .join("\n\n"); // keep paragraph breaks

    // Parse published date
    let publishedAt = null;
    if (publishedAtText) {
      publishedAt = new Date(publishedAtText);
      if (isNaN(publishedAt.getTime())) {
        // Try alternative date formats
        const dateMatch = publishedAtText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
        if (dateMatch) {
          publishedAt = new Date(dateMatch[0]);
        }
        if (isNaN(publishedAt.getTime())) {
          publishedAt = new Date();
        }
      }
    } else {
      publishedAt = new Date();
    }

    return {
      title: headline, // Use headline as title for database
      headline: headline,
      content: content,
      published_at: publishedAt,
      visuals: { 
        images
      },
      category: "padel",
      approved: false
    };
  } catch (error) {
    console.error(`❌ Error scraping article ${url}:`, error.message);
    return null;
  }
}

async function scrapePadel() {
  try { 
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    // Get article links
    const links = [];
    $("a.item__link").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        const fullLink = href.startsWith("http") ? href : new URL(href, BASE_URL).href;
        links.push(fullLink);
      }
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

// Save to JSON file (original functionality)
async function saveToJson(results) {
  try {
    fs.writeFileSync("articles.json", JSON.stringify(results, null, 2), "utf-8");
    console.log("✅ Saved results to articles.json");
    return results;
  } catch (error) {
    console.error("❌ Error saving to JSON:", error.message);
    throw error;
  }
}

// Save to SQL database
async function saveToDatabase(results, SportsNewsModel) {
  try {
    const savedNews = [];
    const skippedNews = [];
    
    for (const newsItem of results) {
      try {
        // Check if news already exists (by title and published date)
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
        console.error('Error saving news item:', saveError);
      }
    }

    console.log(`✅ Saved ${savedNews.length} new articles to database, skipped ${skippedNews.length} duplicates`);
    return { savedNews, skippedNews };
  } catch (error) {
    console.error("❌ Error saving to database:", error.message);
    throw error;
  }
}

// Main scraping function that can save to both JSON and SQL
async function scrapePadelNews(saveToJsonFlag = true, saveToSqlFlag = false, SportsNewsModel = null) {
  try {
    const results = await scrapePadel();
    
    let jsonResult = null;
    let sqlResult = null;

    // Save to JSON if requested
    if (saveToJsonFlag) {
      jsonResult = await saveToJson(results);
    }

    // Save to SQL if requested and model provided
    if (saveToSqlFlag && SportsNewsModel) {
      sqlResult = await saveToDatabase(results, SportsNewsModel);
    }

    return {
      scraped: results.length,
      json: jsonResult,
      sql: sqlResult
    };

  } catch (error) {
    console.error("❌ Error in scrapePadelNews:", error.message);
    throw error;
  }
}

// For standalone execution (original functionality)
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapePadelNews(true, true).catch(console.error);
}

export { scrapePadelNews, scrapePadel, scrapeArticle, saveToJson, saveToDatabase };
