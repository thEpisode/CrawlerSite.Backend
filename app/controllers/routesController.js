function Routes(dependencies) {

    /// Dependencies
    var _console;
    var _app;
    var _express;
    var _io;
    var _bodyParser;
    var _morgan;
    var _mongoose;
    var _jwt;
    var _checkInternet;
    var _database;
    var _cross;
    var _fileHandler;
    var _insights;

    var _apiRoutes;

    var constructor = function () {
        _app = dependencies.app;
        _express = dependencies.express;
        _bodyParser = dependencies.bodyParser;
        _database = dependencies.database;
        _console = dependencies.console;
        _apiRoutes = _express.Router();
        _cross = dependencies.cross;
        _jwt = dependencies.jwt;
        _fileHandler = dependencies.fileHandler;
        _insights = dependencies.insights;

        createAPI();

        _console.log('API routes module initialized', 'server-success');
    }

    var createAPI = function () {

        /// Authenticate
        /// -------------------------
        //  (POST http://localhost:3000/api/User/GetByCredentials)
        _apiRoutes.post('/User/GetByCredentials', function (req, res) {
            _database.User().GetUserByCredentials(req.body, function (result) {
                res.json({ message: 'GetUserByCredentials', result: result });
            })
        });

        // (POST http://localhost:3000/api/User/Create)
        _apiRoutes.post('/User/Create', function (req, res) {
            _database.User().CreateUser(req.body, function (result) {
                res.json({ message: 'CreateUser', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/DiscoveryMode/[KEY])
        _apiRoutes.get('/Site/DiscoveryMode/:ApiKey', function (req, res) {
            _database.Site().GetSiteByApiKey(req.params.ApiKey, function (result) {
                res.json({ message: 'GetSiteByApiKey', result: result.DiscoveryMode });
            })
        });

        //  (GET http://localhost:3000/api/Site/AddImage/
        _apiRoutes.post('/Site/AddImage', function (req, res) {
            _database.Site().WebCrawling(req.body.ApiKey, req.body.Endpoint, function (result) {
                // if hasn't a screenshot
                if (result == false) {
                    _fileHandler.CreateScreenshotFile(req.body.Base64Data, req.body.Endpoint, function (result) {
                        // Add new image to entity
                        _database.Site().AddScreenshotToChild(req.body.ApiKey, result._id + '', req.body.Endpoint, function () {
                            res.json({ message: 'CreateScreenshotFile', result: true });
                        })
                    })
                }
                else {
                    res.json({ message: 'CreateScreenshotFile', result: true });
                }
            })

        });


        /// Heatmap insights api routes
        /// -------------------------
        //  (GET http://localhost:3000/api/Insights/Heatmap/MinWidth/:MinWidth/MaxWidth/:MaxWidth/Type/:Type)
        _apiRoutes.get('/Insights/HeatmapData/ApiKey/:ApiKey/MinWidth/:MinWidth/MaxWidth/:MaxWidth/Type/:Type/MaxTime/:MaxTime/Endpoint/:Endpoint', function (req, res) {
            _insights.HeatmapData(req.params.ApiKey, req.params.MinWidth, req.params.MaxWidth, req.params.Type, req.params.MaxTime, req.params.Endpoint, function(result){
                res.json({ message: 'HeatmapData', result: result})
            })
        });

        _apiRoutes.get('/Insights/HeatmapScreenshot/ApiKey/:ApiKey/Pathname/:Pathname', function(req, res){
            _insights.HeatmapScreenshot(req.params.ApiKey, req.params.Pathname, function(file){
                file.pipe(res);
               //res.json({ message: 'HeatmapData', result: result})
            })
        });

        _apiRoutes.get('/Insights/HeatmapScreenshotById/:Id', function(req, res){
            _insights.HeatmapScreenshotById(req.params.Id, function(file){
                file.pipe(res);
            })
        })

        /// Middleware
        /// -------------------------
        //  To verify a token
        _apiRoutes.use(function (req, res, next) {
            // check header or url parameters or post parameters for token
            var token = req.body.token || req.query.token || req.headers['x-access-token'];

            // decode token
            if (token) {
                // verifies secret and checks exp
                _jwt.verify(token, _app.get('FlingerSecretJWT'), function (err, decoded) {
                    if (err) {
                        return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
                    }
                    else {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        next();
                    }
                });

            }
            else {

                // if there is no token
                // return an error
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });

            }
        });

        /// Welcome
        /// -------------------------
        // route to show message (GET http://localhost:3000/api/Welcome)
        _apiRoutes.get('/Welcome', function (req, res) {
            res.json({ message: 'Welcome to the coolest API on earth!' });
        });

        /// Click api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Click/Create)
        _apiRoutes.post('/Click/Create', function (req, res) {
            _database.Click().CreateClick(req.body, function (result) {
                res.json({ message: 'CreateClick', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Click/ApiKey/[KEY])
        _apiRoutes.get('/Click/ApiKey/:ApiKey', function (req, res) {
            _database.Click().GetClickByApiKey(req.params.ApiKey, function (result) {
                res.json({ message: 'GetClickByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click//Id[ID])
        _apiRoutes.get('/Click/Id/:Id', function (req, res) {
            _database.Click().GetClickById(req.params.Id, function (result) {
                res.json({ message: 'GetClickById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click)
        _apiRoutes.get('/Click/All', function (req, res) {
            _database.Click().GetAllClick(null, function (result) {
                res.json({ message: 'GetAllClick', result: result });
            })
        });

        /// Form api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Form/Create)
        _apiRoutes.post('/Form/Create', function (req, res) {
            _database.Form().CreateForm(req.body, function (result) {
                res.json({ message: 'CreateForm', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Click/ApiKey/[KEY])
        _apiRoutes.get('/Form/ApiKey/:ApiKey', function (req, res) {
            _database.Form().GetFormByApiKey(req.params.ApiKey, function (result) {
                res.json({ message: 'GetFormByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click/Id/[ID])
        _apiRoutes.get('/Form/Id/:Id', function (req, res) {
            _database.Form().GetFormById(req.params.Id, function (result) {
                res.json({ message: 'GetFormById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click)
        _apiRoutes.get('/Form/All', function (req, res) {
            _database.Form().GetAllForm(null, function (result) {
                res.json({ message: 'GetAllForm', result: result });
            })
        });

        /// Ip api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Ip/Create)
        _apiRoutes.post('/Ip/Create', function (req, res) {
            _database.Ip().CreateIP(req.body, function (result) {
                res.json({ message: 'CreateIP', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Ip/ApiKey/[KEY])
        _apiRoutes.get('/Ip/ApiKey/:ApiKey', function (req, res) {
            _database.Ip().GetIPByApiKey(req.params.ApiKey, function (result) {
                res.json({ message: 'GetIPByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Ip/Id/[ID])
        _apiRoutes.get('/Ip/Id/:Id', function (req, res) {
            _database.Ip().GetIPById(req.params.Id, function (result) {
                res.json({ message: 'GetIPById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Ip)
        _apiRoutes.get('/Ip/All', function (req, res) {
            _database.Ip().GetAllIP(null, function (result) {
                res.json({ message: 'GetAllIP', result: result });
            })
        });

        // (POST http://localhost:3000/api/Ip/Edit)
        _apiRoutes.post('/Ip/Edit', function (req, res) {
            _database.Ip().EditIp(req.body, function (result) {
                res.json({ message: 'EditIp', result: result });
            })
        });

        // (POST http://localhost:3000/api/Ip/Delete)
        _apiRoutes.post('/Ip/Delete', function (req, res) {
            _database.Ip().DeleteIP(req.body, function (result) {
                res.json({ message: 'DeleteIp', result: result });
            })
        });

        /// Movement api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Movement/Create)
        _apiRoutes.post('/Movement/Create', function (req, res) {
            _database.Movement().CreateMovement(req.body, function (result) {
                res.json({ message: 'CreateMovement', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Movement/ApiKey/[KEY])
        _apiRoutes.get('/Movement/ApiKey/:ApiKey', function (req, res) {
            _database.Movement().GetMovementByApiKey(req.params.ApiKey, function (result) {
                res.json({ message: 'GetMovementByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Movement/Id/[ID])
        _apiRoutes.get('/Movement/Id/:Id', function (req, res) {
            _database.Movement().GetMovementById(req.params.Id, function (result) {
                res.json({ message: 'GetMovementById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Movement)
        _apiRoutes.get('/Movement/All', function (req, res) {
            _database.Movement().GetAllMovement(null, function (result) {
                res.json({ message: 'GetAllMovement', result: result });
            })
        });

        /// Notification api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Notification/Create)
        _apiRoutes.post('/Notification/Create', function (req, res) {
            _database.Notification().CreateNotification(req.body, function (result) {
                res.json({ message: 'CreateNotification', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Notification/UserId/[KEY])
        _apiRoutes.get('/Notification/UserId/:UserId', function (req, res) {
            _database.Notification().GetNotificationByUserId(req.params.UserId, function (result) {
                res.json({ message: 'GetNotificationByUserId', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Notification/Id/[ID])
        _apiRoutes.get('/Notification/Id/:Id', function (req, res) {
            _database.Notification().GetNotificationById(req.params.Id, function (result) {
                res.json({ message: 'GetNotificationById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Notification)
        _apiRoutes.get('/Notification/All', function (req, res) {
            _database.Notification().GetAllNotification(null, function (result) {
                res.json({ message: 'GetAllNotification', result: result });
            })
        });

        /// Price api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Price/Create)
        _apiRoutes.post('/Price/Create', function (req, res) {
            _database.Price().CreatePrice(req.body, function (result) {
                res.json({ message: 'CreatePrice', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Price/Feature/[KEY])
        _apiRoutes.get('/Price/Feature/:Feature', function (req, res) {
            _database.Price().GetPriceByFeature(req.params.UserId, function (result) {
                res.json({ message: 'GetPriceByFeature', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Price/Id/[ID])
        _apiRoutes.get('/Price/Id/:Id', function (req, res) {
            _database.Price().GetPriceById(req.params.Id, function (result) {
                res.json({ message: 'GetPriceById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Price)
        _apiRoutes.get('/Price/All', function (req, res) {
            _database.Price().GetAllPrice(null, function (result) {
                res.json({ message: 'GetAllPrice', result: result });
            })
        });

        /// Scroll api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Scroll/Create)
        _apiRoutes.post('/Scroll/Create', function (req, res) {
            _database.Scroll().CreateScroll(req.body, function (result) {
                res.json({ message: 'CreateScroll', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Scroll/ApiKey/[KEY])
        _apiRoutes.get('/Scroll/ApiKey/:ApiKey', function (req, res) {
            _database.Scroll().GetScrollByApiKey(req.params.UserId, function (result) {
                res.json({ message: 'GetScrollByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Scroll/Id/[ID])
        _apiRoutes.get('/Scroll/Id/:Id', function (req, res) {
            _database.Scroll().GetScrollById(req.params.Id, function (result) {
                res.json({ message: 'GetScrollById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Scroll)
        _apiRoutes.get('/Scroll/All', function (req, res) {
            _database.Scroll().GetAllScroll(null, function (result) {
                res.json({ message: 'GetAllScroll', result: result });
            })
        });

        /// Site api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Site/Create)
        _apiRoutes.post('/Site/Create', function (req, res) {
            _database.Site().CreateSite(req.body, function (result) {
                res.json({ message: 'CreateSite', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/Name/[KEY])
        _apiRoutes.get('/Site/Name/:Name', function (req, res) {
            _database.Site().GetSiteByName(req.params.UserId, function (result) {
                res.json({ message: 'GetSiteByName', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/Id/[ID])
        _apiRoutes.get('/Site/Id/:Id', function (req, res) {
            _database.Site().GetSiteById(req.params.Id, function (result) {
                res.json({ message: 'GetSiteById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/All)
        _apiRoutes.get('/Site/All', function (req, res) {
            _database.Site().GetAllSite(null, function (result) {
                res.json({ message: 'GetAllSite', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/UserId)
        _apiRoutes.get('/Site/AddUserToSite/Site/:SiteId/User/:UserId', function (req, res) {
            _database.Site().AddUserToSite({ SiteId: req.params.SiteId, UserId: req.params.UserId }, function (result) {
                res.json({ message: 'UserId', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/UserId)
        _apiRoutes.get('/Site/UserId/:UserId', function (req, res) {
            _database.Site().GetAllSitesByUserId(req.params.UserId, function (result) {
                res.json({ message: 'UserId', result: result });
            })
        });

        // (POST http://localhost:3000/api/Site/Edit)
        _apiRoutes.post('/Site/Edit', function (req, res) {
            _database.Site().EditSite(req.body, function (result) {
                res.json({ message: 'EditSite', result: result });
            })
        });

        // (POST http://localhost:3000/api/User/Delete)
        _apiRoutes.post('/Site/Delete', function (req, res) {
            _database.Site().DeleteSite(req.body, function (result) {
                res.json({ message: 'DeleteSite', result: result });
            })
        });

        /// User api routes
        /// -------------------------
        //  (GET http://localhost:3000/api/User/Email/username@domain.com)
        _apiRoutes.get('/User/Email/:Email', function (req, res) {
            _database.User().GetUserByEmail(req.params.Email, function (result) {
                res.json({ message: 'GetUserByEmail', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/Id/[ID])
        _apiRoutes.get('/User/Id/:Id', function (req, res) {
            _database.User().GetUserById(req.params.Id, function (result) {
                res.json({ message: 'GetUserById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/User)
        _apiRoutes.get('/User/All', function (req, res) {
            _database.User().GetAllUser(null, function (result) {
                res.json({ message: 'GetAllUser', result: result });
            })
        });

        // (POST http://localhost:3000/api/User/Edit)
        _apiRoutes.post('/User/Edit', function (req, res) {
            _database.User().EditUser(req.body, function (result) {
                res.json({ message: 'EditUser', result: result });
            })
        });

        // (POST http://localhost:3000/api/User/Delete)
        _apiRoutes.post('/User/Delete', function (req, res) {
            _database.User().DeleteUser(req.body, function (result) {
                res.json({ message: 'DeleteUser', result: result });
            })
        });

        

        // apply the routes to our application with the prefix /api
        _app.use('/api', _apiRoutes);
    }

    return {
        Initialize: constructor
    }
}

module.exports = Routes;