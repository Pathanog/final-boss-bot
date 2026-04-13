const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');

// 🌐 KEEP ALIVE SERVER
const app = express();
app.get('/', (req, res) => res.send('Alive'));
app.listen(3000, () => console.log("Web online"));

// 🤖 BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// 🧠 DB
mongoose.connect(process.env.MONGO)
.then(() => console.log("DB connected"))
.catch(console.error);

// 📦 LOAD COMMANDS
const fs = require('fs');
const folders = ["admin","mod","utility","study"];

for (const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`);
  for (const file of files) {
    const cmd = require(`./commands/${folder}/${file}`);
    client.commands.set(cmd.data.name, cmd);
  }
}

// 🔐 PERMISSION SYSTEM
function level(member) {
  if (member.id === process.env.OWNER) return 4;
  if (member.permissions.has("Administrator")) return 3;
  if (member.roles.cache.some(r => r.name === "Staff")) return 2;
  return 0;
}

// 🚫 WORD FILTER DB
const Word = require('./models/Word');

// ⚠️ WARN DB
const Warn = require('./models/Warn');

// 🔗 INVITE CACHE
const invites = new Map();

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.guilds.cache.forEach(async guild => {
    const i = await guild.invites.fetch();
    invites.set(guild.id, i);
  });
});

// 👋 JOIN
client.on('guildMemberAdd', async member => {
  const newInvites = await member.guild.invites.fetch();
  const oldInvites = invites.get(member.guild.id);

  const invite = newInvites.find(i =>
    oldInvites.get(i.code)?.uses < i.uses
  );

  invites.set(member.guild.id, newInvites);

  const channel = member.guild.systemChannel;
  if (invite) {
    channel?.send(`${member.user.tag} joined via ${invite.inviter.tag}`);
  } else {
    channel?.send(`${member.user.tag} joined`);
  }
});

// 👋 LEAVE
client.on('guildMemberRemove', member => {
  member.guild.systemChannel?.send(`${member.user.tag} left`);
});

// 🚫 AUTO MOD + WORD FILTER
const cooldown = new Map();

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Word filter
  const data = await Word.findOne({ guildId: message.guild.id });
  if (data && data.words.some(w => content.includes(w))) {
    await message.delete();
    return message.channel.send("Message removed.");
  }

  // Spam
  const now = Date.now();
  const last = cooldown.get(message.author.id) || 0;
  if (now - last < 2000) {
    await message.delete();
    return;
  }
  cooldown.set(message.author.id, now);

  // Links
  if (content.includes("http")) {
    await message.delete();
  }

  // CAPS
  if (content === content.toUpperCase() && content.length > 6) {
    await message.delete();
  }
});

// ⚡ COMMAND HANDLER
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  if (cmd.level && level(interaction.member) < cmd.level)
    return interaction.reply({ content: "No permission", ephemeral: true });

  try {
    await cmd.execute(interaction, client, Warn, Word);
  } catch (e) {
    console.error(e);
  }
});

client.login(process.env.TOKEN);
