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
    var _geolocate;
    var _stripe;
    var _mail;
    var _notificationHub;

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
        _stripe = dependencies.stripeController;
        _mail = dependencies.mailController;
        _geolocate = dependencies.geolocateController;
        _notificationHub = dependencies.notificationHub;

        createAPI();

        _console.log('API routes module initialized', 'server-success');
    }

    var createAPI = function () {

        /// Authenticate
        /// -------------------------
        //  (POST http://localhost:3000/api/User/GetByCredentials)
        _apiRoutes.post('/User/GetByCredentials', function (req, res) {
            _database.User().GetUserByCredentials(req.body, function (result) {
                res.json({ success: true, message: 'GetUserByCredentials', result: result });
            })
        });

        // (POST http://localhost:3000/api/User/Create)
        _apiRoutes.post('/User/Create', function (req, res) {
            _database.User().CreateUser(req.body, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/DiscoveryMode/[KEY])
        _apiRoutes.get('/Site/DiscoveryMode/:ApiKey', function (req, res) {
            _database.Site().GetSiteByApiKey(req.params.ApiKey, function (result) {
                res.json({ success: true, message: 'GetSiteByApiKey', result: result.DiscoveryMode });
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
                            res.json({ success: true, message: 'CreateScreenshotFile', result: true });
                        })
                    })
                }
                else {
                    res.json({ success: true, message: 'CreateScreenshotFile', result: true });
                }
            })

        });

        /// Public Email api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/ContactUs/Send/)
        _apiRoutes.post('/ContactUs/Send/', function (req, res) {
            _mail.SenBasic(req.body, function (result) {
                res.json(result);
            })
        });

        /// Public Notifications api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Notification/Send/)
        _apiRoutes.post('/Notification/Send/', function (req, res) {
            _notificationHub.Send(req.body, function (result) {
                res.json(result);
            })
        });

        //  (POST http://localhost:3000/api/Notification/Send/)
        _apiRoutes.post('/Notification/SendToAll/', function (req, res) {
            _notificationHub.SendToAll(req.body, function (result) {
                res.json(result);
            })
        });


        /// Email api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Mail/SendBasic/)
        _apiRoutes.post('/Mail/SendBasic/', function (req, res) {
            _mail.SendBasic(JSON.parse(req.body), function (result) {

                res.json(result);
            })
        });


        /// Heatmap insights api routes
        /// -------------------------
        _apiRoutes.get('/Insights/HeatmapScreenshotById/:Id', function (req, res) {
            _insights.HeatmapScreenshotById(req.params.Id, function (file) {
                file.pipe(res);
            })
        })

        //  (POST http://localhost:3000/api/Mail/SendComposed/)
        _apiRoutes.post('/Mail/SendComposed/', function (req, res) {
            _mail.SendComposed(JSON.parse(req.body), function (result) {
                res.json(result);
            })
        });

        /// Middleware
        /// -------------------------
        //  To verify a token
        /*_apiRoutes.use(function (req, res, next) {
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
        });*/

        
        /// Welcome
        /// -------------------------
        // route to show message (GET http://localhost:3000/api/Welcome)
        _apiRoutes.get('/Welcome', function (req, res) {
            res.json({ success: true, message: 'Welcome to the coolest API on earth!' });
        });

        /// Click api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Click/Create)
        _apiRoutes.post('/Click/Create', function (req, res) {
            _database.Click().CreateClick(req.body, function (result) {
                res.json({ success: true, message: 'CreateClick', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Click/ApiKey/[KEY])
        _apiRoutes.get('/Click/ApiKey/:ApiKey', function (req, res) {
            _database.Click().GetClickByApiKey(req.params.ApiKey, function (result) {
                res.json({ success: true, message: 'GetClickByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click//Id[ID])
        _apiRoutes.get('/Click/Id/:Id', function (req, res) {
            _database.Click().GetClickById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetClickById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click)
        _apiRoutes.get('/Click/All', function (req, res) {
            _database.Click().GetAllClick(null, function (result) {
                res.json({ success: true, message: 'GetAllClick', result: result });
            })
        });

        /// Form api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Form/Create)
        _apiRoutes.post('/Form/Create', function (req, res) {
            _database.Form().CreateForm(req.body, function (result) {
                res.json({ success: true, message: 'CreateForm', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Click/ApiKey/[KEY])
        _apiRoutes.get('/Form/ApiKey/:ApiKey', function (req, res) {
            _database.Form().GetFormByApiKey(req.params.ApiKey, function (result) {
                res.json({ success: true, message: 'GetFormByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click/Id/[ID])
        _apiRoutes.get('/Form/Id/:Id', function (req, res) {
            _database.Form().GetFormById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetFormById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Click)
        _apiRoutes.get('/Form/All', function (req, res) {
            _database.Form().GetAllForm(null, function (result) {
                res.json({ success: true, message: 'GetAllForm', result: result });
            })
        });

        /// Ip api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Ip/Create)
        _apiRoutes.post('/Ip/Create', function (req, res) {
            _database.Ip().CreateIP(req.body, function (result) {
                res.json({ success: true, message: 'CreateIP', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Ip/ApiKey/[KEY])
        _apiRoutes.get('/Ip/ApiKey/:ApiKey', function (req, res) {
            _database.Ip().GetIPByApiKey(req.params, function (result) {
                res.json({ success: true, message: 'GetIPByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Ip/Id/[ID])
        _apiRoutes.get('/Ip/Id/:Id', function (req, res) {
            _database.Ip().GetIPById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetIPById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Ip)
        _apiRoutes.get('/Ip/All', function (req, res) {
            _database.Ip().GetAllIP(null, function (result) {
                res.json({ success: true, message: 'GetAllIP', result: result });
            })
        });

        // (POST http://localhost:3000/api/Ip/Edit)
        _apiRoutes.post('/Ip/Edit', function (req, res) {
            _database.Ip().EditIp(req.body, function (result) {
                res.json({ success: true, message: 'EditIp', result: result });
            })
        });

        // (POST http://localhost:3000/api/Ip/Delete)
        _apiRoutes.post('/Ip/Delete', function (req, res) {
            _database.Ip().DeleteIP(req.body, function (result) {
                res.json({ success: true, message: 'DeleteIp', result: result });
            })
        });

        /// Movement api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Movement/Create)
        _apiRoutes.post('/Movement/Create', function (req, res) {
            _database.Movement().CreateMovement(req.body, function (result) {
                res.json({ success: true, message: 'CreateMovement', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Movement/ApiKey/[KEY])
        _apiRoutes.get('/Movement/ApiKey/:ApiKey', function (req, res) {
            _database.Movement().GetMovementByApiKey(req.params.ApiKey, function (result) {
                res.json({ success: true, message: 'GetMovementByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Movement/Id/[ID])
        _apiRoutes.get('/Movement/Id/:Id', function (req, res) {
            _database.Movement().GetMovementById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetMovementById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Movement)
        _apiRoutes.get('/Movement/All', function (req, res) {
            _database.Movement().GetAllMovement(null, function (result) {
                res.json({ success: true, message: 'GetAllMovement', result: result });
            })
        });

        /// Notification api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Notification/Create)
        _apiRoutes.post('/Notification/Create', function (req, res) {
            _database.Notification().CreateNotification(req.body, function (result) {
                res.json({ success: true, message: 'CreateNotification', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Notification/UserId/[KEY])
        _apiRoutes.get('/Notification/UserId/:UserId', function (req, res) {
            _database.Notification().GetNotificationByUserId(req.params.UserId, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Notification/Id/[ID])
        _apiRoutes.get('/Notification/Id/:Id', function (req, res) {
            _database.Notification().GetNotificationById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetNotificationById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Notification)
        _apiRoutes.get('/Notification/All', function (req, res) {
            _database.Notification().GetAllNotification(null, function (result) {
                res.json({ success: true, message: 'GetAllNotification', result: result });
            })
        });

        /// Price api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Price/Create)
        _apiRoutes.post('/Price/Create', function (req, res) {
            _database.Price().CreatePrice(req.body, function (result) {
                res.json({ success: true, message: 'CreatePrice', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Price/Feature/[KEY])
        _apiRoutes.get('/Price/Feature/:Feature', function (req, res) {
            _database.Price().GetPriceByFeature(req.params.UserId, function (result) {
                res.json({ success: true, message: 'GetPriceByFeature', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Price/Id/[ID])
        _apiRoutes.get('/Price/Id/:Id', function (req, res) {
            _database.Price().GetPriceById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetPriceById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Price)
        _apiRoutes.get('/Price/All', function (req, res) {
            _database.Price().GetAllPrice(null, function (result) {
                res.json({ success: true, message: 'GetAllPrice', result: result });
            })
        });

        /// Scroll api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Scroll/Create)
        _apiRoutes.post('/Scroll/Create', function (req, res) {
            _database.Scroll().CreateScroll(req.body, function (result) {
                res.json({ success: true, message: 'CreateScroll', result: true });
            })
        });

        //  (GET http://localhost:3000/api/Scroll/ApiKey/[KEY])
        _apiRoutes.get('/Scroll/ApiKey/:ApiKey', function (req, res) {
            _database.Scroll().GetScrollByApiKey(req.params.UserId, function (result) {
                res.json({ success: true, message: 'GetScrollByApiKey', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Scroll/Id/[ID])
        _apiRoutes.get('/Scroll/Id/:Id', function (req, res) {
            _database.Scroll().GetScrollById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetScrollById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Scroll)
        _apiRoutes.get('/Scroll/All', function (req, res) {
            _database.Scroll().GetAllScroll(null, function (result) {
                res.json({ success: true, message: 'GetAllScroll', result: result });
            })
        });

        /// Site api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Site/Create)
        _apiRoutes.post('/Site/Create', function (req, res) {
            _database.Site().CreateSite(req.body, function (result) {
                res.json({ success: true, message: 'CreateSite', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/Name/[KEY])
        _apiRoutes.get('/Site/Name/:Name', function (req, res) {
            _database.Site().GetSiteByName(req.params.UserId, function (result) {
                res.json({ success: true, message: 'GetSiteByName', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/Id/[ID])
        _apiRoutes.get('/Site/Id/:Id', function (req, res) {
            _database.Site().GetSiteById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetSiteById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/All)
        _apiRoutes.get('/Site/All', function (req, res) {
            _database.Site().GetAllSite(null, function (result) {
                res.json({ success: true, message: 'GetAllSite', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/UserId)
        _apiRoutes.get('/Site/AddUserToSite/Site/:SiteId/User/:UserId', function (req, res) {
            _database.Subscription().AddUserToSubscription({ SubscriptionId: req.params.SubscriptionId, UserId: req.params.UserId }, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/UserId)
        _apiRoutes.get('/Site/UserId/:UserId', function (req, res) {
            _database.Site().GetAllSitesByUserId(req.params, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/Edit)
        _apiRoutes.post('/Site/Edit', function (req, res) {
            _database.Site().EditSite(req.body, function (result) {
                res.json({ success: true, message: 'EditSite', result: result });
            })
        });

        // (POST http://localhost:3000/api/Site/Delete)
        _apiRoutes.post('/Site/Delete', function (req, res) {
            _database.Site().DeleteSite(req.body, function (result) {
                res.json({ success: true, message: 'DeleteSite', result: result });
            })
        });

        /// User api routes
        /// -------------------------
        //  (GET http://localhost:3000/api/User/Email/username@domain.com)
        _apiRoutes.get('/User/Email/:Email', function (req, res) {
            _database.User().GetUserByEmail(req.params.Email, function (result) {
                res.json({ success: true, message: 'GetUserByEmail', result: result });
            })
        });

        //  (GET http://localhost:3000/api/Site/Id/[ID])
        _apiRoutes.get('/User/Id/:Id', function (req, res) {
            _database.User().GetUserById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetUserById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/User)
        _apiRoutes.get('/User/All', function (req, res) {
            _database.User().GetAllUser(null, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/User/Edit)
        _apiRoutes.post('/User/EditByUserId', function (req, res) {
            _database.User().EditUser(req.body, function (result) {
                res.json({ success: true, message: 'EditUser', result: result });
            })
        });

        // (POST http://localhost:3000/api/User/ChangePasswordByUserId)
        _apiRoutes.post('/User/ChangePasswordByUserId', function (req, res) {
            _database.User().ChangePasswordByUserId(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/User/Delete)
        _apiRoutes.post('/User/DeleteAccountByUserId', function (req, res) {
            _database.User().DeleteAccountByUserId(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/User/DeleteByUserId)
        _apiRoutes.post('/User/DeleteByUserId', function (req, res) {
            _database.User().DeleteByUserId(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/User/CheckIfHasNoPaymentMethod)
        _apiRoutes.post('/Payment/CheckIfHasNoPaymentMethodByUserId', function (req, res) {
            _database.CreditCard().CheckIfHasNoPaymentMethodByUserId(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/IncreasePageviewsHeatmaps)
        _apiRoutes.post('/Site/IncreasePageviewsHeatmaps', function (req, res) {
            _database.Site().IncreasePageviewsHeatmaps(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/IncreaseMovementHeatmaps)
        _apiRoutes.post('/Site/IncreaseMovementHeatmaps', function (req, res) {
            _database.Site().IncreaseMovementHeatmaps(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/IncreaseClickHeatmaps)
        _apiRoutes.post('/Site/IncreaseClickHeatmaps', function (req, res) {
            _database.Site().IncreaseClickHeatmaps(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/IncreaseScrollHeatmaps)
        _apiRoutes.post('/Site/IncreaseScrollHeatmaps', function (req, res) {
            _database.Site().IncreaseScrollHeatmaps(req.body, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/UserId)
        _apiRoutes.get('/Site/GetPageViewsHeatmapsByApiKey/:ApiKey', function (req, res) {
            _database.Site().GetPageViewsHeatmapsByApiKey(req.params, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/UserId)
        _apiRoutes.get('/Site/GetPageViewsHeatmapsByApiKeys/', function (req, res) {
            _database.Site().GetPageViewsHeatmapsByApiKeys(req.query, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/GetMovementHeatmapsByApiKey)
        _apiRoutes.get('/Site/GetMovementHeatmapsByApiKey/:ApiKey', function (req, res) {
            _database.Site().GetMovementHeatmapsByApiKey(req.params, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/GetMovementHeatmapsByApiKeys)
        _apiRoutes.get('/Site/GetMovementHeatmapsByApiKeys/', function (req, res) {
            _database.Site().GetMovementHeatmapsByApiKeys(req.query, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/GetClickHeatmapsByApiKey)
        _apiRoutes.get('/Site/GetClickHeatmapsByApiKey/:ApiKey', function (req, res) {
            _database.Site().GetClickHeatmapsByApiKey(req.params, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/GetClickHeatmapsByApiKeys)
        _apiRoutes.get('/Site/GetClickHeatmapsByApiKeys/', function (req, res) {
            _database.Site().GetClickHeatmapsByApiKeys(req.query, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/GetScrollHeatmapsByApiKey)
        _apiRoutes.get('/Site/GetScrollHeatmapsByApiKey/:ApiKey', function (req, res) {
            _database.Site().GetScrollHeatmapsByApiKey(req.params, function (result) {
                res.json(result);
            })
        });

        //  (GET http://localhost:3000/api/Site/GetScrollHeatmapsByApiKeys)
        _apiRoutes.get('/Site/GetScrollHeatmapsByApiKeys/', function (req, res) {
            _database.Site().GetScrollHeatmapsByApiKeys(req.query, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/UpdateRATInsights)
        _apiRoutes.post('/User/UpdateRATInsights', function (req, res) {
            _database.Site().UpdateRATInsights(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/UpdateFormsInsights)
        _apiRoutes.post('/Site/UpdateFormsInsights', function (req, res) {
            _database.Site().UpdateFormsInsights(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/UpdateRecordsInsights)
        _apiRoutes.post('/User/UpdateRecordsInsights', function (req, res) {
            _database.Site().UpdateRecordsInsights(req.body, function (result) {
                res.json(result);
            })
        });

        // (POST http://localhost:3000/api/Site/UpdateClientsBehavior)
        _apiRoutes.post('/Site/UpdateClientsBehavior', function (req, res) {
            _database.Site().UpdateClientsBehavior(req.body, function (result) {
                res.json(result);
            })
        });

        /// FrontEndReviews api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/FrontEndReview/Create)
        _apiRoutes.post('/FrontEndReview/Create', function (req, res) {
            _database.FrontEndReview().CreateFrontEndReview(req.body, function (result) {
                res.json({ success: true, message: 'CreateFrontEndReview', result: result });
            })
        });
        //  (GET http://localhost:3000/api/FrontEndReview/UserId/:UserId)
        _apiRoutes.get('/FrontEndReview/UserId/:UserId', function (req, res) {
            _database.FrontEndReview().GetFrontEndReviewByUserId(req.params.UserId, function (result) {
                res.json({ success: true, message: 'GetFrontEndReviewByUserId', result: result });
            })
        });

        //  (GET http://localhost:3000/api/FrontEndReview/Id/[ID])
        _apiRoutes.get('/FrontEndReview/Id/:Id', function (req, res) {
            _database.FrontEndReview().GetFrontEndReviewById(req.params.Id, function (result) {
                res.json({ success: true, message: 'GetFrontEndReviewById', result: result });
            })
        });

        //  (GET http://localhost:3000/api/FrontEndReview/All)
        _apiRoutes.get('/FrontEndReview/All', function (req, res) {
            _database.FrontEndReview().GetAllFrontEndReview(null, function (result) {
                res.json({ success: true, message: 'GetAllFrontEndReview', result: result });
            })
        });

        // (POST http://localhost:3000/api/FrontEndReview/Delete)
        _apiRoutes.post('/FrontEndReview/Delete', function (req, res) {
            _database.FrontEndReview().DeleteFrontEndReview(req.body, function (result) {
                res.json({ success: true, message: 'DeleteFrontEndReview', result: result });
            })
        });

        /// Stripe api routes
        /// -------------------------
        //  (POST http://localhost:3000/api/Payment/Subscription/UpdatePaymentMethod)
        _apiRoutes.post('/Stripe/Webhooks/', function (req, res) {
            _stripe.ProcessWebhook(JSON.parse(req.body), function (result) {
                if (result == true) {
                    res.send(200);
                }
                res.send(409);
            })
        });

        //  (POST http://localhost:3000/api/Payment/Subscription/UpdatePaymentMethod)
        _apiRoutes.post('/Payment/Subscription/UpdatePaymentMethod', function (req, res) {
            _stripe.UpdateSubscription(req.body, function (result) {
                res.json(result);
            })
        });

        //  (POST http://localhost:3000/api/Payment/Subscription/ChangePlan)
        _apiRoutes.post('/Payment/Subscription/ChangePlan', function (req, res) {
            _stripe.ChangePlan(req.body, function (result) {
                res.json(result);
            })
        });

        //  (POST http://localhost:3000/api/Payment/GetCustomerByUserId)
        _apiRoutes.post('/Payment/GetCustomerByUserId', function (req, res) {
            _stripe.GetCustomerByUserId(req.body, function (result) {
                res.json(result);
            })
        });

        //  (POST http://localhost:3000/api/Payment/GetChargesByUserId)
        _apiRoutes.post('/Payment/GetChargesByUserId', function (req, res) {
            _stripe.GetChargesByUserId(req.body, function (result) {
                res.json(result);
            })
        });

        //  (POST http://localhost:3000/api/Payment/Subscription/Cancel)
        _apiRoutes.post('/Payment/Subscription/Cancel', function (req, res) {
            _stripe.CancelSubscription(req.body, function (result) {
                res.json(result);
            })
        });

        _apiRoutes.post('/Payment/GetSubscriptionByUserId', function(req, res){
            _database.Subscription().GetSubscriptionByUserId(req.body, function(result){
                res.json(result);
            })
        })

        //  (GET http://localhost:3000/api/Plans/All)
        _apiRoutes.get('/Plans/All', function (req, res) {
            _stripe.GetAllPlans(function (result) {
                res.json(result);
            })
        });

        /// Heatmap insights api routes
        /// -------------------------
        //  (GET http://localhost:3000/api/Insights/Heatmap/MinWidth/:MinWidth/MaxWidth/:MaxWidth/Type/:Type)
        _apiRoutes.get('/Insights/HeatmapData/ApiKey/:ApiKey/MinWidth/:MinWidth/MaxWidth/:MaxWidth/Type/:Type/MaxTime/:MaxTime/Flash/:Flash/Browser/:Browser/OperatingSystem/:OperatingSystem/Cookies/:Cookies/Location/:Location/Endpoint/:Endpoint', function (req, res) {
            _insights.HeatmapData(req.params, function (result) {
                res.json({ success: true, message: 'HeatmapData', result: result })
            })
        });

        _apiRoutes.get('/Insights/HeatmapScreenshot/ApiKey/:ApiKey/Pathname/:Pathname', function (req, res) {
            _insights.HeatmapScreenshot(req.params.ApiKey, req.params.Pathname, function (file) {
                file.pipe(res);
                //res.json({ message: 'HeatmapData', result: result})
            })
        });

        _apiRoutes.post('/Insights/DashboardByApiKey', function (req, res) {
            _insights.DashboardInsightsByApiKey(req.body, function (result) {
               
                res.json(result)
            })
        });

        _apiRoutes.post('/Insights/DashboardInsightsByApiKeys', function (req, res) {
            _insights.DashboardInsightsByApiKeys(req.body, function (result) {
               
                res.json(result)
            })
        });

        _apiRoutes.get('/Insights/DashboardInsightsByUserId/:UserId', function (req, res) {
            _insights.DashboardInsightsByUserId(req.params, function (result) {
               
                res.json(result)
            })
        });

        _apiRoutes.get('/GeoLocate/LocateByIp/:IP', function (req, res) {
            _geolocate.Locate(req.params, function (result) {
               
                res.json(result);
            })
        });

        _apiRoutes.get('/GeoLocate/Locate/', function (req, res) {
            var ip =  req.ip;debugger;
            _geolocate.Locate({IP: ip}, function (result) {
               
                res.json(result);
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