const sqlite3 = require("sqlite3").verbose();

// Initialize the database
const db = new sqlite3.Database("./ormzybot.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS guilds (
        guild_id TEXT PRIMARY KEY,
        category_id TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Database table ready.");
        }
      }
    );
  }
});

module.exports = db;
