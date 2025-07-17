const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const connectDB = require('./config/db');
const { getMedia } = require('./services/mediaService');

// Connect to MongoDB
connectDB();

// Create addon builder
const builder = new addonBuilder({
  id: 'org.myexampleaddon.two',
  version: '1.0.0',
  name: 'Netflix Top 10',
  description: 'Netflix Top 10 - Alexandre Pereira - TESTE',
  
  // Resources define what your addon can do
  resources: ['catalog'],
  
  // Types define which content types your addon supports
  types: ['movie', 'series'],
  
  // Catalogs define the lists that will appear on the home page
  catalogs: [
    {
      type: 'movie',
      id: 'my-custom-list',
      name: 'Netflix Top 10',
      extra: [
        // Adding skip for pagination support
        { name: 'skip', isRequired: false },
        // Adding search capability
        { name: 'search', isRequired: false }
      ]
    },
    {
      type: 'series',
      id: 'my-custom-series',
      name: 'Netflix Top 10 ',
      extra: [
        { name: 'skip', isRequired: false },
        { name: 'search', isRequired: false }
      ]
    }
  ],
  
  // Optional: if your addon will provide streams for specific content
  idPrefixes: ['tt']
});

// Define catalog handler - this is what creates your custom list
builder.defineCatalogHandler(async function(args) {
  
  // Check if this request is for our catalogs
  if ((args.type === 'movie' && args.id === 'my-custom-list') ||
      (args.type === 'series' && args.id === 'my-custom-series')) {
    
    // Set up search and pagination parameters
    const searchQuery = args.extra && args.extra.search ? args.extra.search.toLowerCase() : null;
    const skip = args.extra && args.extra.skip ? parseInt(args.extra.skip) : 0;
    
    // Fetch media from service
    const results = await getMedia(args.type, searchQuery, skip);

    return { metas: results };
  }
  

  return { metas: [] };
});

module.exports = serveHTTP(builder.getInterface(), { port: 8080 });
