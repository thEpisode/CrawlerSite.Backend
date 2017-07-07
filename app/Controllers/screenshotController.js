function ScreenshotController(dependencies) {

    /// Dependencies  
    var _console;
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Screenshot')(dependencies);
        _entity.Initialize();
    }

    var createScreenshot = function (data, callback) {

        var screenshot = new _entity.GetModel()(
            {
                Timestamp: data.Timestamp,
                Screenshot: data.Screenshot,
                Endpoint: data.Endpoint,
                Type: data.Type,
                ApiKey: data.ApiKey,
                IsObsolete: false,
            });

        screenshot.save().then(function (result) {
            // When database return a result call the return
            callback({ success: true, message: 'CreateScreenshot', result: result });
        }, function (err) {
            _console.log(err, 'error');
            callback({ success: false, message: 'Something was wrong while creating screenshot', result: null });
        })
    }

    var deleteScreenshotById = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data.Id, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something was wrong while deleting screenshot', result: null });
            }
            else {
                callback({ success: true, message: 'deleteScreenshot', result: result });
            }
        })
    }

    var getScreenshotById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data.Id }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                callback({ success: true, message: 'getScreenshotById', result: result });
            }

        })
    }

    var getScreenshotByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                callback({ success: true, message: 'getScreenshotByApiKey', result: result });
            }
        })
    }

    var getAllScreenshot = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                callback({ success: true, message: 'getScreenshotByApiKey', result: result });
            }
        })
    }

    var getIfLastScreenshotIsObsoleteByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, {}, { sort: { 'created_at': -1 } }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something was wrong while getting screenshot', result: null });
            }
            else {
                if (result != null) {
                    var timestamp = new Date(result.Timestamp);
                    if (Math.round((timestamp - (new Date()).toUTCString()) / (1000 * 60 * 60 * 24)) >= 30) {
                        callback({ success: true, message: 'getIfLastScreenshotIsObsoleteByApiKey', result: true });
                    }
                    else {
                        callback({ success: true, message: 'getIfLastScreenshotIsObsoleteByApiKey', result: false });
                    }
                }
                else {
                    callback({ success: true, message: 'getIfLastScreenshotIsObsoleteByApiKey', result: true });
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