function ClickController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Click')(dependencies);
        _entity.Initialize();
    }

    var createClick = function (data, callback) {

        var click = new _entity.GetModel()(
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

        click.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteClick = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getClickById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getClickByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllClick = function (data, callback) {
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
        CreateClick: createClick,
        DeleteClick: deleteClick,
        GetClickById: getClickById,
        GetClickByApiKey: getClickByApiKey,
        GetAllClick: getAllClick,
        GetInsight: getInsight,
        Entity: getEntity
    }
}

module.exports = ClickController;