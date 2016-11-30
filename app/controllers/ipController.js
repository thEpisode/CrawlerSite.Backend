function IPController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Ip')(dependencies);
        _entity.Initialize();
    }

    var createIP = function (data, callback) {

        var ip = new _entity.GetModel()(
            {
                ApiKey: data.ApiKey,
                IP: data.IP,
                Name: data.Name,
                State: data.State
            });

        ip.save().then(function (result) {
            // When database return a result call the return
            callback(result);
        })
    }

    var deleteIP = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                console.log(err);
                callback(false);
            }
            
            callback(true);
        })
    }

    var getIPById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getIPByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllIP = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var editIp = function(data, callback){
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { IP: data.IP, Name: data.Name } }, { upsert: false }, function (err, result) {
            if (err) {
                console.log(err);
                callback(false);
            }
            
            callback(true);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateIP: createIP,
        DeleteIP: deleteIP,
        GetIPById: getIPById,
        GetIPByApiKey: getIPByApiKey,
        GetAllIP: getAllIP,
        EditIp: editIp,
        Entity: getEntity
    }
}

module.exports = IPController;