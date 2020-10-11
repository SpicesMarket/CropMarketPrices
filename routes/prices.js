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
router.get("/latest", (req,res) => {
   LatestPrice.find({})
       .then((data) => {
           data.map(function(price) {
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

module.exports = router;