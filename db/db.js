const sqlite3 = require("sqlite3").verbose();

// Initialize the database
const db = new sqlite3.Database("./ormzybot.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    // Create the 'guilds' table
    db.run(
      `CREATE TABLE IF NOT EXISTS guilds (
        guild_id TEXT PRIMARY KEY,
        category_id TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'guilds' table:", err.message);
        } else {
          console.log("Guilds table ready.");
        }
      }
    );

    // Create the 'chanlogs' table
    db.run(
      `CREATE TABLE IF NOT EXISTS chanlogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT,
        category_id TEXT,
        channel TEXT,
        data TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating 'chanlogs' table:", err.message);
        } else {
          console.log("Chanlogs table ready.");
        }
      }
    );
  }
});

module.exports = db;
