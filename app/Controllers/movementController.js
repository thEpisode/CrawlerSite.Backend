function MovementController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Movement')(dependencies);
        _entity.Initialize();
    }

    var createMovement = function (data, next) {

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
            next();
        })
    }

    var deleteMovement = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            next(result);
        })
    }

    var getMovementById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getMovementByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllMovement = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getInsight = function (ApiKey, MinWidth, MaxWidth, MaxTime, Flash, Browser, OperatingSystem, Cookies, Location, Endpoint, next) {
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

        _mongoose.connection.db.collection('Movement').find(
            query
        ).toArray(function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        });
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