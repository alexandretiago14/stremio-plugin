const axios = require('axios');
const cheerio = require('cheerio');
const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

/**
 * Scrapes Netflix genre page for content
 * @param {string} genreUrl - The Netflix genre URL to scrape
 * @param {string} type - Content type ('movie' or 'series')
 * @returns {Promise<Array>} Array with scraped content data
 */
async function scrapeNetflixGenre(genreUrl = 'https://www.netflix.com/pt-en/browse/genre/81602050', type = 'movie') {
  try {
    console.log(`Starting scraping of Netflix genre page: ${genreUrl}`);
    
    // Make HTTP request to the genre page
    const response = await axios.get(genreUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    // Load HTML into Cheerio
    const $ = cheerio.load(response.data);
    
    // Array to store results
    const genreResults = [];
    // get daqui https://www.netflix.com/pt-en/browse/genre/81602050
    // Use the specific Netflix collections row selector
    const elements = $('.nm-collections-row');
    
    let foundContent = false;
    
    if (elements.length > 0) {
      console.log(`Found ${elements.length} collection rows using selector: .nm-collections-row`);
      foundContent = true;
      
      // Process each collection row
      elements.each((index, row) => {
        const $row = $(row);
        
        // Find title cards within each collection row
        const titleCards = $row.find('.nm-collections-title-card, .title-card, .slider-item');
        
        titleCards.each(async (cardIndex, card) => {
          if (genreResults.length >= 20) return false; // Limit to 20 items
          
          const $card = $(card);
          
          // Extract title from various possible locations
          let title = $card.find('.fallback-text').text().trim() ||
                     $card.find('[aria-label]').attr('aria-label') ||
                     $card.find('img').attr('alt') ||
                     $card.find('.title').text().trim() ||
                     $card.attr('aria-label') ||
                     '';
          
          // Clean up title
          title = title.replace(/^Watch\s+/i, '').trim();
          
          if (!title) return;
          
          // Extract poster image
          let poster = $card.find('img').attr('src') ||
                      $card.find('img').attr('data-src') ||
                      $card.find('.boxart-image').attr('src') ||
                      '';
          
          // Get additional data from IMDB if possible
          let imdbData = null;
          try {
            const imdbResponse = await axios.get(
              `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(title)}.json?includeVideos=1`,
              { timeout: 5000 }
            );
            if (imdbResponse.data && imdbResponse.data.d && imdbResponse.data.d.length > 0) {
              imdbData = imdbResponse.data.d[0];
            }
          } catch (error) {
            console.warn(`Failed to fetch IMDB data for "${title}": ${error.message}`);
          }
          
          // Create content object
          const contentItem = {
            id: imdbData?.id || `netflix_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            type: type,
            name: title,
            releaseInfo: imdbData?.y || "2024",
            poster: imdbData?.i?.imageUrl || poster || 'https://via.placeholder.com/300x450?text=No+Image',
            description: imdbData?.s || `${title} - Available on Netflix`,
            genres: ["Comedy", "Short"]
          };
          
          genreResults.push(contentItem);
        });
      });
    }
    
    if (!foundContent) {
      console.log('No content found with standard selectors, trying alternative approach...');
      
      // Alternative approach: look for any elements with Netflix-like attributes
      const alternativeElements = $('[data-uia*="title"], [aria-label*="Watch"], img[alt*="Watch"]');
      
      for (let i = 0; i < Math.min(alternativeElements.length, 10); i++) {
        const element = alternativeElements.eq(i);
        let title = element.attr('aria-label') || element.attr('alt') || element.text().trim();
        
        if (title && title.length > 3) {
          title = title.replace(/^Watch\s+/i, '').trim();
          
          genreResults.push({
            id: `netflix_genre_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            type: type,
            name: title,
            releaseInfo: "2024",
            poster: 'https://via.placeholder.com/300x450?text=Netflix+Content',
            description: `${title} - Available on Netflix`,
            genres: ["Comedy", "Short"]
          });
        }
      }
    }
    
    console.log(`Successfully scraped ${genreResults.length} items from Netflix genre page`);
    return genreResults;
    
  } catch (error) {
    console.error('Error scraping Netflix genre page:', error.message);
    
    // Return some fallback content if scraping fails
    return [
      {
        id: 'netflix_30min_laughs_1',
        type: type,
        name: '30-Minute Laughs Collection',
        releaseInfo: '2024',
        poster: 'https://via.placeholder.com/300x450?text=30+Min+Laughs',
        description: 'Quick comedy content from Netflix - 30 minutes or less',
        genres: ['Comedy', 'Short']
      }
    ];
  }
}

/**
 * Scrapes multiple Netflix genre pages
 * @param {Array} genreUrls - Array of genre URLs to scrape
 * @returns {Promise<Array>} Combined array of all scraped content
 */
async function scrapeMultipleGenres(genreUrls = ['https://www.netflix.com/pt-en/browse/genre/81602050']) {
  try {
    const allResults = [];
    
    for (const url of genreUrls) {
      console.log(`Scraping genre: ${url}`);
      const results = await scrapeNetflixGenre(url);
      allResults.push(...results);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Remove duplicates by name
    const uniqueResults = allResults.filter((item, index, self) =>
      index === self.findIndex((t) => t.name === item.name)
    );
    
    return uniqueResults;
  } catch (error) {
    console.error('Error scraping multiple genres:', error.message);
    return [];
  }
}

/**
 * Saves genre content to database
 * @param {Array} genreData - Array with genre content data
 * @param {boolean} clearExisting - Whether to clear existing data first
 */
async function saveGenreToDatabase(genreData, clearExisting = false) {
  try {
    if (!genreData || genreData.length === 0) {
      console.log('No genre data to save to database.');
      return;
    }
    
    console.log('Saving genre data to MongoDB...');
    
    if (clearExisting) {
      // Clear existing data
      await Media.deleteMany({});
    }
    
    // Remove duplicates by id
    const uniqueData = genreData.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
    
    // Insert new data
    await Media.insertMany(uniqueData);
    
    console.log(`${uniqueData.length} genre items saved to database.`);
  } catch (error) {
    console.error('Error saving genre data to MongoDB:', error.message);
  }
}

/**
 * Saves genre content to JSON file
 * @param {Array} genreData - Array with genre content data
 * @param {string} outputPath - Path for output file
 */
async function saveGenreToJson(genreData, outputPath = 'netflix_genre_content.json') {
  try {
    if (!genreData || genreData.length === 0) {
      console.log('No genre data to save to JSON.');
      return;
    }
    
    // Ensure absolute path
    const absolutePath = path.isAbsolute(outputPath) 
      ? outputPath 
      : path.join(process.cwd(), outputPath);
    
    // Save data to JSON file
    fs.writeFileSync(
      absolutePath,
      JSON.stringify(genreData, null, 2),
      'utf8'
    );
    
    console.log(`Genre data saved to ${absolutePath}`);
  } catch (error) {
    console.error('Error saving genre data to JSON:', error.message);
  }
}

module.exports = {
  scrapeNetflixGenre,
  scrapeMultipleGenres,
  saveGenreToDatabase,
  saveGenreToJson
};