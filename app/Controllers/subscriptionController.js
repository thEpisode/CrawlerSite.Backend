function SubscriptionController(dependencies) {

    /// Dependencies   
    var _mongoose;
    var _creditCardController;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _creditCardController = dependencies.CreditCardController;

        _entity = require('../Models/Subscription')(dependencies);
        _entity.Initialize();
    }

    var createSubscription = function (data, callback) {
        var subscription = new _entity.GetModel()(
            {
                _id: _mongoose.Types.ObjectId(),
                Email: data.Email,
                CustomerId: data.CustomerId,
                PlanId: data.PlanId,
                CurrentPlan: data.CurrentPlan,
                SubscriptionId: data.SubscriptionId,
                State: _entity.GetStates().Active,
                UsersId: [],
                SitesId: [],
                CreditCard: data.CreditCard._id,
            });

        subscription.save().then(function (result) {
            callback({ success: true, message: 'CreateSubscription', result: result });
        }, function (err) {
            console.log(err);
            callback({ success: false, message: 'Something went wrong when creating your subscription, try again.', result: null });
        });
    }

    var editSubscription = function (data, callback) {
        var state = data.State == undefined ? _entity.GetStates().Active : data.state;
        _entity.GetModel().findOneAndUpdate(
            { "_id": data._id },
            {
                $set:
                {
                    CustomerId: data.CustomerId,
                    PlanId: data.PlanId,
                    CurrentPlan: data.CurrentPlan,
                    SubscriptionId: data.SubscriptionId,
                    State: state
                }
            },
            {
                upsert: false
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when editing your credit card, try again.', result: null });
                }
                else {
                    callback({ success: true, message: 'EditSubscription', result: result });
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
        _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }).populate("CreditCard").exec(function (err, subscriptionResult) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when retrieving your subscription, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetSubscriptionById', result: subscriptionResult });
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

    var getAllSitesOfSubscriptionByUserId = function (data, callback) {
        _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }).populate("SitesId").exec(function (err, subscriptionResult) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when getting your sites, try again.', result: null });
            }
            else {
                if(subscriptionResult !== undefined && subscriptionResult !== null){
                    if(subscriptionResult.SitesId != undefined && subscriptionResult.SitesId !== null){
                        callback({ success: true, message: 'GetAllSitesOfSubscriptionByUserId', result: subscriptionResult.SitesId });
                    }
                }
            }
        });
    }

    var addUserToSubscription = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data.SubscriptionId }, { $push: { "UsersId": data.UserId } }, { safe: true, upsert: false }, function (err, result) {
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
        _entity.GetModel().findOneAndUpdate({ "_id": data.SubscriptionId }, { $push: { "SitesId": data.SiteId } }, { safe: true, upsert: false }, function (err, result) {
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
        EditSubscription: editSubscription,
        DeleteSubscription: deleteSubscription,
        GetSubscriptionById: getSubscriptionById,
        GetSubscriptionByUserId: getSubscriptionByUserId,
        GetAllSubscription: getAllSubscription,
        GetAllSitesOfSubscriptionByUserId: getAllSitesOfSubscriptionByUserId,
        AddUserToSubscription: addUserToSubscription,
        AddSiteToSubscription: addSiteToSubscription,
        Entity: getEntity
    }
}

module.exports = SubscriptionController;