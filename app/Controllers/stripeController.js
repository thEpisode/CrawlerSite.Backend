function StripeController(dependencies) {

    /// Dependencies   
    var _stripe;
    var _cross;
    var _database;

    /// Configuration
    var stripe_pk = '';

    var constructor = function () {
        _cross = dependencies.cross;
        _database = dependencies.database;

        _stripe_pk = _cross.GetStripePrivateKey();

        _stripe = dependencies.stripe;
    }

    var getStandardPlan = function (callback) {
        _stripe.plans.retrieve(
            "standard",
            function (err, plan) {
                callback(plan);
            })
    }

    var getBasicPlan = function (callback) {
        _stripe.plans.retrieve(
            "basic",
            function (err, plan) {
                callback(plan);
            })
    }

    var getPremiumPlan = function (callback) {
        _stripe.plans.retrieve(
            "premium",
            function (err, plan) {
                if (err) {
                    console.log(err);
                    callback(null);
                }
                callback(plan);
            })
    }

    var getFreePlan = function (callback) {
        _stripe.plans.retrieve(
            "free",
            function (err, plan) {
                callback(plan);
            })
    }

    var getAllPlans = function (callback) {
        _stripe.plans.list(
            { limit: 5 },
            function (err, plans) {
                callback(plans);
            }
        );
    }

    var getPlan = function (planId, callback) {
        switch (planId) {
            case 'standard':
                getStandardPlan(function (result) { callback(result) });
                break;
            case 'basic':
                getBasicPlan(function (result) { callback(result) });
                break;
            case 'premium':
                getPremiumPlan(function (result) { callback(result) });
                break;
            case 'free':
                getFreePlan(function (result) { callback(result) });
                break;
            default:
                callback(null);
        }
    }

    var updateSubscription = function (customerData, callback) {

        // Find in mongo user by email
        _database.User().GetUserByEmail(customerData.Email, function (userResult) {
            if (userResult != null) {
                // if user has not a customer id
                if (userResult.CustomerId.length == 0) {
                    /// Create a customer in Stripe
                    _stripe.customers.create({
                        description: customerData.Description,
                        email: customerData.Email,
                        source: customerData.CustomerId // obtained with Stripe.js
                    }, function (err, customer) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: err, result: null });
                        }
                        //// Create a new subscription
                        getPlan(customerData.Plan, function (plan) {
                            if (plan != undefined && plan != null) {
                                _stripe.subscriptions.create({
                                    customer: customer.id,
                                    plan: plan.id
                                }, function (err, subscription) {
                                    if (err) {
                                        console.log(err);
                                        callback({ success: false, message: err, result: null });
                                    }

                                    //// Save customer on mongo
                                    userResult.CustomerId = customerData.CustomerId;
                                    userResult.PlanId = plan.id;
                                    userResult.SubscriptionId = subscription.id;
                                    userResult.FirstNameCard = customerData.Firstname;
                                    userResult.LastNameCard = customerData.Lastname;

                                    _database.User().UpdatePaymentData(userResult, function (result) {
                                        if (result == null) {
                                            callback({ success: false, message: 'Something went ocurr wrong, try again.', result: result });
                                        }
                                        else {
                                            callback({ success: true, message: 'Payment saved succesfuly', result: result })
                                        }
                                    })
                                });
                            }
                            else {
                                callback({ success: false, message: 'Something went ocurr wrong, try again.', result: result });
                            }
                        });

                    });
                }
                // if exist retrieve the customer
                else {
                    //// Update subscription
                    getPlan(customerData.Plan, function (plan) {
                        if (plan != undefined && plan != null) {
                            _stripe.subscriptions.update(
                                userResult.SubscriptionId,
                                { plan: plan.id },
                                function (err, subscription) {
                                    if (err) {
                                        console.log(err);
                                        callback({ success: false, message: err, result: null });
                                    }

                                    //// Update customer on mongo
                                    userResult.CustomerId = customerData.CustomerId;
                                    userResult.PlanId = plan.id;
                                    userResult.SubscriptionId = subscription.id;
                                    userResult.FirstNameCard = customerData.Firstname;
                                    userResult.LastNameCard = customerData.Lastname;

                                    _database.User().UpdatePaymentData(userResult, function (result) {
                                        if (result == null) {
                                            callback({ success: false, message: 'Something went ocurr wrong, try again.', result: result });
                                        }
                                        else {
                                            callback({ success: true, message: 'Payment saved succesfuly', result: result })
                                        }
                                    })
                                }
                            );
                        }
                        else {
                            callback({ success: false, message: 'Something went ocurr wrong, try again.', result: null });
                        }
                    });
                }
            }
        });
    }

    var cancelSubscription = function (customerData) {
        _database.User().GetUserByEmail(customerData.Email, function (userResult) {
            if (userResult != null) {
                if (userResult.CustomerId != undefined && userResult.CustomerId.length > 0) {
                    _stripe.subscriptions.del(
                        customerData.CustomerId,
                        function (err, confirmation) {
                            //// Update customer on mongo
                            userResult.CustomerId = "";
                            userResult.PlanId = "";
                            userResult.SubscriptionId = '';
                            userResult.FirstNameCard = '';
                            userResult.LastNameCard = '';

                            _database.User().UpdatePaymentData(userResult, function (result) {
                                if (result == null) {
                                    callback({ success: false, message: 'Something went ocurr wrong, try again.', result: result });
                                }
                                else {
                                    callback({ success: true, message: 'Payment saved succesfuly', result: result })
                                }
                            })
                        }
                    );
                }
            }
        })
    }

    return {
        Initialize: constructor,
        GetFreePlan: getFreePlan,
        GetBasicPlan: getBasicPlan,
        GetStandardPlan: getStandardPlan,
        GetPremiumPlan: getPremiumPlan,
        CancelSubscription: cancelSubscription,
        UpdateSubscription: updateSubscription,
        GetAllPlans: getAllPlans,
    }
}

module.exports = StripeController;