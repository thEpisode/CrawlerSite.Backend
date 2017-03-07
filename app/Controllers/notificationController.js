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
                State: data.State,
                ItWasRead: _entity.GetStates().Unread,
                Unread: _entity.GetStates().Unread,
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
        _entity.GetModel().findOneAndUpdate({ "_id": data }, { $set: { Unread: _entity.GetStates().Read } }, { upsert: false }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getNotificationByUserId = function (data, callback) {
        _entity.GetModel().find({ "UserId": data }, function (err, notificationsResult) {
            if (err) { console.log(err) };

            if (notificationsResult != undefined && notificationsResult != null) {
                if (notificationsResult.length > 0) {
                    var notificationsRemaining = notificationsResult.length;
                    var result = [];

                    notificationsResult.forEach(function (item) {
                        if (item.ItWasRead == _entity.GetStates().Unread) {

                            _entity.GetModel().findOneAndUpdate({ "_id": item._id }, { $set: { ItWasRead: _entity.GetStates().Seen } }, { upsert: false }, function (err, notificationResult) {

                                --notificationsRemaining;
                                notificationResult.ItWasRead = _entity.GetStates().Seen;
                                result.push(notificationResult);
                                if (notificationsRemaining <= 0) {
                                    callback({ success: true, message: 'GetNotificationByUserId', result: result });
                                }
                            })
                        }
                        else {
                            --notificationsRemaining;
                            result.push(item);
                            if (notificationsRemaining <= 0) {
                                callback({ success: true, message: 'GetNotificationByUserId', result: result });
                            }
                        }
                    })
                }
                else {
                    callback({ success: false, message: 'User has no notifications', result: null });
                }
            }
            else {
                callback({ success: false, message: 'User has no notifications', result: null });
            }
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