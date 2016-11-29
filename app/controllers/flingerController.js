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

    var constructor = function () {
        _app = dependencies.app;

        /// Own Console declaration
        _console = require('./consoleController')(dependencies);
        _console.Initialize();
        dependencies.console = _console;

        /// Cross declaration
        _cross = require('./crossController')({});
        dependencies.cross = _cross;
        _cross.SetFlingerSecretJWT("FlingerIsCool");
        _cross.SetMongoConnectionString("mongodb://127.0.0.1:27017/Flinger");

        /// Setting up secret for JWT
        _app.set('FlingerSecretJWT', _cross.GetFlingerSecretJWT());

        /// Database declaration
        _databaseController = require('./databaseController')(dependencies);
        dependencies.database = _databaseController;

        _databaseController.Initialize(function (result) {
            if (result == true) {
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

                initializeControllers();

                _console.log('Server initialized', 'server-success');
            }
        });
    }

    var initializeControllers = function () {
        _insightController.Initialize();
        _fileHandler.Initialize();
        _routesController.Initialize();
        _frontendController.Initialize();
        _socketController.Initialize();

        _console.log('Modules initialized', 'server-success');
    }

    return {
        Initialize: constructor
    }
}

module.exports = FlingerServer;