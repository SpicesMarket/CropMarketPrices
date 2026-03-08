const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");
const cron = require("node-cron");
const {
  fetchAndUpdatePrices,
  sendDailyNotification,
} = require("./scrape/scrapper");

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const scrapperRoute = require("./scrape/scrapper");
const getPricesRoute = require("./routes/prices");

app.use(express.json());
app.use("/scrapeForPrices", scrapperRoute);
app.use("/prices", getPricesRoute);

// Cron Job for Daily Scraping and Notifications
cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      await fetchAndUpdatePrices();
      await sendDailyNotification();
      console.log("Daily task completed successfully.");
    } catch (error) {
      console.error("Daily task failed:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECTION, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });
