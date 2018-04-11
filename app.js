var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser')
var cors = require('cors');
var fs = require('fs');

var app = express();
app.use(cors());
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());

app.get('/data', function(req, res){
    url = 'http://www.hidro.gov.ar/oceanografia/alturashorarias.asp';

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            let response = {};
            
            $('table.table-striped thead').filter(function(){                
                let data = $(this);
                response.times = data.children().first().children()
                    .map((i,v)=>$(v).html().replace('<br>',' '))
                    .toArray()
                    .slice(1)
                    .map(date => new Date(date));
            });

            $('table.table-striped tbody tr:nth-child(8)').filter(function(){
                let data = $(this);
                response.values = data.children()
                    .map((i,v)=>$(v).html())
                    .toArray()
                    .slice(1)
                    .map(v => parseFloat(v.replace(',', '.'), 10));
            });

            
            $('table.table-striped tbody tr:nth-child(8) td:nth-child(1) a').filter(function(){
                let data = $(this);
                response.title = data.html();
            });

            res.send(response);

        }
    })
});
  
  

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
