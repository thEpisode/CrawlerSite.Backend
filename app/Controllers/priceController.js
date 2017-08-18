function PriceController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Price')(dependencies);
        _entity.Initialize();
    }

    var createPrice = function (data, next) {

        var price = new _entity.GetModel()(
            {
                Feature: data.Feature,
                Price: data.Price,
                Type: data.Type,
                Description: data.Description,
                State: data.State
            });

        price.save().then(function (result) {
            // When database return a result call the return
            next();
        })
    }

    var deletePrice = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            next(result);
        })
    }

    var getPriceById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getPriceByFeature = function (data, next) {
        _entity.GetModel().findOne({ "Feature": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllPrice = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreatePrice: createPrice,
        DeletePrice: deletePrice,
        GetPriceById: getPriceById,
        GetPriceByFeature: getPriceByFeature,
        GetAllPrice: getAllPrice,
        Entity: getEntity
    }
}

module.exports = PriceController;