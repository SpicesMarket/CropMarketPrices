const express = require('express');

const router = express.Router();

const Price = require('../models/Price');

/**
 * A GET request to fetch all coffee prices
 */
router.get("/", (req, res) => {
    Price.find()
        .then((data) => {
            res.send({status: "success", data: data})
        })
        .catch(err => {
            console.log(err);
            res.send({status: "failure"})
        });
});

/**
 * A GET request to fetch the latest coffee price
 */
router.get("/latest", (req,res) => {
   Price.find().sort({scrappedAt: -1}).limit(1)
       .then((data) => {
           res.send({status: "success", data: data})
       })
       .catch(err => {
           console.log(err);
           res.send({status: "failure"})
       });
});

module.exports = router;