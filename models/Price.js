const mongoose = require('mongoose');

const PriceSchema = mongoose.Schema({
    scrappedAt: {
        type: Date,
        default: Date.now
    },
    prices: [Array]
});

module.exports = mongoose.model('Prices', PriceSchema);