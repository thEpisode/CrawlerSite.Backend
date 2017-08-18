function IPController(dependencies) {

    /// Dependencies   
    var _console;
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Ip')(dependencies); 
        _entity.Initialize();
    }

    var createIP = function (data, next) {

        var ip = new _entity.GetModel()(
            {
                ApiKey: data.ApiKey,
                PublicIP: data.PublicIP,
                PrivateIPs: data.PrivateIPs,
                Name: data.Name,
                State: data.State
            });

        ip.save().then(function (result) {
            // When database return a result call the return
            next(result);
        })
    }

    var deleteIP = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }
            
            next(true);
        })
    }

    var getIPById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllIPByApiKey = function (data, next) {
        _entity.GetModel().find({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllIP = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var editIp = function(data, next){
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { IP: data.IP, Name: data.Name } }, { upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }
            
            next(true);
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
        GetAllIPByApiKey: getAllIPByApiKey,
        GetAllIP: getAllIP,
        EditIp: editIp,
        Entity: getEntity
    }
}

module.exports = IPController;