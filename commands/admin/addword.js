const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  level: 3,
  data: new SlashCommandBuilder()
    .setName('addword')
    .setDescription('Add word')
    .addStringOption(o => o.setName('word').setRequired(true)),

  async execute(interaction, client, Warn, Word) {
    const word = interaction.options.getString('word');

    let data = await Word.findOne({ guildId: interaction.guild.id });
    if (!data) data = new Word({ guildId: interaction.guild.id, words: [] });

    data.words.push(word.toLowerCase());
    await data.save();

    interaction.reply(`Added ${word}`);
  }
};
