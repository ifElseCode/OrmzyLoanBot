const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const { deployCommands } = require("./deploy-commands"); // Correct import

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

  // Add the guild ID to .env file it not already there
  const envPath = path.join(__dirname, ".env");
  const envContent = fs.readFileSync(envPath, "utf8");
  if (!envContent.includes(`GUILD_ID=${guild.id}`)) {
    const newEnvContent = envContent + `\nGUILD_ID=${guild.id}\n`;
    fs.writeFileSync(envPath, newEnvContent);
    console.log("Guild ID added to .env file.");
  }

  await deployCommands(guild.id); // Deploy commands when the bot joins a guild
});

// Deploy commands and log in
(async () => {
  try {
    await client.login(process.env.BOT_TOKEN);
    console.log("Bot logged in successfully.");
  } catch (error) {
    console.error("Error during bot startup:", error);
  }
})();
