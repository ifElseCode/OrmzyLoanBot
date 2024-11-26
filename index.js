const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const { deployCommands } = require("./deploy-commands");
const db = require("./db/db.js");

// File updated

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Handle slash command interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("guildCreate", async (guild) => {
  console.log(`Bot added to guild: ${guild.name} (${guild.id})`);

  try {
    await addGuildToDatabase(guild.id);
  } catch (error) {
    console.error("Error adding guild to database:", error);
  }

  await deployCommands(guild.id);
});

async function addGuildToDatabase(guildId) {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get(
        `SELECT guild_id FROM guilds WHERE guild_id = ?`,
        [guildId],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    if (!row) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO guilds (guild_id, category_id) VALUES (?, ?)`,
          [guildId, null],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
      console.log(`Guild ID ${guildId} added to the database.`);
    }
  } catch (error) {
    console.error("Error adding guild to database:", error);
  }
}

// Deploy commands and log in
(async () => {
  try {
    await client.login(process.env.BOT_TOKEN);
    console.log("Bot logged in successfully.");
  } catch (error) {
    console.error("Error during bot startup:", error);
  }
})();
