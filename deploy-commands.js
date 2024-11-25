const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const db = require("./db/db"); // Assuming the db module is set up for SQLite

async function deployCommands(guildId = null) {
  // Load all command files
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
  const commands = commandFiles.map((file) => {
    const command = require(`./commands/${file}`);
    return command.data;
  });

  const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

  try {
    if (!guildId) {
      // If guildId is not provided, retrieve all guild IDs from the database
      const guilds = await new Promise((resolve, reject) => {
        db.all("SELECT guild_id FROM guilds", (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map((row) => row.guild_id));
        });
      });

      // Deploy commands for each guild
      for (const id of guilds) {
        console.log(`Deploying commands for guild: ${id}`);
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, id),
          { body: commands }
        );
      }
    } else {
      // Deploy commands for a specific guild
      console.log(`Deploying commands for specified guild: ${guildId}`);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands }
      );
    }

    console.log("Commands deployed successfully.");
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
}

module.exports = { deployCommands };
