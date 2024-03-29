const mongoose = require('mongoose');

const PriceSchema = mongoose.Schema({
    scrappedAt: {
        type: Date,
        default: Date.now
    },
    prices: [{spiceName: String, spiceCost: String, average: Number, scrappedAt: Date, _id: false}]
});

module.exports = mongoose.model('Prices', PriceSchema);