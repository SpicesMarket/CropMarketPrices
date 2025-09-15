const express = require('express');
const router = express.Router();
const Price = require('../models/Price');
const LatestPrice = require('../models/LatestPrice');
const { SUCCESS, FAILURE } = require('../Constants');

/**
 * A GET request to fetch all historical spice prices
 */
router.get('/', async (req, res) => {
  try {
    const data = await Price.find();
    res.send({ status: SUCCESS, data });
  } catch (err) {
    console.error('Error fetching all prices:', err);
    res.send({ status: FAILURE, message: err.message });
  }
});

/**
 * A GET request to fetch the latest spices prices with trends
 */
router.get('/latest', async (req, res) => {
  try {
    const data = await LatestPrice.find({}).sort({ scrappedAt: -1 });
    const formattedData = data.map(price => ({
      spiceName: price.spiceName,
      spiceCost: price.spiceCost,
      average: price.average,
      status: price.status, // 1 (up/green), -1 (down/red), 0 (steady/grey)
      priceDiff: price.priceDiff, // Actual difference (e.g., 200 for "Up by ₹200")
      scrappedAt: price.scrappedAt,
    }));
    res.send({ status: SUCCESS, data: formattedData });
  } catch (err) {
    console.error('Error fetching latest prices:', err);
    res.send({ status: FAILURE, message: err.message });
  }
});

/**
 * A GET request to fetch the latest spices prices with historical graph data
 */
router.get('/v2/latest', async (req, res) => {
  try {
    const lastWeekPrices = await Price.find()
      .sort({ scrappedAt: -1 }) // Sort by scrappedAt in descending order to get the last 98 entries
      .limit(98);

    // Sort the fetched prices in ascending order for graph consistency
    lastWeekPrices.sort((a, b) => new Date(a.scrappedAt) - new Date(b.scrappedAt));

    let ungroupedSpices = [];
    lastWeekPrices.forEach(spicePrices => {
      spicePrices.prices.forEach(price => {
        price.scrappedAt = spicePrices.scrappedAt;
        ungroupedSpices.push(price);
      });
    });

    let groupedSpices = groupBy(ungroupedSpices, spice => spice.spiceName);
    const latestPrices = await LatestPrice.find({}).sort({ scrappedAt: -1 });

    const formattedData = latestPrices.map(price => ({
      spiceName: price.spiceName,
      spiceCost: price.spiceCost,
      average: price.average,
      status: price.status,
      priceDiff: price.priceDiff,
      scrappedAt: price.scrappedAt,
      graphData: groupedSpices.get(price.spiceName) || [], // Historical data for trends
    }));

    res.send({ status: SUCCESS, data: formattedData });
  } catch (err) {
    console.error('Error fetching latest prices with graph data:', err);
    res.send({ status: FAILURE, message: err.message });
  }
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