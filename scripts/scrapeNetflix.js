const connectDB = require('../config/db');
const { getAllNetflixTop10, saveTop10ToDatabase, saveTop10ToJson } = require('../services/netflixScraperService');

async function main() {
  try {
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
    
    // Encerrar o processo após a conclusão
    process.exit(0);
  } catch (error) {
    console.error('Erro no processo de scraping:', error);
    process.exit(1);
  }
}

// Executar o script
main();