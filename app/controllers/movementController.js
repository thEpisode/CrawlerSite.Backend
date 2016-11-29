function MovementController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Movement')(dependencies);
        _entity.Initialize();
    }

    var createMovement = function (data, callback) {

        var movement = new _entity.GetModel()(
            {
                ApiKey: data.ApiKey,
                Event: {
                    Position: data.Event.Position,
                    Scroll: data.Event.Scroll,
                    TimeStamp: data.Event.TimeStamp,
                    Client: data.Event.Client,
                    Location: data.Event.Location
                },
                Pathname: data.Pathname,
            });

        movement.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteMovement = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getMovementById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getMovementByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllMovement = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getInsight = function (ApiKey, MinWidth, MaxWidth, MaxTime, Endpoint, callback) {
        var startAt = (new Date().getTime() - (parseInt(MaxTime) * 60 * 60 * 1000));
        _entity.GetModel().find({
            "ApiKey": ApiKey,
            "Event.Client.screen.width": { "$gt": parseInt(MinWidth), "$lt": parseInt(MaxWidth)},
            "Event.TimeStamp": {"$gte": startAt},
            "Pathname": {"$regex": Endpoint.toLowerCase() === "index" ? "/" : Endpoint}
        }, function (err, result){
            if(err) console.log(err);

            callback(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateMovement: createMovement,
        DeleteMovement: deleteMovement,
        GetMovementById: getMovementById,
        GetMovementByApiKey: getMovementByApiKey,
        GetAllMovement: getAllMovement,
        GetInsight: getInsight,
        Entity: getEntity
    }
}

module.exports = MovementController;