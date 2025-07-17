const { scrapeNetflixGenre } = require('./services/netflixGenreScraperService');

/**
 * Simple test script for the Netflix Genre Scraper
 */
async function testGenreScraper() {
  try {
    console.log('🧪 Testing Netflix Genre Scraper...');
    console.log('📡 Scraping: https://www.netflix.com/pt-en/browse/genre/81602050');
    
    const results = await scrapeNetflixGenre('https://www.netflix.com/pt-en/browse/genre/81602050', 'movie');
    
    console.log(`\n✅ Scraping completed!`);
    console.log(`📊 Found ${results.length} items`);
    
    if (results.length > 0) {
      console.log('\n📋 Sample results:');
      results.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Type: ${item.type}`);
        console.log(`   Release: ${item.releaseInfo}`);
        console.log(`   Poster: ${item.poster}`);
        console.log(`   Description: ${item.description}`);
        console.log(`   Genres: ${item.genres.join(', ')}`);
      });
      
      if (results.length > 3) {
        console.log(`\n... and ${results.length - 3} more items`);
      }
    } else {
      console.log('\n⚠️  No results found. This could be due to:');
      console.log('   - Netflix page structure changes');
      console.log('   - Network connectivity issues');
      console.log('   - Anti-scraping measures');
      console.log('   - The page requires authentication');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testGenreScraper().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});