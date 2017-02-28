function NotificationController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Notification')(dependencies);
        _entity.Initialize();
    }

    var createNotification = function (data, callback) {

        var notification = new _entity.GetModel()(
            {
                UserId: data.UserId,
                ShortMessage: data.ShortMessage,
                LongMessage: data.LongMessage,
                Uri: data.Uri,
                Type: data.Type,
                State: data.State
            });

        notification.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteNotification = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getNotificationById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getNotificationByUserId = function (data, callback) {
        _entity.GetModel().find({ "UserId": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllNotification = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateNotification: createNotification,
        DeleteNotification: deleteNotification,
        GetNotificationById: getNotificationById,
        GetNotificationByUserId: getNotificationByUserId,
        GetAllNotification: getAllNotification,
        Entity: getEntity
    }
}

module.exports = NotificationController;