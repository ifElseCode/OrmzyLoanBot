const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const {
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
} = require("discord.js");
const db = require("../db/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loanapply")
    .setDescription("Loan application ticket")
    .addUserOption((option) =>
      option.setName("user").setDescription("Mention a user").setRequired(false)
    ),

  async execute(interaction) {
    const userMention = interaction.options.getUser("user") || interaction.user;

    console.log("Preparing modal...");
    console.log("User selected or default:", userMention.tag);

    // Modal components
    const modal = new ModalBuilder()
      .setCustomId("loanModal")
      .setTitle("Loan Application")
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setMinLength(2)
            .setRequired(true)
            .setCustomId("loanTitle")
            .setLabel("Title and channel name:")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setMinLength(2)
            .setRequired(true)
            .setCustomId("loanAmount")
            .setLabel("Loan Amount:")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setMinLength(2)
            .setRequired(true)
            .setCustomId("assets")
            .setLabel("Total Assets:")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setMinLength(2)
            .setRequired(true)
            .setCustomId("loantype")
            .setLabel("Loan reason:")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setRequired(false)
            .setCustomId("notes")
            .setLabel("Additional information:")
            .setStyle(TextInputStyle.Paragraph)
        )
      );

    try {
      const categoryId = await getCategoryId(interaction.guild.id);

      console.log("Guild ID: ", interaction.guild.id);
      console.log("Category ID:", categoryId); // Log to check if it's valid

      // Show modal to the user
      await interaction.showModal(modal);

      const filter = (i) =>
        i.user.id === interaction.user.id && i.customId === "loanModal";
      const collected = await interaction.awaitModalSubmit({
        filter,
        time: 30000, // Increased timeout to 30 seconds
      });

      if (collected) {
        const loanTitle = collected.fields.getTextInputValue("loanTitle");
        const loanAmount = collected.fields.getTextInputValue("loanAmount");
        const assets = collected.fields.getTextInputValue("assets");
        const loantype = collected.fields.getTextInputValue("loantype");
        const notes = collected.fields.getTextInputValue("notes");

        const channelName = `ticket-${userMention.username}-${loanTitle}`;
        console.log("Generated Channel Name:", channelName);

        if (!channelName || channelName.trim() === "") {
          console.error("Channel name is missing or invalid!");
          return await collected.reply({
            content: "Please provide a valid title for the ticket.",
            ephemeral: true,
          });
        }

        await createTicketChannel(
          interaction,
          userMention,
          channelName,
          categoryId,
          loanAmount,
          assets,
          loantype,
          notes
        );

        // Ensure we reply to the modal submit interaction here.
        await collected.reply({
          content: "Your ticket has been created successfully!",
          ephemeral: true,
        });
      } else {
        console.error("No modal submission received within time limit.");
        await interaction.reply({
          content: "You took too long to submit the modal. Please try again.",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error during modal submission:", error);
      if (!interaction.replied) {
        // Reply to the main interaction (not the modal) if there's an error.
        await interaction.reply({
          content: "An error occurred while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};

// Get the category ID from the database for the guild
async function getCategoryId(guildId) {
  try {
    const result = await new Promise((resolve, reject) => {
      db.get(
        "SELECT category_id FROM guilds WHERE guild_id = ?",
        [guildId],
        (err, row) => {
          if (err) {
            reject(err);
          }
          resolve(row);
        }
      );
    });

    if (!result || !result.category_id) {
      console.error("Category ID not found in database for guild:", guildId);
      throw new Error(
        "Category ID not found in database for guild: " + guildId
      );
    }

    const categoryId = result.category_id;
    console.log("Fetched Category ID:", categoryId);
    return categoryId;
  } catch (error) {
    console.error("Error fetching category ID:", error.message);
    throw error; // Re-throw the error for handling in the main function
  }
}

// Function to create a ticket channel
async function createTicketChannel(
  interaction,
  userMention,
  channelName,
  categoryId,
  loanAmount,
  assets,
  loantype,
  notes
) {
  try {
    console.log("Creating channel...");

    const botRoles = interaction.guild.members.me.roles.cache.filter(
      (role) => role.name !== "@everyone"
    );

    // Validate the category ID
    const category = interaction.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      console.error(`Invalid or missing category: ${categoryId}`);
      await interaction.followUp({
        content: "Invalid category. Please configure a valid category ID.",
        ephemeral: true,
      });
      return;
    }

    const permissionOverwrites = createPermissionOverwrites(
      interaction,
      userMention,
      botRoles
    );

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites,
    });

    console.log("Channel created:", channel.name);

    await channel.send(
      `**Hello <@${userMention.id}>**, thank you for starting your loan application. Below are the details you provided:\n\n**💰 Loan Amount:** ${loanAmount}\n\n**🏦 Total Assets:** ${assets}\n\n**📂 Loan Type:** ${loantype}\n\n**📝 Additional Information:**\n${notes}\n\nPlease provide any additional details or corrections if necessary. A banker will assist you shortly!`
    );
  } catch (error) {
    console.error("Error creating channel:", error);
    await interaction.followUp({
      content:
        "There was an error while creating the ticket channel. Please try again later.",
      ephemeral: true,
    });
  }
}

// Helper function to generate permission overwrites
function createPermissionOverwrites(interaction, userMention, botRoles) {
  const permissionOverwrites = [
    {
      id: interaction.guild.id,
      deny: [PermissionsBitField.Flags.ViewChannel],
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

  botRoles.forEach((role) => {
    permissionOverwrites.push({
      id: role.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
      ],
    });
  });

  return permissionOverwrites;
}
