function SubscriptionController(dependencies) {

    /// Dependencies   
    var _console;
    var _mongoose;
    var _creditCardController;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _creditCardController = dependencies.CreditCardController;
        _console = dependencies.console;

        _entity = require('../Models/Subscription')(dependencies);
        _entity.Initialize();
    }

    var createSubscription = function (data, next) {
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
            next({ success: true, message: 'CreateSubscription', result: result });
        }, function (err) {
            _console.log(err, 'error');
            next({ success: false, message: 'Something went wrong when creating your subscription, try again.', result: null });
        });
    }

    var editSubscription = function (data, next) {
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
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when editing your credit card, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'EditSubscription', result: result });
                }
            });
    }

    var deleteSubscription = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when deleting your subscription, try again.', result: null });
            }
            else {
                next({ success: true, message: 'DeleteSubscription', result: result });
            }
        });
    }

    var getSubscriptionById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when retrieving your subscription, try again.', result: null });
            }
            else {
                next({ success: true, message: 'GetSubscriptionById', result: result });
            }
        });
    }

    var getSubscriptionByUserId = function (data, next) {
        _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }).populate("CreditCard").exec(function (err, subscriptionResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when retrieving your subscription, try again.', result: null });
            }
            else {
                next({ success: true, message: 'GetSubscriptionById', result: subscriptionResult });
            }
        });
    }

    var getAllSubscription = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when retrieving your subscriptions, try again.', result: null });
            }
            else {
                next({ success: true, message: 'GetAllSubscription', result: result });
            }
        });
    }

    var getAllSitesOfSubscriptionByUserId = function (data, next) {
        _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }).populate("SitesId").exec(function (err, subscriptionResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when getting your sites, try again.', result: null });
            }
            else {
                if (subscriptionResult !== undefined && subscriptionResult !== null) {
                    if (subscriptionResult.SitesId != undefined && subscriptionResult.SitesId !== null) {
                        next({ success: true, message: 'GetAllSitesOfSubscriptionByUserId', result: subscriptionResult.SitesId });
                    }
                    else {
                        next({ success: false, message: 'You haven\'t sites, create one first', result: null });
                    }
                }
                else {
                    next({ success: false, message: 'You haven\'t sites, create one first', result: null });
                }
            }
        });
    }

    var getAllUsersOfSubscriptionByUserId = function (data, next) {
        _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }).populate("UsersId").exec(function (err, subscriptionResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when getting your sites, try again.', result: null });
            }
            else {
                if (subscriptionResult !== undefined && subscriptionResult !== null) {
                    if (subscriptionResult.SitesId != undefined && subscriptionResult.SitesId !== null) {
                        next({ success: true, message: 'GetAllUsersOfSubscriptionByUserId', result: subscriptionResult.UsersId });
                    }
                    else {
                        next({ success: false, message: 'You haven\'t sites, create one first', result: null });
                    }
                }
                else {
                    next({ success: false, message: 'You haven\'t sites, create one first', result: null });
                }
            }
        });
    }

    var addUserToSubscription = function (data, next) {
        _entity.GetModel().findOneAndUpdate({ "_id": data.SubscriptionId }, { $push: { "UsersId": data.UserId } }, { safe: true, upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when adding your new user, try again.', result: null });
            }
            else {
                next({ success: true, message: 'AddUserToSubscription', result: result });
            }
        });
    }

    var addSiteToSubscription = function (data, next) {
        _entity.GetModel().findOneAndUpdate({ "_id": data.SubscriptionId }, { $push: { "SitesId": data.SiteId } }, { safe: true, upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when adding your new site to your subscription, try again.', result: null });
            }
            else {
                next({ success: true, message: 'AddSiteToSubscription', result: result });
            }
        });
    }

    var checkIfHasNoPaymentMethodByUserId = function (data, next) {
        if (data.UserId != undefined) {
            _entity.GetModel().findOne({ "UsersId": { $elemMatch: { $eq: data.UserId } } }).populate("CreditCard").exec(function (err, subscriptionResult) {
                if (err) {
                    _console.log(err, 'error');

                    next({ success: false, message: 'Something went wrong while retrieving user', result: null });
                }
                else {
                    if (subscriptionResult != undefined && subscriptionResult != null) {
                        if (subscriptionResult.CreditCard.CreditCardToken != undefined && subscriptionResult.CreditCard.CreditCardToken != null && subscriptionResult.CreditCard.CreditCardToken.length > 0) {
                            next({ success: true, message: 'checkIfHasNoPaymentMethodByUserId', result: true });
                        }
                        else {
                            next({ success: true, message: 'checkIfHasNoPaymentMethodByUserId', result: false });
                        }
                    }
                    else {
                        next({ success: false, message: 'Something went wrong while retrieving user', result: null });
                    }
                }
            })
        }
        else {
            next({ success: false, message: 'You must provide an UserId to use this API function', result: null });
        }
    }

    var checkIfCanUseHeatmaps = function (data, next) {//<------- CHANGE FOR SECURE RESULT
        next({ success: true, message: 'CheckIfCanUseHeatmaps', result: true });
        /*_entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != undefined && siteResult != null) {
                    if (siteResult.UsersId != undefined && siteResult.UserId != null) {
                        if (siteResult.UsersId.length > 0) {
                            _database.User().GetUserById(siteResult.UsersId[0], function (userResult) {
                                if (userResult != undefined && userResult != null) {
                                    if (siteResult.Insights.Heatmaps.PageViewsPerMonth <= parseInt(userResult.CurrentPlan.metadata.maxPageviews)) {
                                        next({ success: true, message: 'CheckIfCanUseHeatmaps', result: true });
                                    }
                                    else {
                                        next({ success: true, message: 'CheckIfCanUseHeatmaps', result: false });
                                    }
                                }
                                else {
                                    next({ success: false, message: 'Something went wrong while retrieving data', result: null });
                                }
                            })
                        }
                        else {
                            next({ success: false, message: 'Something went wrong while retrieving data', result: null });
                        }
                    }
                    else {
                        next({ success: false, message: 'Something went wrong while retrieving data', result: null });
                    }
                }
                else {
                    next({ success: false, message: 'Something went wrong while retrieving data', result: null });
                }
            }
        })*/
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
        GetAllUsersOfSubscriptionByUserId: getAllUsersOfSubscriptionByUserId,
        AddUserToSubscription: addUserToSubscription,
        AddSiteToSubscription: addSiteToSubscription,
        CheckIfHasNoPaymentMethodByUserId: checkIfHasNoPaymentMethodByUserId,
        CheckIfCanUseHeatmaps: checkIfCanUseHeatmaps,
        Entity: getEntity
    }
}

module.exports = SubscriptionController;