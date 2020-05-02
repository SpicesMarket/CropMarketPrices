require("../Constants");

const express = require('express');
const cheerio = require('cheerio');
const request = require('request');

const priceParser = require("./priceParser");

// Mongo Schemas
const Price = require('../models/Price');

const router = express.Router();

/**
 * A GET request to scrape latest prices of coffee and store it in mongoDB
 */

router.post("/", (req, res) => {
    request(PRICES_URL, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);

            const finalJSONArray = [];
            $('.carousel-inner').each((i, div) => {
                const spices = [];
                const spiceCosts = [];

                // Scrape for spice name
                $(div).find('h1').each((k, item) => {
                    spices.push($(item).text());
                });

                // Scrape for spice cost
                $(div).find('h5').each((k, item) => {
                    spiceCosts.push($(item).text());
                });

                // Add each value to a JSON array
                for (i = 0; i < spices.length; i++) {
                    const spiceWithoutStatus = {
                        "spiceName": spices[i],
                        "spiceCost": spiceCosts[i],
                        "average" : calculateAverage(priceParser(spiceCosts[i]))
                    }
                    finalJSONArray.push(spiceWithoutStatus)
                }

            });
            const priceWrapper = new Price({prices: finalJSONArray});
            priceWrapper.save()
                .then(() => {
                    res.send({status: SUCCESS});
                })
                .catch(err => {
                    console.log(err);
                    res.send({status: FAILURE})
                });
        }
    });
});

function calculateAverage(prices) {
    if (prices === null || prices.length === 0) {
        return 0
    } else if (prices.length === 1) {
        return prices[0]
    } else if (prices.length === 2) {
        return (prices[0] + prices[1]) / 2
    }
}

module.exports = router;