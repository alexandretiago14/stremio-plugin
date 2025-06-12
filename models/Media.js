const mongoose = require('mongoose');

// Definir o Schema para filmes/séries
const mediaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['movie', 'series'] },
  name: { type: String, required: true },
  releaseInfo: String,
  poster: String,
  posterShape: { type: String, default: 'poster' },
  description: String,
  genres: [String],
  createdAt: { type: Date, default: Date.now }
});

// Criar o modelo
const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;