const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const connectDB = require('./config/db');
const { seedInitialData, getMedia } = require('./services/mediaService');

// Conectar ao MongoDB
connectDB();

// Semear dados iniciais
seedInitialData().catch(err => console.error('Erro ao semear dados:', err));

// Criar um builder para o addon
const builder = new addonBuilder({
  id: 'org.myexampleaddon',
  version: '1.0.0',
  name: 'Netflix Top 10',
  description: 'Netflix Top 10 - Alexandre Pereira',
  
  // Resources definem o que o seu addon pode fazer
  resources: ['catalog'],
  
  // Types definem quais tipos de conteúdo o seu addon suporta
  types: ['movie', 'series'],
  
  // Catalogs definem as listas que aparecerão na página inicial
  catalogs: [
    {
      type: 'movie',
      id: 'my-custom-list',
      name: 'Netflix Top 10',
      extra: [
        // Adicionando skip para suporte à paginação
        { name: 'skip', isRequired: false },
        // Adicionando capacidade de busca
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
  
  // Opcional: se o seu addon fornecerá streams para conteúdo específico
  idPrefixes: ['tt']
});

// Definir o manipulador de catálogo - isso é o que cria sua lista personalizada
builder.defineCatalogHandler(async function(args) {
  
  // Verificar se esta requisição é para nossos catálogos
  if ((args.type === 'movie' && args.id === 'my-custom-list') ||
      (args.type === 'series' && args.id === 'my-custom-series')) {
    
    // Configurar parâmetros de busca e paginação
    const searchQuery = args.extra && args.extra.search ? args.extra.search.toLowerCase() : null;
    const skip = args.extra && args.extra.skip ? parseInt(args.extra.skip) : 0;
    
    // Buscar media do serviço
    const results = await getMedia(args.type, searchQuery, skip);

    return { metas: results };
  }
  
  // Retornar resultados vazios para qualquer outra requisição
  return { metas: [] };
});

// Iniciar o servidor do addon
serveHTTP(builder.getInterface(), { port: 8080 });

console.log('Addon rodando em http://127.0.0.1:7001/manifest.json');