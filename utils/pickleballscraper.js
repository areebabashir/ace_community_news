import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.thedinkpickleball.com";

async function scrapeArticle(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Title
    const headline = $("h1.font-2").text().trim();

    // Images
    const images = [];
    let featuredImage = $(".featured-image img").attr("src");
    if (featuredImage) {
      // Only prepend base URL if the image path is relative
      if (!featuredImage.startsWith('http')) {
        featuredImage = "https://www.thedinkpickleball.com" + featuredImage;
      }
      images.push(featuredImage);
    }

    // Published date
    const publishedAtText = $("time").attr("datetime");
    let publishedAt = publishedAtText ? new Date(publishedAtText) : new Date();
    if (isNaN(publishedAt.getTime())) {
      publishedAt = new Date();
    }

    // Content
    const content = $(".content p")
      .map((i, el) => $(el).text().trim())
      .get()
      .join("\n\n"); // keep paragraph breaks

    return {
      title: headline, // Use headline as title for database
      headline: headline,
      content: content,
      published_at: publishedAt,
      visuals: { 
        images
      },
      category: "pickleball",
      approved: false,
      // url: url // Keeping URL for reference
    };
  } catch (error) {
    console.error(`❌ Error scraping article ${url}:`, error.message);
    return null;
  }
}

async function scrapeDink() {
  try { 
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    // Get article links
    const links = new Set();
    $("article > a").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        const fullLink = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        links.add(fullLink);
      }
    });

    console.log(`🔗 Found ${links.size} links.`);

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

// Save to JSON file
async function saveToJson(results) {
  try {
    fs.writeFileSync("dink_articles.json", JSON.stringify(results, null, 2), "utf-8");
    console.log("✅ Saved results to dink_articles.json");
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
async function scrapeDinkNews(saveToJsonFlag = true, saveToSqlFlag = false, SportsNewsModel = null) {
  try {
    const results = await scrapeDink();
    
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
    console.error("❌ Error in scrapeDinkNews:", error.message);
    throw error;
  }
}

// For standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeDinkNews(true, false).catch(console.error);
}

export { scrapeDinkNews, scrapeDink, scrapeArticle, saveToJson, saveToDatabase };