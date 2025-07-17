const { scrapeNetflixGenre, scrapeMultipleGenres, saveGenreToDatabase, saveGenreToJson } = require('../services/netflixGenreScraperService');
const connectDB = require('../config/db');

/**
 * Main function to scrape Netflix genre content
 */
async function main() {
  try {
    console.log('🎬 Starting Netflix Genre Scraper...');
    
    // Connect to database
    await connectDB();
    
    // Define genre URLs to scrape
    const genreUrls = [
      'https://www.netflix.com/pt-en/browse/genre/81602050', // 30-Minute Laughs
      // Add more genre URLs here if needed
      // 'https://www.netflix.com/pt-en/browse/genre/XXXXX', // Another genre
    ];
    
    console.log(`📡 Scraping ${genreUrls.length} genre page(s)...`);
    
    // Scrape the genre content
    const genreContent = await scrapeMultipleGenres(genreUrls);
    
    if (genreContent.length === 0) {
      console.log('❌ No content found. This might be due to:');
      console.log('   - Netflix page structure changes');
      console.log('   - Network issues');
      console.log('   - Anti-scraping measures');
      return;
    }
    
    console.log(`✅ Successfully scraped ${genreContent.length} items`);
    
    // Display sample of scraped content
    console.log('\n📋 Sample of scraped content:');
    genreContent.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type})`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Release: ${item.releaseInfo}`);
      console.log(`   Description: ${item.description.substring(0, 100)}...`);
      console.log('');
    });
    
    // Save to database
    console.log('💾 Saving to database...');
    await saveGenreToDatabase(genreContent, false); // Don't clear existing data
    
    // Save to JSON file
    console.log('📄 Saving to JSON file...');
    await saveGenreToJson(genreContent, 'netflix_genre_content.json');
    
    console.log('🎉 Genre scraping completed successfully!');
    console.log(`📊 Total items processed: ${genreContent.length}`);
    
  } catch (error) {
    console.error('❌ Error in main scraping process:', error.message);
    console.error(error.stack);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

/**
 * Handle command line arguments
 */
function handleArguments() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Netflix Genre Scraper');
    console.log('');
    console.log('Usage: node scripts/scrapeNetflixGenre.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --test         Run in test mode (limited results)');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/scrapeNetflixGenre.js');
    console.log('  node scripts/scrapeNetflixGenre.js --test');
    process.exit(0);
  }
  
  return {
    testMode: args.includes('--test')
  };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Parse arguments and run
const options = handleArguments();

if (options.testMode) {
  console.log('🧪 Running in test mode...');
}

// Run the main function
main();