/**
 * CrawlerSite.Backend
 * Tag: 0.0.1
 */

console.log('\n\t\t\t== CrawlerSite.Backend ==\n\n');

/**
 * Dependencies
 */

const config = require('config');

const cross = require('./app/Controllers/crossController')({ config: config });
cross.SetSettings();

const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const checkInternet = require('is-online');
const assert = require('assert');
const mpromise = require('mpromise');
const open = require('open');
const colors = require('colors/safe');
const uuid = require('uuid');
const grid = require('gridfs-stream');
const emailjs = require('emailjs');
const stripe = require('stripe')(cross.GetStripePrivateKey());
const eventEmiter = require('events').EventEmitter;
const geoip = require('maxmind');

const express = require("express")
const app = require('express')();

var webProtocol = {};
var isHTTPS = false;

const https = require('https');
const http = require('http');

try {
    const options = {
        pfx: fs.readFileSync(path.join(__dirname, 'certificate/appservicecertificate.pfx')),
        passphrase: 'kVi3emAjxJnZd5pG9sbvlR7OKf8LPCHzhIFcyq2tQrBUu4XTgW'
    };
    webProtocol = https.createServer(options, app);
    isHTTPS = true;
}
catch (ex) {
    webProtocol = https.createServer(app);
    isHTTPS = false;
}

/**
 * Server configurations and Server Socket configurations
 * 
 * Using body parser we can get info from POST and/or URL parameters so easy,
 * check routesController.js
 */

/// Support encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

/// Support JSON encoded bodies
app.use(bodyParser.json());

/// Accept all origins
app.use(cors({ origin: '*' }));

// Settings for CORS, deep and manual configuration
app.use(function (req, res, next) {

    // App accept all origins
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods accepted
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers accepted
    res.header('Access-Control-Allow-Headers', 'Origin, x-access-token, X-Requested-With, Content-Type, Accept-Type');

    // Accept cookies in requests
    res.header('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Setting Socket.io  and CORS is enabled by default in Socket.io 2.0
var io = require('socket.io')(webProtocol, {});

/**
 * Dependencies Object to inject
 */
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

/**
 * Global settings
 */
const port = cross.NormalizePort(process.env.PORT || 3500);

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * App initialization
 */
console.log(dependencies.colors.green(' Crawler Site: ') + 'Initializing controllers');
var mainServer = require('./app/Controllers/mainController')(dependencies);

mainServer.Initialize(function () {
    /**
     * When all controllers are initialized succesfuly
     */
    console.log(dependencies.colors.green(' Crawler Site: ') + 'Controllers initialized succesfuly');
    console.log(dependencies.colors.green(' Crawler Site: ') + 'Waiting for events...');
    open(isHTTPS === true ? 'https://localhost:' + port : 'http://localhost:' + port);
});

/**
 * Listening app
 */
webProtocol.listen(port);
console.log(dependencies.colors.green(' Crawler Site: ') + 'Server URI: ' + (isHTTPS === true ? 'https://localhost:' + port : 'http://localhost:' + port)); 