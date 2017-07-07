function Database(dependencies) {

    /// Dependencies   
    var _mongoose;
    var _cross;

    /// Properties
    var _db;
    var _dbConnected;

    /// Entities
    var _click;
    var _movement;
    var _scroll;
    var _form;
    var _ip;
    var _notification;
    var _price;
    var _site;
    var _user;
    var _frontendReview;
    var _grid;
    var _gridfs;
    var _creditCard;
    var _subscription;
    var _voucher;
    var _vote;
    var _screenshot;

    var constructor = function (callback) {
        _mongoose = dependencies.mongoose;
        _cross = dependencies.cross;
        _console = dependencies.console;
        _grid = dependencies.grid;
        _gridfs = dependencies.gridfs;

        databaseConnect(function (result) {
            callback(result);
        });
    }

    var databaseConnect = function (callback) {
        _mongoose.Promise = global.Promise;
        _mongoose.connect(_cross.GetMongoConnectionString());
        _db = _mongoose.connection;

        databaseHandler(function (result) {
            if (result == true) {
                _console.log('Database module initialized', 'server-success');
            }
            callback(result);
        });
    }

    var databaseHandler = function (callback) {
        _db.on('error', function (err) {
            _console.log('database failed to initialize' + err, 'error')
            _dbConnected = false;
            callback(false);
        });

        _db.once('open', function () {
            _console.log('Database connected at ' + _cross.GetMongoConnectionString(), 'server-success');
            _dbConnected = true;

            _gridfs = _grid(_db.db, _mongoose.mongo);

            entitiesControllers(function (result) {
                createIndexes();

                callback(result);
            });

        });
    }

    /// To improve performance
    var createIndexes = function () {
        _mongoose.connection.db.collection('Movement').createIndex({ "ApiKey": 1 });
        _mongoose.connection.db.collection('Movement').createIndex({ "Pathname": 1 });

        _mongoose.connection.db.collection('Click').createIndex({ "ApiKey": 1 });
        _mongoose.connection.db.collection('Click').createIndex({ "Pathname": 1 });

        _mongoose.connection.db.collection('Scroll').createIndex({ "ApiKey": 1 });
        _mongoose.connection.db.collection('Scroll').createIndex({ "Pathname": 1 });
    }

    var getGridFS = function () {
        return _gridfs;
    }

    var entitiesControllers = function (callback) {
        _click = require('./clickController')(dependencies);
        _click.Initialize();

        _movement = require('./movementController')(dependencies);
        _movement.Initialize();

        _scroll = require('./scrollController')(dependencies);
        _scroll.Initialize();

        _form = require('./formController')(dependencies);
        _form.Initialize();

        _ip = require('./ipController')(dependencies);
        _ip.Initialize();

        _notification = require('./notificationController')(dependencies);
        _notification.Initialize();

        _price = require('./priceController')(dependencies);
        _price.Initialize();

        _site = require('./siteController')(dependencies);
        _site.Initialize();

        _user = require('./userController')(dependencies);
        _user.Initialize();

        _creditCard = require('./creditCardController')(dependencies);
        _creditCard.Initialize();
        dependencies.CreditCardController = _creditCard;

        _subscription = require('./subscriptionController')(dependencies);
        _subscription.Initialize();

        _voucher = require('./voucherController')(dependencies);
        _voucher.Initialize();

        _vote = require('./voteController')(dependencies);
        _vote.Initialize();

        _screenshot = require('./screenshotController')(dependencies);
        _screenshot.Initialize();

        _frontendReview = require('./frontendReviewController')(dependencies);
        _frontendReview.Initialize();

        callback(true);
    }

    var isConnected = function () {
        return _dbConnected;
    }

    var getClickController = function () {
        return _click;
    }

    var getMovementController = function () {
        return _movement;
    }

    var getScrollController = function () {
        return _scroll;
    }

    var getFormController = function () {
        return _form;
    }

    var getIpController = function () {
        return _ip;
    }

    var getNotificationController = function () {
        return _notification;
    }

    var getPriceController = function () {
        return _price;
    }

    var getSiteController = function () {
        return _site;
    }

    var getUserController = function () {
        return _user;
    }

    var getFrontEndReviewController = function () {
        return _frontendReview;
    }

    var getCreditCardController = function () {
        return _creditCard;
    }

    var getVoucherController = function () {
        return _voucher;
    }

    var getVoteController = function () {
        return _vote;
    }

    var getScreenshotController = function () {
        return _screenshot;
    }

    var getSubscriptionController = function () {
        return _subscription;
    }

    return {
        Initialize: constructor,
        IsConnected: isConnected,
        Click: getClickController,
        Movement: getMovementController,
        Scroll: getScrollController,
        Form: getFormController,
        Ip: getIpController,
        Notification: getNotificationController,
        Price: getPriceController,
        Site: getSiteController,
        User: getUserController,
        FrontEndReview: getFrontEndReviewController,
        CreditCard: getCreditCardController,
        Subscription: getSubscriptionController,
        Voucher: getVoucherController,
        Vote: getVoteController,
        Screenshot: getScreenshotController,
        GetGridFS: getGridFS
    }
}

module.exports = Database;