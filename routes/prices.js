const express = require('express');
const router = express.Router();
const Price = require('../models/Price');
const LatestPrice = require('../models/LatestPrice');

require("../Constants")

/**
 * A GET request to fetch all spices prices
 */
router.get("/", (req, res) => {
    Price.find()
        .then((data) => {
            res.send({status: SUCCESS, data: data})
        })
        .catch(err => {
            console.log(err);
            res.send({status: FAILURE})
        });
});

/**
 * A GET request to fetch the latest spices price
 */
router.get("/latest", (req, res) => {
    LatestPrice.find({})
        .then((data) => {
            data.map(function (price) {
                // Todo Remove this has to be handled from the front-end
                price.average = Math.round(price.average)
                return price
            })

            res.send({status: SUCCESS, data: data})
        })
        .catch(err => {
            console.log(err);
            res.send({status: FAILURE})
        });
});

/**
 * A GET request to fetch the latest spices price
 */
router.get("/v2/latest", (req, res) => {
    Price.find()
        .sort({scrappedAt: -1}) // Descending
        .limit(7) // Last 7 data
        .then((lastWeekPrices) => {
            let ungroupedSpices = []
            lastWeekPrices.forEach((spicePrices) => {
                spicePrices.prices.forEach((price) => {
                    price.scrappedAt = spicePrices.scrappedAt
                    ungroupedSpices.push(price)
                })
            })
            let groupedSpices = groupBy(ungroupedSpices, spice => spice.spiceName)
            LatestPrice.find({})
                .then((latestPrices) => {
                    latestPrices.map(function (price) {
                        let lastWeekPrices = groupedSpices.get(price.spiceName)
                        price.graphData = lastWeekPrices
                        return price
                    })
                    res.send({status: SUCCESS, data: latestPrices})
                })
                .catch(err => {
                    console.log(err);
                    res.send({status: FAILURE})
                });
        })
        .catch(err => {
            console.log(err);
            res.send({status: FAILURE})
        });
});

/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
//export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
//    const map = new Map<K, Array<V>>();
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}


module.exports = router;