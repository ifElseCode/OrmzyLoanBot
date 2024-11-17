const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

async function deployCommands(guildId) {
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
  const commands = commandFiles.map((file) => {
    const command = require(`./commands/${file}`);
    return command.data;
  });

  const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

  try {
    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        {
          body: commands,
        }
      );
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
    }

    console.log("Commands deployed successfully.");
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
}

module.exports = { deployCommands };
