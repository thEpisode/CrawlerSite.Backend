function CreditCardController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/CreditCard')(dependencies);
        _entity.Initialize();
    }

    var createCreditCard = function (data, callback) {

        var creditCard = new _entity.GetModel()(
            {
                Feature: data.Feature,
                CreditCard: data.CreditCard,
                Type: data.Type,
                Description: data.Description,
                State: data.State
            });

        creditCard.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteCreditCard = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getCreditCardById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getCreditCardByFeature = function (data, callback) {
        _entity.GetModel().findOne({ "Feature": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllCreditCard = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateCreditCard: createCreditCard,
        DeleteCreditCard: deleteCreditCard,
        GetCreditCardById: getCreditCardById,
        GetCreditCardByFeature: getCreditCardByFeature,
        GetAllCreditCard: getAllCreditCard,
        Entity: getEntity
    }
}

module.exports = CreditCardController;