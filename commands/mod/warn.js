const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  level: 2,
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn user')
    .addUserOption(o => o.setName('user').setRequired(true)),

  async execute(interaction, client, Warn) {
    const user = interaction.options.getUser('user');

    let data = await Warn.findOne({
      guildId: interaction.guild.id,
      userId: user.id
    });

    if (!data) data = new Warn({
      guildId: interaction.guild.id,
      userId: user.id,
      warns: 0
    });

    data.warns++;
    await data.save();

    interaction.reply(`${user.tag} warned (${data.warns})`);
  }
};
