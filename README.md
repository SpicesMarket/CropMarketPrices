# CropMarketPrices ![Node.js CI](https://github.com/rohithThammaiah/CropMarketPrices/workflows/Node.js%20CI/badge.svg?branch=master)

A Node.js + Express server that scrapes daily crop prices, stores them in MongoDB, and provides APIs to fetch historical and latest prices along with daily push notifications via OneSignal.  

## 📂 Project Structure

```
repo
├── index.js              # App entry point
├── scrape
│   ├── scrapper.js       # Scraping logic + notification service
│   └── priceParser.js    # (Reserved for parsing helpers)
├── routes
│   └── prices.js         # Routes for fetching prices
├── models
│   ├── Price.js          # Historical prices schema
│   └── LatestPrice.js    # Latest prices schema
├── utils
│   ├── helpers.js        # Helper functions
```

## ⚙️ Features

- Scrapes daily crop prices from an external API.  
- Saves both **historical** and **latest** price data in MongoDB.  
- Sends **daily push notifications** using OneSignal.  
- Scheduled cron job at **9 AM IST** for automatic scraping and notifications.  
- REST APIs to fetch:
  - All historical prices
  - Latest prices with trends
  - Latest prices + historical graph data

## 🚀 Getting Started

### 1️⃣ Clone the Repository (via Fork)
```bash
git clone https://github.com/SpicesMarket/CropMarketPrices.git
cd CropMarketPrices
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Environment Variables
Create a `.env` file in the root directory with:
```env
PORT=3000
DB_CONNECTION=mongodb+srv://<dummyUsername>:<dummyPassword>@spiceprices.ejdgr.mongodb.net/test?retryWrites=true&w=majority&appName=spiceprices
CROP_PRICES_API=https://api.kpa.org.in/v1/crop/prices
ONESIGNAL_APP_ID=<dummyAppId>
ONESIGNAL_REST_API_KEY=<dummyRestApiKey>
```

### 4️⃣ Run the Server
```bash
npm start
```

MongoDB will connect using the `DB_CONNECTION` string.

---

## 📡 API Endpoints

### 🔹 Scraping Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/scrapeForPrices` | Manually trigger scraping and DB update |
| `GET`  | `/scrapeForPrices/test-notification` | Send a test push notification |

### 🔹 Prices Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/prices` | Get all historical prices |
| `GET`  | `/prices/latest` | Get latest prices with trends |
| `GET`  | `/prices/v2/latest` | Get latest prices + graph data (historical trends) |

---

## 🗄️ Database Models

### 📌 Price (Historical)
```js
{
  scrappedAt: Date,
  prices: [
    {
      spiceName: String,
      spiceCost: String,
      average: Number,
      scrappedAt: Date
    }
  ]
}
```

### 📌 LatestPrice
```js
{
  spiceName: String,
  spiceCost: String,
  average: Number,
  status: Number,     // 1 = Increased, -1 = Decreased, 0 = Idle
  priceDiff: Number,  // Difference from last price
  scrappedAt: Date,
  graphData: [
    { average: Number, scrappedAt: Date }
  ]
}
```

---

## ⏰ Cron Job

A **daily cron job** is scheduled at **9 AM IST** to:
- Fetch and update prices.
- Send push notifications via OneSignal.  

---

## 🔔 Notifications

- Uses **OneSignal REST API**.  
- Sends a summary of daily crop prices to all subscribed users.  
- Example notification content:  
  ```
  🚨 Price Alert!  
  Coffee Arabica: ₹4000, Coffee Robusta: ₹3200  
  ```

---

## 🛠 Tech Stack

- **Node.js** + **Express** – Server framework  
- **MongoDB + Mongoose** – Database  
- **Axios** – API calls  
- **node-cron** – Scheduling daily jobs  
- **OneSignal** – Push notifications  

---

## 👨‍💻 Development Notes

- Ensure MongoDB Atlas cluster or local DB is running.  
- The project expects an external **CROP_PRICES_API** to fetch daily crop prices.  
- Error handling is implemented for invalid API responses and DB failures.  

---

## 📜 License
This project is licensed under the **MIT License**.  
