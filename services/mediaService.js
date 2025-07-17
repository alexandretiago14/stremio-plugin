const Media = require('../models/Media');
const connectDB = require('../config/db');
const { getAllNetflixTop10, saveTop10ToDatabase, saveTop10ToJson } = require('../services/netflixScraperService');

// Função para buscar media com filtros
async function getMedia(type, searchQuery = null, skip = 0, limit = 100) {
  try {
    const getInfo = async () => {
      // Fazer o scraping do Top 10 da Netflix
      const top10Data = await getAllNetflixTop10();
        
      if (top10Data.length > 0) {
        // Salvar no banco de dados
        await saveTop10ToDatabase(top10Data);
        
        // Salvar em um arquivo JSON
        await saveTop10ToJson(top10Data);
        
        console.log('Processo de scraping concluído com sucesso!');
      } else {
        console.log('Nenhum dado foi obtido do scraping.');
      }
    };
    
    try {
      const { createdAt = 0 } = await Media.findOne({}).sort({ createdAt: -1 });
      const now = new Date();
   
      const timeDiff = now - createdAt;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
     
      if (hoursDiff >= 48 || createdAt === 0) {
        await getInfo();
      }
    } catch {
      await getInfo();
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
  getMedia
};