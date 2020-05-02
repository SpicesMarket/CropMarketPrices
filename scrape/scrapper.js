const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
require("../Constants")

const Price = require('../models/Price');

const router = express.Router();
const PRICES_URL = "http://kpa.org.in/";

const INCREASE = 1;
const IDLE = 0;
const DECREASE = -1;

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
                    finalJSONArray.push({
                        "spiceName": spices[i],
                        "spiceCost": spiceCosts[i]
                    })
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

module.exports = router;