require("../Constants");

const express = require('express');
const cheerio = require('cheerio');
const request = require('request');

const priceParser = require("./priceParser");

// Mongo Schemas
const Price = require('../models/Price');
const LatestPrice = require('../models/LatestPrice');

const router = express.Router();

/**
 * A GET request to scrape latest prices of coffee and store it in mongoDB
 */

const INCREASE = 1;
const IDLE = 0;
const DECREASE = -1;

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

            finalJSONArray.forEach(function (spice, index){
                LatestPrice.findOne({spiceName: spice.spiceName})
                    .sort({scrappedAt: -1})
                    .limit(1)
                    .then((data) => {
                        if (!data) {
                            console.log("!data")
                            let latestPriceJSON = {
                                spiceName : spice.spiceName,
                                spiceCost : spice.spiceCost,
                                average : spice.average,
                                status : IDLE,
                                scrappedAt: Date.now()
                            }
                            let _latestPrice = new LatestPrice(latestPriceJSON)
                            _latestPrice.save()
                        } else {
                            console.log("data")
                            let status = data.status

                            if (spice.average > data.average) {
                                status = INCREASE
                            } else if (spice.average < data.average) {
                                status = DECREASE
                            }

                            let latestPriceJSON = {
                                spiceName : spice.spiceName,
                                spiceCost : spice.spiceCost,
                                average : spice.average,
                                status : status,
                                scrappedAt: Date.now()
                            }
                            LatestPrice.update({"spiceName": spice.spiceName}, {
                                $set: latestPriceJSON
                            },function (err, collection) {
                                console.log(collection);
                                if (err) res.send({status: FAILURE});
                            })
                        }

                        if (finalJSONArray.length -1 === index) {
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
                    })
                    .catch(error => {
                        console.log(error);
                        res.send({status: FAILURE})
                    })
            })
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