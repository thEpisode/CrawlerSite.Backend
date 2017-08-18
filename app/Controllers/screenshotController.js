function ScreenshotController(dependencies) {

    /// Dependencies
    var _database;
    var _console;
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _database = dependencies.database;
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Screenshot')(dependencies);
        _entity.Initialize();
    }

    var createScreenshot = function (data, next) {

        var screenshot = new _entity.GetModel()(
            {
                DocumentSize: data.DocumentSize,
                Timestamp: data.Timestamp,
                Screenshot: data.Screenshot,
                Endpoint: data.Endpoint,
                Type: data.Type,
                ApiKey: data.ApiKey,
                IsObsolete: false,
            });

        screenshot.save().then(function (screenshotResult) {
            // Save this new Screenshot Id into Site.Track
            _database.Site().AddScreenshotToChild(data.ApiKey, screenshotResult._id, data.Endpoint, function (savedScreenshot) {
                // When database return a result call the return
                next({ success: true, message: 'CreateScreenshot', result: screenshotResult });
            });
        }, function (err) {
            _console.log(err, 'error');
            next({ success: false, message: 'Something was wrong while creating screenshot', result: null });
        })
    }

    var deleteScreenshotById = function (data, next) {
        _entity.GetModel().findOneAndRemove(data.Id, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something was wrong while deleting screenshot', result: null });
            }
            else {
                next({ success: true, message: 'deleteScreenshot', result: result });
            }
        })
    }

    var getScreenshotById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data.Id }, function (err, screenshotResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                next({ success: true, message: 'getScreenshotById', result: screenshotResult });
            }

        })
    }

    var getScreenshotByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                next({ success: true, message: 'getScreenshotByApiKey', result: result });
            }
        })
    }

    var getAllScreenshot = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                next({ success: true, message: 'getScreenshotByApiKey', result: result });
            }
        })
    }

    var getIfLastScreenshotIsObsoleteByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, {}, { sort: { 'created_at': -1 } }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                if (result != null) {
                    var timestamp = new Date(result.Timestamp);
                    if (Math.round((timestamp - (new Date()).toUTCString()) / (1000 * 60 * 60 * 24)) >= 30) {
                        next({ success: true, message: 'getIfLastScreenshotIsObsoleteByApiKey', result: true });
                    }
                    else {
                        next({ success: true, message: 'getIfLastScreenshotIsObsoleteByApiKey', result: false });
                    }
                }
                else {
                    next({ success: true, message: 'getIfLastScreenshotIsObsoleteByApiKey', result: true });
                }
            }
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateScreenshot: createScreenshot,
        DeleteScreenshotById: deleteScreenshotById,
        GetScreenshotById: getScreenshotById,
        GetScreenshotByApiKey: getScreenshotByApiKey,
        GetAllScreenshot: getAllScreenshot,
        GetIfLastScreenshotIsObsoleteByApiKey: getIfLastScreenshotIsObsoleteByApiKey,
        Entity: getEntity
    }
}

module.exports = ScreenshotController;