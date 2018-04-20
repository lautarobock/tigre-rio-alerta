var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
// var http = require('http');
var bodyParser = require('body-parser')
var cors = require('cors');
var fs = require('fs');

let app = express();
app.use(cors());
// app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());

app.get('/data', function (req, res) {
    const url = 'http://www.hidro.gov.ar/oceanografia/alturashorarias.asp';

    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            let response: any = {};

            $('table.table-striped thead').filter(function () {
                response.times = $(this).children().first().children()
                    .map((i, v) => $(v).html().replace('<br>', ' '))
                    .toArray()
                    .slice(1)
                    .map(date => {
                        const dateArr = date.split(' ')[0].split('/');
                        const timeArr = date.split(' ')[1].split(':');
                        return new Date(dateArr[2], dateArr[1], dateArr[0], timeArr[0], timeArr[1]);
                    });
            });

            // $('table.table-striped tbody tr:nth-child(8)').filter(function () {
            //     response.values = $(this).children()
            //         .map((i, v) => $(v).html())
            //         .toArray()
            //         .slice(1)
            //         .map(v => parseFloat(v.replace(',', '.')));
            // });
            
            response.all = [];
            response.titles = [];
            for (let i = 1; i <= 10; i++) {
                $(`table.table-striped tbody tr:nth-child(${i})`).filter(function () {
                    response.all.push($(this).children()
                        .map((i, v) => $(v).html())
                        .toArray()
                        .slice(1)
                        .map(v => parseFloat(v.replace(',', '.'))));
                });
                $(`table.table-striped tbody tr:nth-child(${i}) td:nth-child(1) a`).filter(function () {
                    response.titles.push($(this).html());
                });
            }

            // $('table.table-striped tbody tr:nth-child(8) td:nth-child(1) a').filter(function () {
            //     response.title = $(this).html();
            // });

            res.send(response.titles.map((title, i) => ({
                title,
                values: response.all[i].map((value, j) => ({
                    height: value,
                    time: response.times[j]
                }))
            })));

        }
    })
});
module.exports = app;