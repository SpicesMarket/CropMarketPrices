const mongoose = require('mongoose');

const PriceSchema = mongoose.Schema({
    spice: {
        type: String,
        required: true
    },
    spicesCost: {
        type: String,
        required: true
    },
    scrappedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prices', PriceSchema);