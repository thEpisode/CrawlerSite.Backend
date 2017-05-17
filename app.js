// Coplest.Flinger
// 0.0.1

console.log('\n\t\t\t== CrawlerSite.Backend ==\n\n');

// =======================
// libraries =========
// =======================

var config = require('config');

var cross = require('./app/Controllers/crossController')({ config: config });
cross.SetSettings();

/*var express = require("express");
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var cors = require('cors');*/
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var express   = require('express');
var app       = express();

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
// Settings for CORS
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://testcrawlersite.000webhostapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var server    = app.listen(cross.NormalizePort(process.env.PORT || 3500));
var io        = require('socket.io').listen(server, { origins: 'https://testcrawlersite.000webhostapp.com' });





var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var checkInternet = require('is-online');
var assert = require('assert');
var mpromise = require('mpromise');
var open = require('open');
var colors = require('colors/safe');
var uuid = require('uuid');
var fs = require('fs');
var grid = require('gridfs-stream');
var emailjs = require('emailjs');
var stripe = require('stripe')(cross.GetStripePrivateKey());
var eventEmiter = require('events').EventEmitter;
var geoip = require('maxmind');

var dependencies = {
    express: express,
    app: app,
    path: path,
    io: io,
    bodyParser: bodyParser,
    morgan: morgan,
    mongoose: mongoose,
    jwt: jwt,
    checkInternet: checkInternet,
    assert: assert,
    mpromise: mpromise,
    colors: colors,
    uuid: uuid,
    fs: fs,
    grid: grid,
    gridfs: {},
    mail: emailjs,
    stripe: stripe,
    cross: cross,
    geoip: geoip,
    eventEmiter: eventEmiter,
    root: __dirname,
}

console.log(dependencies.colors.green(' Crawler Site: ') + 'Libs imported');

// =======================
// configuration =========
// =======================
var port = 3500;

var isOnline = true;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/*// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
// Settings for CORS
app.use(cors({
    'allowedHeaders': ['x-access-token', 'Content-Type'],
    'exposedHeaders': ['x-access-token'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false,
    'credentials': true
}));
app.options('*', cors())
io.origins('*:*');
io.set('origins', '*:*');*/
// =======================
// initialize modules =========
// =======================
var mainServer = require('./app/Controllers/mainController')(dependencies);

mainServer.Initialize(function () {
    // =======================
    // launching app =========
    // =======================
    open('http://localhost:' + port);
});

// =======================
// listening app =========
// =======================
//io.listen(app.listen(cross.NormalizePort(process.env.PORT || port)), { origins: '*' });
console.log(dependencies.colors.green(' Crawler Site: ') + 'Listening on port ' + port); 