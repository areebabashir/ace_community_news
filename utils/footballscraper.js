import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.theguardian.com/football";

async function scrapeArticle(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Title/Headline
    const headline = $("h1").text().trim();

    // Images
    const images = [];
    const mainImage = $("picture img").attr("src");
    if (mainImage) {
      images.push(mainImage);
    }

    // Published date - extract from summary span
    const publishedAtText = $("summary span").text().trim();
    let publishedAt = null;
    
    if (publishedAtText) {
      // Parse the date format "Tue 19 Aug 2025 04.58 BST"
      const dateMatch = publishedAtText.match(/(\w{3})\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{1,2})\.(\d{2})\s+(\w{3})/);
      if (dateMatch) {
        const [, dayName, day, month, year, hour, minute, timezone] = dateMatch;
        const monthMap = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        const monthIndex = monthMap[month];
        if (monthIndex !== undefined) {
          publishedAt = new Date(parseInt(year), monthIndex, parseInt(day), parseInt(hour), parseInt(minute));
        }
      }
      
      // Fallback to simple date parsing if regex doesn't match
      if (!publishedAt || isNaN(publishedAt.getTime())) {
        publishedAt = new Date(publishedAtText);
      }
      
      // Final fallback to current date
      if (isNaN(publishedAt.getTime())) {
        publishedAt = new Date();
      }
    } else {
      publishedAt = new Date();
    }

    // Content
    const content = $(".article-body-commercial-selector p")
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
      category: "football",
      approved: false,
      url: url // Keeping URL for reference
    };
  } catch (error) {
    console.error(`❌ Error scraping article ${url}:`, error.message);
    return null;
  }
}

async function scrapeGuardianNews() {
  try { 
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    // Get article links from anchor tags with data-link-name containing "news"
    const links = new Set();
    $("a[data-link-name]").each((i, el) => {
      const dataLinkName = $(el).attr("data-link-name");
      const href = $(el).attr("href");
      
      // Check if data-link-name contains "news" and href exists
      if (dataLinkName && dataLinkName.includes("news |") && href) {
          const fullLink = href.startsWith("http") ? href : `https://www.theguardian.com${href}`;
          console.log(dataLinkName, fullLink);
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
    fs.writeFileSync("fifa_articles.json", JSON.stringify(results, null, 2), "utf-8");
    console.log("✅ Saved results to fifa_articles.json");
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
async function scrapeGuardianNewsArticles(saveToJsonFlag = true, saveToSqlFlag = false, SportsNewsModel = null) {
  try {
    const results = await scrapeGuardianNews();
    
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
    console.error("❌ Error in scrapeGuardianNewsArticles:", error.message);
    throw error;
  }
}

// For standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
    scrapeGuardianNewsArticles(true, false).catch(console.error);
}
    
export { scrapeGuardianNewsArticles, scrapeGuardianNews, scrapeArticle, saveToJson, saveToDatabase };