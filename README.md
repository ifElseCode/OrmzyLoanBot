# OrmzyLoanBot

Welcome to **OrmzyLoanBot**! A bot designed to make Ormzy’s journey to fortune a bit easier. 🚀 Get ready to automate your loan applications and manage them like a pro. Go, Ormzy, go! 💰

---

## Overview

OrmzyLoanBot streamlines the loan application process by providing a seamless form submission. When users fill out the form, the bot will automatically:

- Collect the entered data.
- Create a new Discord channel under a predefined category.
- Paste the collected data in the new channel.
- Alert all specified groups or roles.

---

## Features

- 💬 **Slash Commands**: Easily set up the bot and apply for loans with intuitive commands.
- 🔒 **Modal Forms**: Secure, user-friendly modal forms for loan data entry.
- 📤 **Automated Channel Creation**: Automatically creates a new Discord channel under your specified category.
- 📣 **Role Alerts**: Notifies the relevant groups/roles when a new loan application is submitted.

---

## Setup Instructions

1. **Setup the Bot**:
   - Use the `/setup` command to configure the bot.
   - Provide the ID of an existing **category** under which the bot will create the channels. 
   - To get the Category ID, **right-click** on the category in Discord and select **"Copy Channel ID"**.

2. **Apply for a Loan**:
   - After setup is complete, use the `/loanapply` command to input your loan application data.
   - The bot will take care of the rest—creating the channel, pasting the data, and alerting the right people!

---

## Commands

- `/setup [category_id]`: Set up the bot with a category to create channels under.
- `/loanapply`: Open a form to input loan application data.

---

## Ready to Go?

With **OrmzyLoanBot**, managing loan applications in Discord is easier than ever. Just follow the steps above and watch Ormzy’s fortune grow! 🌱✨



** Setup the bot over at discord.com developer portal

### Creating a Discord Bot Application
1. **Visit the Discord Developer Portal:** Go to https://discord.com/developers/applications.
2. **Create a New Application:** Click the "New Application" button.
3. **Add a Bot User:** Under the "Bot" tab, click "Add Bot." 
4. **Copy the Bot Token:** Keep this token secret. You'll need it to connect your bot to your application.

### Cloning the Repository
```bash
git clone [[https://github.com/ifElseCode/OrmzyLoanBot.git](https://github.com/ifElseCode/OrmzyLoanBot.git)]
cd your-repo
npm install
```

### Setting Up Your Bot
1. **Create a `.env` File:** Create a `.env` file in the root of your project directory.
2. **Add Your Bot Token:** Add the following line to your `.env` file, replacing `YOUR_BOT_TOKEN` with your actual bot token:
```bash
   BOT_TOKEN=YOUR_BOT_TOKEN
```

## Setting Up Your Discord Bot

**1. Create a New Application:**

* Go to the Discord Developer Portal: https://discord.com/developers/applications
* Click "New Application"
* Give your application a name.

**2. Create a Bot User:**
* In your application's dashboard, navigate to the "Bot" tab.
* Click "Add Bot."
* A popup will appear. Click "Yes, do it!"
* Copy the bot token. **Keep this token secret.**

**3. Invite Your Bot to a Server:**
* In your application's dashboard, navigate to the "OAuth2" tab.
* Under "Scopes," select "bot."
* Under "Bot Permissions," select the permissions you want to grant your bot (e.g., "Send Messages," "Manage Messages," "Manage Roles," etc.).
* Click "Copy URL."
* Paste the URL into your browser and follow the instructions to add your bot to your desired server.

**Now that your bot is set up, you can use it to interact with your Discord server.** 

**Remember:**
* **Keep your bot token secret.**
* **Follow Discord's guidelines and terms of service.**
* **Test your bot thoroughly to ensure it works as expected.**

By following these steps, you can create a powerful and versatile Discord bot to enhance your server's functionality.
