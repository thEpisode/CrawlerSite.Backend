function SubscriptionController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Subscription')(dependencies);
        _entity.Initialize();
    }

    var createSubscription = function (data, callback) {

        var subscription = new _entity.GetModel()(
            {
                Feature: data.Feature,
                Subscription: data.Subscription,
                Type: data.Type,
                Description: data.Description,
                State: data.State
            });

        subscription.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteSubscription = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getSubscriptionById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllSubscription = function (data, callback) {
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
        CreateSubscription: createSubscription,
        DeleteSubscription: deleteSubscription,
        GetSubscriptionById: getSubscriptionById,
        GetAllSubscription: getAllSubscription,
        Entity: getEntity
    }
}

module.exports = SubscriptionController;