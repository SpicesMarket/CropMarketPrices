const mongoose = require('mongoose');

const LatestPriceSchema = mongoose.Schema({
    spiceName: String,
    spicePrice: String,
    status: Number
})

module.exports = mongoose.model('LatestPrice', LatestPriceSchema)