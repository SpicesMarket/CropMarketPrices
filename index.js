const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const scrapperRoute = require('./scrape/scrapper');
const getPricesRoute = require('./routes/prices');

app.use('/scrapeForPrices', scrapperRoute);
app.use('/prices', getPricesRoute);

// Start to listening for requests
app.listen(PORT);
// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser: true}, (err) => {
    if (err)
        console.log(err);
    else
        console.log('Connect to DB using mongoose')
});