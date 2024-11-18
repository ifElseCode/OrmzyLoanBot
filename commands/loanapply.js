const { SlashCommandBuilder } = require("discord.js");
const {
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
} = require("discord.js");
const { ChannelType, PermissionsBitField } = require("discord.js");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loanapply")
    .setDescription("Loan application ticket")
    .addUserOption((option) =>
      option.setName("user").setDescription("Mention a user").setRequired(false)
    ),

  async execute(interaction) {
    const userMention = interaction.options.getUser("user") || interaction.user; // Default to the command invoker

    console.log("Preparing modal...");
    console.log("User selected or default:", userMention.tag); // `.tag` for a formatted username

    // Modal components

    const loanTitleInput = new TextInputBuilder()
      .setMinLength(2)
      .setRequired(true)
      .setCustomId("loanTitle")
      .setLabel("Title and channel name:")
      .setStyle(TextInputStyle.Short);

    const loanAmountInput = new TextInputBuilder()
      .setMinLength(2)
      .setRequired(true)
      .setCustomId("loanAmount")
      .setLabel("Loan Amount:")
      .setStyle(TextInputStyle.Short);

    const assetsInput = new TextInputBuilder()
      .setMinLength(2)
      .setRequired(true)
      .setCustomId("assets")
      .setLabel("Total Assets:")
      .setStyle(TextInputStyle.Short);

    const loanTypeInput = new TextInputBuilder()
      .setMinLength(2)
      .setRequired(true)
      .setCustomId("loantype")
      .setLabel("Loan reason: ")
      .setStyle(TextInputStyle.Short);

    const notesInput = new TextInputBuilder()
      .setMinLength(10)
      .setRequired(false)
      .setCustomId("notes")
      .setLabel("Additional information: ")
      .setStyle(TextInputStyle.Paragraph);

    const row1 = new ActionRowBuilder().addComponents(loanTitleInput);
    const row2 = new ActionRowBuilder().addComponents(loanAmountInput);
    const row3 = new ActionRowBuilder().addComponents(assetsInput);
    const row4 = new ActionRowBuilder().addComponents(loanTypeInput);
    const row5 = new ActionRowBuilder().addComponents(notesInput);

    const modal = new ModalBuilder()
      .setCustomId("loanModal")
      .setTitle("Loan Application")
      .addComponents(row1, row2, row3, row4, row5);

    try {
      console.log("Showing modal...");
      await interaction.showModal(modal);

      const filter = (i) =>
        i.user.id === interaction.user.id && i.customId === "loanModal";

      console.log("Waiting for modal submission...");
      const collected = await interaction.awaitModalSubmit({
        filter,
        time: 90000,
      });

      const title = collected.fields.getTextInputValue("loanTitle");
      const loanAmount = collected.fields.getTextInputValue("loanAmount");
      const assets = collected.fields.getTextInputValue("assets");
      const loantype = collected.fields.getTextInputValue("loantype");
      const notes = collected.fields.getTextInputValue("notes");

      // Validate the loan amount
      // const moneyRegex = /^\d+(\.\d{1,2})?$/; // Matches numbers like 123, 123.4, or 123.45
      // if (!moneyRegex.test(title)) {
      //   await collected.reply({
      //     content:
      //       "Invalid loan amount. Please enter a valid number (e.g., 123.45).",
      //     ephemeral: true,
      //   });
      //   return;
      // }

      const channelName = `ticket-${userMention.username}-${title}`;
      console.log("Generated Channel Name:", channelName);

      if (!channelName || channelName.trim() === "") {
        console.error("Channel name is missing or invalid!");
        return;
      }

      const categoryId = process.env.CATEGORY_ID;
      if (!categoryId) {
        console.error("Category ID not found in .env file.");
        return;
      }

      let channel;
      try {
        console.log("Creating channel...");
        const botRoles = interaction.guild.members.me.roles.cache.filter(
          (role) => role.name !== "@everyone"
        ); // Get all roles assigned to the bot except the @everyone role

        console.log(
          "Bot roles:",
          botRoles.map((role) => role.name)
        );

        const permissionOverwrites = [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone by default
          },
          {
            id: userMention.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ];

        // Add all bot-assigned roles to the permission overwrites
        botRoles.forEach((role) => {
          permissionOverwrites.push({
            id: role.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          });
        });

        // Create the channel with the dynamic permissions
        channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites,
        });

        console.log("Channel created:", channel.name);

        await channel.send(
          `**Hello <@${userMention}>**,Thank you for starting your loan application. Below are the details you provided:\n\n**💰 Loan Amount:** ${loanAmount}\n\n**🏦 Total Assets:** ${assets}\n\n**📂 Loan Type:** ${loantype}\n\n**📝 Additional Information:**\n${notes}\n\nPlease provide any additional details or corrections if necessary. A banker will assist you shortly!`
        );
      } catch (error) {
        console.error("Error creating channel:", error);
      }

      await collected.reply({
        content: "Your ticket has been created!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Modal submission timeout or other error:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "You took too long to submit the modal. Please try again.",
          ephemeral: true,
        });
      }
    }
  },
};
