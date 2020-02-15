const express = require('express');

const router = express.Router();

const Price = require('../models/Price');

/**
 * A GET request to fetch coffee prices stored in mongoDB
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

module.exports = router;