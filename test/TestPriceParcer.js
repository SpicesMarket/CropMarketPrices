const assert = require('assert');

const priceParser = require("../scrape/priceParser");

describe('Price Scrapper', function () {
    it ('should parse low & high price from string', function () {
        const testCase1 = "Rs. 8950 - 9150 / 50KG"
        const testCase2 = "Rs. 8950 / 50KG"
        const testCase3 = "Rs. 300 / KG"
        const testCase4 = ""
        assert.deepEqual([8950, 9150], priceParser(testCase1))
        assert.equal(8950 , priceParser(testCase2))
        assert.equal(300 , priceParser(testCase3))
        assert.equal(null, priceParser(testCase4))
    })
})