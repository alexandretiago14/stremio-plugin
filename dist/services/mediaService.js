const Media = require('../models/Media');


// Função para buscar media com filtros
async function getMedia(type, searchQuery = null, skip = 0, limit = 100) {
  try {
    const getInfo = async () => {
       // Conectar ao MongoDB
       await connectDB();
    
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
    }

    try {
      const { createdAt = null } = await Media.findOne({}).sort({ createdAt: -1 });

      const now = new Date();
      const timeDiff = now - createdAt;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
     
      if (hoursDiff >= 48) {
        getInfo()
      }
    } catch {
      await getInfo()
    }

    // Construir a query
    const query = { type };
    
    console.log("Query: ", query);
    
    // Buscar no banco de dados
    const results = await Media.find(query)
      .limit(100)
      .lean(); // Converter documentos Mongoose para objetos simples
    
    return results;
  } catch (error) {
    console.error('Erro na base de dados:', error);
    return [];
  }
}

module.exports = {
  getMedia
};