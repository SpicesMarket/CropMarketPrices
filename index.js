const express = require('express');
const cheerio = require('cheerio');
const request = require('request');

const app = express();
const PORT = process.env.port || 3000;

// Start to listening for requests
app.listen(PORT);

// Routes start here

app.get("/scrapeForPrices", (req, res) => {
    request('http://kpa.org.in/', (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);

            const finalJSONArray = [];
            $('.carousel-inner').each((i, div) => {
                const spices = [];
                const spiceCosts = [];
                $(div).find('h1').each((k, item) => {
                    spices.push($(item).text());
                });
                $(div).find('h5').each((k, item) => {
                    spiceCosts.push($(item).text());
                });
                for (i = 0; i < spices.length; i++) {
                    finalJSONArray.push({"spice": spices[i], "spicesCost": spiceCosts[i], "scrappedAt": Date.now()})
                }
            });
            res.send({status: 'success', data: finalJSONArray})
        }
    });
});