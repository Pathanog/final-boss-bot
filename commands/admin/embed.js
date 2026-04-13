const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  level: 3,
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send embed')
    .addStringOption(o => o.setName('title').setRequired(true))
    .addStringOption(o => o.setName('desc').setRequired(true)),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle(interaction.options.getString('title'))
      .setDescription(interaction.options.getString('desc'))
      .setColor("Blue");

    interaction.reply({ embeds: [embed] });
  }
};
