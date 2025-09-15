const express = require("express");
const axios = require("axios");
const OneSignal = require("onesignal-node");
const {
  SUCCESS,
  FAILURE,
  PRICES_URL,
  INCREASE,
  IDLE,
  DECREASE,
} = require("../Constants");
const { calculateAverage } = require("../utils/helpers");
const Price = require("../models/Price");
const LatestPrice = require("../models/LatestPrice");

const router = express.Router();

/**
 * Fetches coffee prices from the API.
 * @returns {Promise<Array>} Raw price data from API
 * @throws {Error} If fetching fails
 */
async function fetchPrices() {
  const response = await axios.get(process.env.CROP_PRICES_API, {
    timeout: 10000,
    headers: {
      Origin: PRICES_URL,
      Referer: PRICES_URL,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch prices: HTTP ${response.status}`);
  }

  const { data, message } = response.data;
  if (
    message !== "Crop prices retrieved successfully" ||
    !Array.isArray(data)
  ) {
    throw new Error("Invalid API response format");
  }

  return data.map((item) => ({
    ...item,
    price_change: item.price_change || "unchanged",
  }));
}

/**
 * Processes raw price data into a formatted array.
 * @param {Array} data - Raw API data
 * @param {Date} scrapeTimestamp - Timestamp of the scrape
 * @returns {Array} Formatted price objects
 */
function processPrices(data, scrapeTimestamp) {
  const formattedPrices = [];

  for (const item of data) {
    const { name, price_min, price_max, price_diff, price_change } = item;
    if (!name || price_min == null) {
      console.warn(
        `Skipping invalid item: name=${name}, price_min=${price_min}`
      );
      continue;
    }

    const spiceCost =
      price_max != null
        ? `₹${price_min.toLocaleString()}-${price_max.toLocaleString()}`
        : `₹${price_min.toLocaleString()}`;
    const prices = price_max != null ? [price_min, price_max] : [price_min];
    const average = calculateAverage(prices);

    formattedPrices.push({
      spiceName: name,
      spiceCost,
      average,
      priceDiff: price_diff,
      price_change: price_change || "unchanged",
      scrappedAt: scrapeTimestamp,
    });
  }

  return formattedPrices;
}

/**
 * Updates LatestPrice and Price models with processed prices.
 * @param {Array} formattedPrices - Processed price objects
 * @param {Date} scrapeTimestamp - Timestamp of the scrape
 * @throws {Error} If database operations fail
 */
async function updatePriceModels(formattedPrices, scrapeTimestamp) {
  if (formattedPrices.length === 0) {
    console.warn("No valid prices to update");
    return;
  }

  const updatePromises = formattedPrices.map(async (crop) => {
    const existing = await LatestPrice.findOne({ spiceName: crop.spiceName })
      .sort({ scrappedAt: -1 })
      .limit(1);

    // Map API's price_change to status
    const priceChangeToStatus = {
      increased: INCREASE,
      decreased: DECREASE,
      unchanged: IDLE,
    };
    const status = priceChangeToStatus[crop.price_change] || IDLE; // Fallback to IDLE if undefined

    const latestPriceJSON = {
      spiceName: crop.spiceName,
      spiceCost: crop.spiceCost,
      average: crop.average,
      status,
      priceDiff: crop.priceDiff, // Store actual difference
      scrappedAt: scrapeTimestamp,
    };

    if (!existing) {
      await new LatestPrice(latestPriceJSON).save();
    } else {
      await LatestPrice.updateOne(
        { spiceName: crop.spiceName },
        { $set: latestPriceJSON }
      );
    }
  });

  await Promise.all(updatePromises);

  await new Price({
    prices: formattedPrices,
    scrappedAt: scrapeTimestamp,
  }).save();
}

/**
 * Fetches and updates coffee prices in the database.
 * @returns {Promise<Array>} Processed price objects
 * @throws {Error} If fetching or updating fails
 */
async function fetchAndUpdatePrices() {
  try {
    const data = await fetchPrices();
    const scrapeTimestamp = new Date();
    const formattedPrices = processPrices(data, scrapeTimestamp);
    await updatePriceModels(formattedPrices, scrapeTimestamp);
    return formattedPrices;
  } catch (error) {
    console.error("Fetch and update failed:", error.message);
    throw error;
  }
}

/**
 * Sends daily push notification with latest prices via OneSignal.
 * @returns {Promise<{status: string, notificationId?: string, message?: string}>} Notification result
 * @throws {Error} If notification sending fails (except for no subscribers)
 */
async function sendDailyNotification() {
  try {
    const latestPrices = await LatestPrice.find({}).sort({ scrappedAt: -1 });
    if (latestPrices.length === 0) {
      console.warn("No prices available for notification");
      return { status: SUCCESS, message: "No prices available" };
    }

    const priceSummary = latestPrices
      .map((p) => `${p.spiceName}: ₹${p.average.toFixed(2)}`)
      .join(", ");

    const notification = {
      contents: { en: `Daily Coffee Prices: ${priceSummary}` },
      headings: { en: "🚨 Price Alert!" },
      included_segments: ["All"],
      data: { type: "daily_prices", timestamp: new Date().toISOString() },
    };

    const client = new OneSignal.Client(
      process.env.ONESIGNAL_APP_ID,
      process.env.ONESIGNAL_REST_API_KEY
    );
    const response = await client.createNotification(notification);

    // Check for no subscribers error
    if (response.body?.errors) {
      console.warn("No subscribers found, skipping notification");
      return { status: SUCCESS, message: response.body.errors[0] };
    }

    // Check for valid notification ID
    if (!response.body?.id) {
      throw new Error("Invalid notification response");
    }

    console.log("Notification sent:", response.body.id);
    return { status: SUCCESS, notificationId: response.body.id };
  } catch (error) {
    console.error("Notification failed:", error.message);
    throw error;
  }
}

/**
 * POST route for manual price fetching.
 */
router.post("/", async (req, res) => {
  try {
    const results = await fetchAndUpdatePrices();
    res.status(200).json({ status: SUCCESS, data: results });
  } catch (error) {
    console.error("Manual fetch error:", error.message);
    res.status(500).json({ status: FAILURE, message: error.message });
  }
});

/**
 * GET route for testing notifications (secured with query param).
 */
router.get("/test-notification", async (req, res) => {
  try {
    const result = await sendDailyNotification();
    res.status(200).json({
      status: SUCCESS,
      ...(result.notificationId
        ? { data: { notificationId: result.notificationId } }
        : { message: result.message }),
    });
  } catch (error) {
    console.error("Test notification error:", error.message);
    res.status(500).json({ status: FAILURE, message: error.message });
  }
});

module.exports = router;
module.exports.fetchAndUpdatePrices = fetchAndUpdatePrices;
module.exports.sendDailyNotification = sendDailyNotification;
