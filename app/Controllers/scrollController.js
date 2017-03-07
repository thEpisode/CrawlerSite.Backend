function ScrollController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Scroll')(dependencies);
        _entity.Initialize();
    }

    var createScroll = function (data, callback) {

        var scroll = new _entity.GetModel()(
            {
                ApiKey: data.ApiKey,
                Event: {
                    Position: data.Event.Position,
                    TimeStamp: data.Event.TimeStamp,
                    Client: data.Event.Client,
                    Location: data.Event.Location
                },
                Pathname: data.Pathname,
            });

        scroll.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteScroll = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getScrollById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getScrollByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllScroll = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getInsight = function (ApiKey, MinWidth, MaxWidth, MaxTime,Flash, Browser, OperatingSystem, Cookies, Location, Endpoint, callback) {
        var query = {};

        if (ApiKey != 'null') { query['ApiKey'] = ApiKey; }
        if (MinWidth != 'null' && MaxWidth != 'null') { query['Event.Client.screen.width'] = { "$gt": parseInt(MinWidth), "$lt": parseInt(MaxWidth) } }
        if (MaxTime != 'null') { query['Event.TimeStamp'] = { "$gte": (new Date().getTime() - (parseInt(MaxTime) * 60 * 60 * 1000)) } }
        if (Flash != 'null') { query['Event.Client.flashVersion'] = (Flash.toLowerCase() === 'false' ? 'no check' : { $ne: 'no check' }) };
        if (Browser != 'null') { query['Event.Client.browser'] = Browser }
        if (OperatingSystem != 'null') { query['Event.Client.os'] = OperatingSystem }
        if (Cookies != 'null') { query['Event.Client.cookies'] = Cookies }
        if (Location != 'null') { /* Do something*/ }
        if (Endpoint != 'null') { query['Pathname'] = { "$regex": Endpoint.toLowerCase() === "index" ? "/" : Endpoint } }

        _mongoose.connection.db.collection('Scroll').find({
            query
        }).toArray(function (err, result){
            if(err) console.log(err);

            callback(result);
        });
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateScroll: createScroll,
        DeleteScroll: deleteScroll,
        GetScrollById: getScrollById,
        GetScrollByApiKey: getScrollByApiKey,
        GetAllScroll: getAllScroll,
        GetInsight: getInsight,
        Entity: getEntity
    }
}

module.exports = ScrollController;