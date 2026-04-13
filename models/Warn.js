const mongoose = require('mongoose');
module.exports = mongoose.model("Warn", new mongoose.Schema({
  guildId: String,
  userId: String,
  warns: Number
}));
