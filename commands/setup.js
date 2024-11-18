const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs").promises;
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

      const categoryIdPattern = /^\d{18,}$/;

      if (!categoryIdPattern.test(categoryId)) {
        return await interaction.reply({
          content: `The category ID doesn't match. Please enter a valid 18-digit category ID. For more information, visit [this link](https://discover.hubpages.com/technology/Discord-Channel-ID).`,
          ephemeral: true,
        });
      }

      // Checking the .evn file to for the Category_ID
      const envPath = path.join(__dirname, "..", ".env");
      let envContent = await fs.readFile(envPath, "utf8");

      // Check if CATEGORY_ID exists in the .env file
      if (envContent.includes("CATEGORY_ID=")) {
        // If CATEGORY_ID exists, grab it and then update it

        // Grabbing the old category ID
        const oldCategoryIdRegex = /CATEGORY_ID=(\d{18})/;
        const match = oldCategoryIdRegex.exec(envContent);
        const oldCategoryId = match[1];

        envContent = envContent.replace(
          /CATEGORY_ID=\d{18}/,
          `CATEGORY_ID=${categoryId}`
        );

        console.log(
          `Updating the Category_Id from ${oldCategoryId} to >> ${categoryId} to the .env file`
        );
        await fs.writeFile(envPath, envContent);

        await interaction.reply({
          content: `Category ID updated to: ${categoryId}`,
          ephemeral: true,
        });
      } else {
        // If CATEGORY_ID doesn't exist, add it
        const newEnvContent = envContent + `\nCATEGORY_ID=${categoryId}\n`;

        console.log(`Writing the ${categoryId} to the .env file`);
        await fs.writeFile(envPath, newEnvContent);

        await interaction.reply({
          content: `Category ID set as: ${categoryId}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error during setup:", error);
      let errorMessage = "There was an error during the setup process.";

      if (error.code === "EACCES") {
        errorMessage = "Insufficient permissions to write to the .env file.";
      } else if (error.code === "ENOENT") {
        errorMessage = ".env file not found. Please create a .env file.";
      } else {
        console.error("Unhandled error:", error);
      }

      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  },
};
