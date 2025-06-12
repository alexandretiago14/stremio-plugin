const mongoose = require('mongoose');

const netflixTop10Schema = new mongoose.Schema({
  rank: { type: Number, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['series'], default: 'series' },
  poster: { type: String },
  description: { type: String },
  weeksInTop10: { type: Number, default: 1 },
  lastUpdated: { type: Date, default: Date.now },
  stremioId: { type: String }, // ID para integração com o Stremio (se disponível)
});

const NetflixTop10 = mongoose.model('NetflixTop10', netflixTop10Schema);

module.exports = NetflixTop10;