const axios = require('axios');
const cheerio = require('cheerio');
const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

async function getAllNetflixTop10() {
  const series = await scrapeNetflixTop10();
  const movie =  await scrapeNetflixTop10('https://www.netflix.com/tudum/top10/portugal', 'movie');

  return [...series, ...movie];
}

/**
 * Faz o scraping do Top 10 da Netflix em Portugal
 * @returns {Promise<Array>} Array com os dados do Top 10
 */
async function scrapeNetflixTop10(NETFLIX_TOP10_URL = 'https://www.netflix.com/tudum/top10/portugal/tv', type = 'series') {
  try {
    console.log('Iniciando scraping do Top 10 da Netflix em Portugal...');
    
    // Fazer a requisição HTTP para a página do Top 10
    const response = await axios.get(NETFLIX_TOP10_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Carregar o HTML na biblioteca Cheerio
    const $ = cheerio.load(response.data);
    
    // Array para armazenar os resultados
    const top10Results = [];
    
    // Selecionar os elementos que contêm os dados do Top 10
    // Baseado na estrutura atual da página do Netflix Top 10
    for (let index = 0; index < $('[data-uia="top10-table-row-title"]').length; index++) {
      const element = $('[data-uia="top10-table-row-title"]')[index];
      
      // Extrair o título - o título geralmente está em um elemento próximo ao rank
      const titleElement = $(element).find('button');
      const title = titleElement.text().trim().split(':')[0];

      // Get additional title information from IMDB suggestions API
      let imdbData = null;
      try {
        const imdbResponse = await axios.get(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(title)}.json?includeVideos=1`);
        if (imdbResponse.data && imdbResponse.data.d && imdbResponse.data.d.length > 0) {
          imdbData = imdbResponse.data.d[0];
          console.log('imdbData', imdbData);
        }
      } catch (error) {
        console.warn(`Failed to fetch IMDB data for "${title}":`, error.message);
      }
  
      // Extrair a descrição (se disponível)
      const descriptionElement = $(element).closest('div').find('[class*="description"], [class*="synopsis"]');
      const description = descriptionElement.text().trim() || '';
      
      // Adicionar ao array de resultados
      if (title && imdbData.id) {
        top10Results.push({
          id: imdbData.id,
          type: type,
          name: title,
          releaseInfo: "2025",
          poster: imdbData.i.imageUrl,
          description: description,
          genres: ["DSADSAD"]
        });
      }
    };
    
    return top10Results;
  } catch (error) {
    console.error('Erro ao fazer scraping do Top 10 da Netflix:', error.message);
    return [];
  }
}

/**
 * Salva os dados do Top 10 no MongoDB
 * @param {Array} top10Data Array com os dados do Top 10
 */
async function saveTop10ToDatabase(top10Data) {
  try {
    if (!top10Data || top10Data.length === 0) {
      console.log('Nenhum dado para salvar no banco de dados.');
      return;
    }
    
    console.log('Salvando dados no MongoDB...');
    
    // Limpar dados antigos
    await Media.deleteMany({});
    
    // Remove duplicates by id using filter
    top10Data = top10Data.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    )

    // Inserir novos dados
    await Media.insertMany(top10Data);
    
    console.log(`${top10Data.length} títulos salvos no banco de dados.`);
  } catch (error) {
    console.error('Erro ao salvar dados no MongoDB:', error.message);
  }
}

/**
 * Salva os dados do Top 10 em um arquivo JSON
 * @param {Array} top10Data Array com os dados do Top 10
 * @param {String} outputPath Caminho para o arquivo de saída
 */
async function saveTop10ToJson(top10Data, outputPath = 'netflix_top10_portugal.json') {
  try {
    if (!top10Data || top10Data.length === 0) {
      console.log('Nenhum dado para salvar em JSON.');
      return;
    }
    
    // Garantir que o caminho é absoluto
    const absolutePath = path.isAbsolute(outputPath) 
      ? outputPath 
      : path.join(process.cwd(), outputPath);
    
    // Salvar os dados em um arquivo JSON
    fs.writeFileSync(
      absolutePath,
      JSON.stringify(top10Data, null, 2),
      'utf8'
    );
    
    console.log(`Dados salvos em ${absolutePath}`);
  } catch (error) {
    console.error('Erro ao salvar dados em JSON:', error.message);
  }
}

module.exports = {
  getAllNetflixTop10,
  saveTop10ToDatabase,
  saveTop10ToJson
};