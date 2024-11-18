const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription(
      "Set the category ID for an existing category by right clicking on the caterogy and copy channel ID"
    )
    .addStringOption((option) =>
      option
        .setName("categoryid")
        .setDescription(
          "Enter the ID for an existing category by right clicking on the caterogy and copy channel ID"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const categoryId = interaction.options.getString("categoryid");

      // validate the user input of category Id to match the channel ID pattern

      const categoryIdPattern = /^\d{18}$/;

      if (!categoryIdPattern.test(categoryId)) {
        return await interaction.reply({
          content: `The category ID doesn't match. Please enter a valid 18-digit category ID. For more information, visit [this link](https://discover.hubpages.com/technology/Discord-Channel-ID).`,
          ephemeral: true,
        });
      }

      // Save the category ID to the .env file
      const envPath = path.join(__dirname, "..", ".env");
      let envContent = fs.readFileSync(envPath, "utf8");

      // Add CATEGORY_ID to the .env file if it doesn't exist
      if (!envContent.includes("CATEGORY_ID=")) {
        const newEnvContent = envContent + `\nCATEGORY_ID=${categoryId}\n`;
        fs.writeFileSync(envPath, newEnvContent);
      }

      await interaction.reply({
        content: `Category ID set as: ${categoryId}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error during setup:", error);
      await interaction.reply({
        content: "There was an error during the setup process.",
        ephemeral: true,
      });
    }
  },
};
