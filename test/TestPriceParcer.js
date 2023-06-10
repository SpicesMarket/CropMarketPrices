const assert = require('assert');

const priceParser = require("../scrape/priceParser");

describe('Price Scrapper', function () {
    it('when price has a start & end value then should return two values in an array', function () {
        const testCase1 = "Rs. 8950 - 9150 / 50KG"

        assert.deepEqual([8950, 9150], priceParser(testCase1))
    })
    it('when price a single value then should return the same value in an array', function () {
        const testCase1 = "Rs. 8950 / 50KG"
        const testCase2 = "Rs. 300 / KG"

        assert.deepEqual([8950], priceParser(testCase1))
        assert.deepEqual([300], priceParser(testCase2))
    })
    it('when price is empty then should return null', function () {
        const testCase1 = ""

        assert.equal(null, priceParser(testCase1))
    })
})