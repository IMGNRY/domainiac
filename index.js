#! /usr/bin/env node

/* 

The MIT License (MIT)

Copyright (c) 2014 IMGNRY International AB

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var express = require('express');
var colors = require('colors');
var request = require('request');
var fs = require('fs');

var app = express();

var settings;

fs.readFile('settings.json', { encoding: 'utf-8' }, function(err, data) {
    if (!data) {
        console.log(err);
        console.log('ERROR! Could not find or read a settings.json file, will try to create one.'.red);
        settings = {
            port: 80,
            routes: {
                'foo.com': '/foo',
                'bar.com': '/bar',
            }
        }
        fs.writeFile('settings.json', JSON.stringify(settings, null, 4));
        console.log('Successfully created a template settings.json file. Edit the file to suite your needs, and then restart the server.'.yellow);
        return;
    }
    else {
        settings = JSON.parse(data);
        var routes = settings['routes'];
        if (!routes) {
            console.log('ERROR! Could not find any routes in the settings.json file. Edit the file, and then restart the server.');
            return;
        }
        console.log('Found the following routes\n---------------------------')
        for (key in routes) {
            console.log(key.yellow + ' -> '.grey + routes[key].cyan);
        }
    }

    startServer();
});

function startServer() {

    app.get('*', function(req, res, next) {

        console.log('Request from domain: %s', req.host);

        if (req.host == 'localhost') {
            next();
            return;
        }

        var filepath = settings.routes[req.host];
        if (!filepath) {
            res.send(404);
            return;
        }

        var url = 'http://localhost:' + settings.port + filepath + req.path;
        console.log(url);
        request.get(url).pipe(res);
     
    });

    console.log('Current working directory: %s', process.cwd());
    app.use(express.static(process.cwd()));
    app.use(express.logger());

    app.listen(settings.port);

    console.log('--------------------------------------------'.yellow);
    console.log(' Server started @ '.rainbow + 'localhost'.magenta + ':'.yellow + '%s '.green, settings.port);
    console.log('--------------------------------------------'.yellow);

}