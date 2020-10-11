const mongoose = require('mongoose');

const LatestPriceSchema = mongoose.Schema({
    spiceName: String,
    spiceCost: String,
    average: Number,
    status: Number,
    scrappedAt: {
        type: Date,
        default: Date.now
    },
    graphData: [{
        average: Number,
        scrappedAt: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model('LatestPrice', LatestPriceSchema)