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

        subscription.save().then(function (err, result) {
            // When database return a result call the return
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when creating your subscription, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'CreateSubscription', result: result });
            }
        });
    }

    var deleteSubscription = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when deleting your subscription, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'DeleteSubscription', result: result });
            }
        });
    }

    var getSubscriptionById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when retrieving your subscription, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetSubscriptionById', result: result });
            }
        });
    }

    var getSubscriptionByUserId = function (data, callback) {
        _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when retrieving your subscription, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetSubscriptionById', result: result });
            }
        });
    }

    var getAllSubscription = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when retrieving your subscriptions, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetAllSubscription', result: result });
            }
        });
    }

    var addUserToSubscription = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data.SubscriptionId }, { $push: { "UsersId": { $each: data.UserId } } }, { safe: true, upsert: false }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when adding your new user, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'AddUserToSubscription', result: result });
            }
        });
    }

    var addSiteToSubscription = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data.SubscriptionId }, { $push: { "SitesId": { $each: data.SiteId } } }, { safe: true, upsert: false }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when adding your new site to your subscription, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'AddSiteToSubscription', result: result });
            }
        });
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateSubscription: createSubscription,
        DeleteSubscription: deleteSubscription,
        GetSubscriptionById: getSubscriptionById,
        GetSubscriptionByUserId: getSubscriptionByUserId,
        GetAllSubscription: getAllSubscription,
        AddUserToSubscription: addUserToSubscription,
        AddSiteToSubscription: addSiteToSubscription,
        Entity: getEntity
    }
}

module.exports = SubscriptionController;