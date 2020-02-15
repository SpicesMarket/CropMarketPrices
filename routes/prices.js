const express = require('express');

const router = express.Router();

/**
 * A GET request to fetch coffee prices stored in mongoDB
 */
router.get("/", (req, res) => {
    res.send({status: "ok"})
});

module.exports = router;