import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.cbssports.com/nba/";

async function scrapeArticle(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Title/Headline
    const headline = $(".Article-headline").text().trim();

    // Images
    const images = [];
    const mainImage = $(".Article-featuredImageImg").attr("src");
    if (mainImage) {
      images.push(
         mainImage
       
      );
    }

    // Published date - extract from time element with datetime attribute
    const publishedAtText = $(".TimeStamp").attr("datetime");
    let publishedAt = null;
    
    if (publishedAtText) {
      publishedAt = new Date(publishedAtText);
      if (isNaN(publishedAt.getTime())) {
        publishedAt = new Date();
      }
    } else {
      publishedAt = new Date();
    }

    // Content
    const content = $(".Article-bodyContent p")
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
      category: "basketball",
      approved: false,
      url: url // Keeping URL for reference
    };
  } catch (error) {
    console.error(`❌ Error scraping article ${url}:`, error.message);
    return null;
  }
}

async function scrapeCbsNbaNews() {
  try { 
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    // Get article links from h5 elements with article-list-pack-title class
    const links = new Set();
    $("h5.article-list-pack-title a").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        const fullLink = href.startsWith("http") ? href : `https://www.cbssports.com${href}`;
        links.add(fullLink);
      }
    });

    console.log(`🔗 Found ${links.size} news links.`);

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
    fs.writeFileSync("cbs_nba_articles.json", JSON.stringify(results, null, 2), "utf-8");
    console.log("✅ Saved results to cbs_nba_articles.json");
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
async function scrapeCbsNbaNewsArticles(saveToJsonFlag = true, saveToSqlFlag = false, SportsNewsModel = null) {
  try {
    const results = await scrapeCbsNbaNews();
    
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
    console.error("❌ Error in scrapeCbsNbaNewsArticles:", error.message);
    throw error;
  }
}

// For standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeCbsNbaNewsArticles(true, false).catch(console.error);
}

export { scrapeCbsNbaNewsArticles, scrapeCbsNbaNews, scrapeArticle, saveToJson, saveToDatabase };
