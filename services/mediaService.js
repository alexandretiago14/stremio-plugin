const Media = require('../models/Media');
const connectDB = require('../config/db');
const { getAllNetflixTop10, saveTop10ToDatabase, saveTop10ToJson } = require('../services/netflixScraperService');
const { scrapeMultipleGenres, saveGenreToDatabase } = require('../services/netflixGenreScraperService');

// Função para semear dados iniciais
async function seedInitialData() {
  const count = await Media.countDocuments();
  if (count === 0) {
    const initialMedia = [
      {
        id: 'tt1254207',
        type: 'movie',
        name: 'Big Buck Bunny',
        releaseInfo: '2008',
        poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
        posterShape: 'poster',
        description: 'A large and lovable rabbit deals with three tiny bullies.',
        genres: ['Animation', 'Short', 'Comedy']
      },
      {
        id: 'tt0137523',
        type: 'movie',
        name: 'Fight Club',
        releaseInfo: '1999',
        poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        posterShape: 'poster',
        description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
        genres: ['Drama']
      },
      {
        id: 'tt0068646',
        type: 'movie',
        name: 'The Godfather',
        releaseInfo: '1972',
        poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        posterShape: 'poster',
        description: 'The aging patriarch of an organized crime dynasty transfers control to his son.',
        genres: ['Drama', 'Crime']
      }
    ];
    await Media.insertMany(initialMedia);
    console.log('Dados iniciais inseridos');
  }
}

// Função para buscar media com filtros
async function getMedia(type, searchQuery = null, skip = 0, limit = 100) {
  try {
    const { createdAt } = await Media.findOne({}).sort({ createdAt: -1 });

    const now = new Date();
    const timeDiff = now - createdAt;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
   
    if (hoursDiff >= 48) {
      // Conectar ao MongoDB
      await connectDB();
    
      // Fazer o scraping do Top 10 da Netflix
      const top10Data = await getAllNetflixTop10();
      
      // Fazer o scraping dos gêneros da Netflix
      const genreUrls = [
        'https://www.netflix.com/pt-en/browse/genre/81602050', // 30-Minute Laughs
        // Add more genre URLs here if needed
      ];
      const genreData = await scrapeMultipleGenres(genreUrls);
      
      if (top10Data.length > 0 || genreData.length > 0) {
        // Salvar dados do Top 10 no banco de dados
        if (top10Data.length > 0) {
          await saveTop10ToDatabase(top10Data);
          await saveTop10ToJson(top10Data);
        }
        
        // Salvar dados dos gêneros no banco de dados (sem limpar dados existentes)
        if (genreData.length > 0) {
          await saveGenreToDatabase(genreData, false);
        }
        
        console.log(`Processo de scraping concluído com sucesso! Top 10: ${top10Data.length}, Gêneros: ${genreData.length}`);
      } else {
        console.log('Nenhum dado foi obtido do scraping.');
      }
    }

    // Construir a query
    const query = { type };
    
    console.log("Query: ", query);
    
    // Buscar no banco de dados
    const results = await Media.find(query)
      .limit(100)
      .lean(); // Converter documentos Mongoose para objetos simples
    
    // Shuffle results array using Fisher-Yates algorithm
    const shuffledResults = results
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
          
    return shuffledResults;
  } catch (error) {
    console.error('Erro na base de dados:', error);
    return [];
  }
}

module.exports = {
  seedInitialData,
  getMedia
};