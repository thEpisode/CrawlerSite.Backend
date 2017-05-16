function ClickController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

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
            if (err){
                _console.log(err, 'error');
            } 

            callback(result);
        })
    }

    var getClickByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            } 

            callback(result);
        })
    }

    var getAllClick = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err){
                _console.log(err, 'error');
            } 

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

        _mongoose.connection.db.collection('Click').find({
            query
        }).toArray(function (err, result){
            if (err){
                _console.log(err, 'error');
            } 

            callback(result);
        });
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