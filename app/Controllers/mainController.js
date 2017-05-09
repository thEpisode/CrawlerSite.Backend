function FlingerServer(dependencies) {

    var _app;

    // Modules
    var _cross;
    var _console;
    var _frontendController;
    var _routesController;
    var _socketController;
    var _databaseController;
    var _fileHandler;
    var _insightController;
    var _stripeController;
    var _mailController;
    var _notificationHubController;
    var _geolocateController;

    var constructor = function (callback) {
        _app = dependencies.app;

        /// Own Console declaration
        _console = require('./consoleController')(dependencies);
        _console.Initialize();
        dependencies.console = _console;

        /// Cross declaration
        _cross = dependencies.cross;

        /// Setting up secret for JWT
        _app.set('FlingerSecretJWT', _cross.GetFlingerSecretJWT());
        _app.set('trust_proxy', 'loopback');

        /// Database declaration
        _databaseController = require('./databaseController')(dependencies);
        dependencies.database = _databaseController;

        /// GeoLocate Controller
        _geolocateController = require('./geolocateController')(dependencies);
        dependencies.geolocateController = _geolocateController;

        _mailController = require('./mailController')(dependencies);
        dependencies.mailController = _mailController;

        _notificationHubController = require('./notificationHubController')(dependencies);
        dependencies.notificationHub = _notificationHubController;

        /// Stripe controller
        _stripeController = require('./stripeController')(dependencies);
        dependencies.stripeController = _stripeController;

        _databaseController.Initialize(function (databaseResult) {
            if (databaseResult == true) {
                _geolocateController.Initialize(function (geolocateResult) {
                    if (geolocateResult == true) {
                        dependencies.gridfs = _databaseController.GetGridFS();

                        /// Insights controller
                        _insightController = require('./insightController')(dependencies);
                        dependencies.insights = _insightController;

                        /// FileHandler declaration
                        _fileHandler = require('./fileController')(dependencies);
                        dependencies.fileHandler = _fileHandler;

                        /// Frontend declaration
                        _frontendController = require('./frontendController')(dependencies);

                        /// Routes declaration
                        _routesController = require('./routesController')(dependencies);

                        /// Socket declaration
                        _socketController = require('./socketController')(dependencies);

                        initializeControllers(callback);

                        _console.log('Server initialized', 'server-success');
                    }
                    else {
                        _console.log('Exiting from server app', 'error');
                        process.exit(0);
                    }
                })
            }
            else {
                _console.log('Exiting from server app', 'error');
                process.exit(0);
            }
        });
    }

    var initializeControllers = function (callback) {
        _insightController.Initialize();
        _fileHandler.Initialize();
        _routesController.Initialize();
        _frontendController.Initialize();
        _socketController.Initialize();
        _stripeController.Initialize();
        _mailController.Initialize();
        _notificationHubController.Initialize();

        _console.log('Modules initialized', 'server-success');
        callback();
    }

    return {
        Initialize: constructor
    }
}

module.exports = FlingerServer;