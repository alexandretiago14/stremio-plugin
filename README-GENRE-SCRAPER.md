# Netflix Genre Scraper Service

This service allows you to scrape content from specific Netflix genre pages and integrate it into your Stremio addon.

## Overview

The Netflix Genre Scraper Service (`netflixGenreScraperService.js`) is designed to extract content information from Netflix genre pages, such as the "30-Minute Laughs" category.

## Features

- ✅ Scrape content from Netflix genre pages
- ✅ Extract title, poster, and description information
- ✅ Integrate with IMDB API for additional metadata
- ✅ Save scraped data to MongoDB
- ✅ Export data to JSON files
- ✅ Handle multiple genre URLs
- ✅ Automatic deduplication
- ✅ Fallback content when scraping fails

## Files Created

### Core Service
- `services/netflixGenreScraperService.js` - Main scraper service

### Scripts
- `scripts/scrapeNetflixGenre.js` - Standalone script to run the scraper
- `test-genre-scraper.js` - Simple test script

### Updated Files
- `services/mediaService.js` - Integrated genre scraping with existing service
- `package.json` - Added new npm script

## Usage

### 1. Run the Genre Scraper Standalone

```bash
# Run the genre scraper
npm run scrape-genre

# Or run directly
node scripts/scrapeNetflixGenre.js

# Run with help
node scripts/scrapeNetflixGenre.js --help

# Run in test mode
node scripts/scrapeNetflixGenre.js --test
```

### 2. Test the Scraper

```bash
# Quick test
node test-genre-scraper.js
```

### 3. Use in Your Code

```javascript
const { scrapeNetflixGenre, scrapeMultipleGenres } = require('./services/netflixGenreScraperService');

// Scrape a single genre
const content = await scrapeNetflixGenre('https://www.netflix.com/pt-en/browse/genre/81602050');

// Scrape multiple genres
const genreUrls = [
  'https://www.netflix.com/pt-en/browse/genre/81602050', // 30-Minute Laughs
  'https://www.netflix.com/pt-en/browse/genre/XXXXX',     // Another genre
];
const allContent = await scrapeMultipleGenres(genreUrls);
```

## Configuration

### Adding New Genre URLs

To scrape additional Netflix genres, you can:

1. **Update mediaService.js:**
```javascript
const genreUrls = [
  'https://www.netflix.com/pt-en/browse/genre/81602050', // 30-Minute Laughs
  'https://www.netflix.com/pt-en/browse/genre/1365',     // Action & Adventure
  'https://www.netflix.com/pt-en/browse/genre/6548',     // Comedy
  // Add more URLs here
];
```

2. **Update the standalone script:**
Edit `scripts/scrapeNetflixGenre.js` and modify the `genreUrls` array.

### Popular Netflix Genre IDs

- `81602050` - 30-Minute Laughs
- `1365` - Action & Adventure
- `6548` - Comedy
- `8883` - Romance
- `783` - Children & Family Movies
- `5763` - Sci-Fi & Fantasy
- `8711` - Horror Movies
- `7424` - Anime
- `1492` - Documentaries

## How It Works

1. **Web Scraping**: Uses Axios and Cheerio to fetch and parse Netflix pages
2. **Content Detection**: Tries multiple CSS selectors to find content tiles
3. **Metadata Enhancement**: Fetches additional data from IMDB API
4. **Data Storage**: Saves to MongoDB and/or JSON files
5. **Integration**: Automatically integrates with existing Stremio addon

## Data Structure

Each scraped item has the following structure:

```javascript
{
  id: 'netflix_genre_title_timestamp',
  type: 'movie' | 'series',
  name: 'Content Title',
  releaseInfo: '2024',
  poster: 'https://image-url.jpg',
  description: 'Content description',
  genres: ['Comedy', 'Short']
}
```

## Automatic Integration

The genre scraper is automatically integrated into your Stremio addon:

- Content is refreshed every 48 hours alongside Netflix Top 10 data
- Genre content appears in your addon catalogs
- No additional configuration needed

## Troubleshooting

### No Content Found

If the scraper returns no results:

1. **Check Network Connection**: Ensure you can access Netflix
2. **Page Structure Changes**: Netflix may have updated their HTML structure
3. **Anti-Scraping Measures**: Netflix may be blocking automated requests
4. **Authentication Required**: Some pages may require login

### Improving Results

1. **Add More Selectors**: Update the `contentSelectors` array in the service
2. **Adjust Delays**: Increase delays between requests
3. **Use Different User Agents**: Rotate user agent strings
4. **Handle Errors Gracefully**: The service includes fallback content

## Example Output

When running the scraper, you'll see output like:

```
🎬 Starting Netflix Genre Scraper...
📡 Scraping 1 genre page(s)...
Starting scraping of Netflix genre page: https://www.netflix.com/pt-en/browse/genre/81602050
Found 10 items using selector: [aria-label*="Watch"]
✅ Successfully scraped 10 items

📋 Sample of scraped content:
1. Young Sheldon (movie)
   ID: netflix_genre_young_sheldon_1752404028105
   Release: 2024
   Description: Young Sheldon - Available on Netflix...

💾 Saving to database...
📄 Saving to JSON file...
🎉 Genre scraping completed successfully!
📊 Total items processed: 10
```

## Notes

- The scraper respects rate limits with built-in delays
- Duplicate content is automatically filtered out
- The service gracefully handles errors and provides fallback content
- All scraped data integrates seamlessly with your existing Stremio addon

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify the Netflix URLs are accessible
3. Test with the simple test script first
4. Check if Netflix has changed their page structure