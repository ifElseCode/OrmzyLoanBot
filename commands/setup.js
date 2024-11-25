const { SlashCommandBuilder } = require("discord.js");
const db = require("../db/db.js");

// Define updateDatabase function here
async function updateDatabase(guildId, categoryId) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO guilds (guild_id, category_id) VALUES (?, ?)`,
      [guildId, categoryId],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set the category ID for your server.")
    .addStringOption((option) =>
      option
        .setName("categoryid")
        .setDescription("Enter a valid category ID.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const categoryId = interaction.options.getString("categoryid");
    const guildId = interaction.guild.id;

    console.log("Setup command initiated with categoryId:", categoryId);

    try {
      // Defer the reply only once
      if (!interaction.deferred) {
        await interaction.deferReply({ ephemeral: true });
      }

      // Update the database using a single INSERT OR REPLACE query
      await updateDatabase(guildId, categoryId);

      // Edit the reply with a success message
      await interaction.editReply({
        content: "Category ID updated successfully!",
      });
    } catch (error) {
      console.error("Error during setup:", error);
      await interaction.editReply({
        content: "An error occurred during setup. Please try again later.",
      });
    }
  },
};
