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
                CreditCardToken: data.CreditCardToken,
                FirstNameCard: data.FirstNameCard,
                LastNameCard: data.LastNameCard,
                State: _entity.GetStates().Active,
            });

        creditCard.save().then(function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when creating your credit card, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'CreateCreditCard', result: result });
            }
        })
    }

    var deleteCreditCard = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when deleting your credit card, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'DeleteCreditCard', result: result });
            }
        })
    }

    var getCreditCardById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when getting your credit card, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetCreditCardById', result: result });
            }
        })
    }

    var getCreditCardByFeature = function (data, callback) {
        _entity.GetModel().findOne({ "Feature": data }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when getting your credit card, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetCreditCardByFeature', result: result });
            }
        })
    }

    var getAllCreditCard = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when getting your credit card, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetAllCreditCard', result: result });
            }
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