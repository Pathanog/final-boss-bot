const mongoose = require('mongoose');
module.exports = mongoose.model("Word", new mongoose.Schema({
  guildId: String,
  words: [String]
}));
