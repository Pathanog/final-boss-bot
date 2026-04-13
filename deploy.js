const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];
const folders = ["admin","mod","utility","study"];

for (const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`);
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Commands registered ✅");
  } catch (error) {
    console.error(error);
  }
})();
