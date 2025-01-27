function NotificationHubController(dependencies) {

    /// Dependencies   
    var _mail;
    var _cross;
    var _database;
    var _console;

    var _server;

    var constructor = function () {
        _cross = dependencies.cross;
        _mail = dependencies.mailController;
        _database = dependencies.database;
        _console = dependencies.console;
    }

    var sendNotification = function (notificationData, next) {
        send(notificationData);

        next({ success: true, message: 'SendNotification', result: true });
    }

    var sendToAll = function (notificationData, next) {
        _database.User().GetAllUser(null, function (data) {
            if (data.success == true) {
                data.result.forEach(function (item, index) {
                    if (notificationData.InAppData != undefined) {
                        notificationData.InAppData.UserId = item._id;
                    }
                    if (notificationData.EmailData != undefined) {
                        notificationData.EmailData.UserId = item._id;
                    }
                    send(notificationData);
                })
                next({ success: true, message: 'SendToAll', result: true });
            }
            else {
                next({ success: false, message: 'No users found', result: true });
            }
        })
    }

    var send = function (notificationData) {
        if (notificationData.IsEmail == true) {
            _mail.SendComposed(notificationData.EmailData, function (data) { });
        }
        if (notificationData.IsInApp == true) {
            _database.Notification().CreateNotification(notificationData.InAppData, function (data) { });
        }
        if (notificationData.IsSMS == true) {
            // Do something
        }
    }

    var getNotificationTypes = function () {
        return _database.Notification().Entity().GetTypes();
    }

    var getNotificationStates = function () {
        return _database.Notification().Entity().GetStates();
    }

    return {
        Initialize: constructor,
        Send: sendNotification,
        SendToAll: sendToAll,
        GetNotificationTypes: getNotificationTypes,
        GetNotificationStates: getNotificationStates,
    }
}

module.exports = NotificationHubController;