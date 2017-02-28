function NotificationHubController(dependencies) {

    /// Dependencies   
    var _mail;
    var _cross;
    var _database;

    var _server;

    var constructor = function () {
        _cross = dependencies.cross;
        _mail = dependencies.mail;
        _database = dependencies.database;
    }

    var sendNotification = function(notificationData, callback){
        if(notificationData.IsEmail == true){
            _mail.SendComposed(notificationData.EmailData, function(data){});
        }
        if(notificationData.IsInApp == true){
            _database.Notification().CreateNotification(notificationData.InAppData, function(data){});
        }
        if(notificationData.IsSMS == true){
            // Do something
        }

        callback({ success: true, message: 'SendComposed', result: message });
    }

    return {
        Initialize: constructor,
        SendNotification: sendNotification
    }
}

module.exports = NotificationHubController;